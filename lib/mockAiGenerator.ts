import type {
  GenerationConfig,
  ParsedChapter,
  ScriptBeat,
  ScriptCharacter,
  ScriptDocument,
  ScriptScene,
} from "./types";
import type { ContentLanguage } from "./language";
import { detectChapterLanguage } from "./language";
import { summarizeText } from "./novelParser";

const defaultLocations: Record<ContentLanguage, string[]> = {
  zh: ["旧书店", "雨夜街口", "天台", "排练厅", "城郊车站"],
  en: ["Old bookshop", "Rainy street corner", "Rooftop", "Rehearsal hall", "Suburban station"],
};
const defaultTimes: Record<ContentLanguage, string[]> = {
  zh: ["清晨", "午后", "黄昏", "深夜"],
  en: ["Morning", "Afternoon", "Dusk", "Late night"],
};
const atmosphereByStyle: Record<ContentLanguage, Record<string, string[]>> = {
  zh: {
    现实主义: ["克制", "生活化", "压抑后透出希望"],
    悬疑: ["紧张", "不安", "暗流涌动"],
    喜剧: ["轻快", "误会频出", "温暖"],
    青春: ["明亮", "躁动", "真诚"],
    古风: ["含蓄", "风雅", "宿命感"],
  },
  en: {
    现实主义: ["restrained", "grounded", "hopeful under pressure"],
    悬疑: ["tense", "uneasy", "charged with hidden currents"],
    喜剧: ["light", "full of misunderstandings", "warm"],
    青春: ["bright", "restless", "sincere"],
    古风: ["elegant", "reserved", "touched by fate"],
  },
};
const englishStyleLabels: Record<string, string> = {
  现实主义: "realist",
  悬疑: "suspense",
  喜剧: "comedic",
  青春: "coming-of-age",
  古风: "period-inspired",
};
const englishFormatLabels: Record<string, string> = {
  影视剧: "screenplay",
  短剧: "short drama",
  舞台剧: "stage play",
  分镜脚本: "shot list script",
};

export function mockAiGenerateScript(
  chapters: ParsedChapter[],
  config: GenerationConfig
): ScriptDocument {
  const language = detectChapterLanguage(chapters);
  const title = inferTitle(chapters, language);
  const characters = inferCharacters(chapters, language);

  return {
    title,
    logline: buildLogline(chapters, config.style, language),
    genre:
      language === "zh"
        ? `${config.style}${config.scriptType}`
        : `${englishStyleLabels[config.style] || "dramatic"} ${englishFormatLabels[config.scriptType] || "script"}`,
    format: config.scriptType,
    style: config.style,
    detailLevel: config.detailLevel,
    characters,
    chapters: chapters.map((chapter, chapterIndex) => ({
      id: chapter.id,
      title: chapter.title,
      summary: chapter.summary,
      scenes: buildScenes(chapter, chapterIndex, characters, config, language),
    })),
    metadata: {
      sourceChapterCount: chapters.length,
      generatedBy: "mockAiGenerator",
      schemaVersion: "1.0.0",
    },
  };
}

function inferTitle(chapters: ParsedChapter[], language: ContentLanguage): string {
  const firstTitle = chapters[0]?.title || (language === "zh" ? "未命名小说" : "Untitled Novel");
  const cleanedTitle =
    language === "zh"
      ? firstTitle.replace(/^第.+?[章节回幕]\s*/, "")
      : firstTitle.replace(/^Chapter\s+[0-9]+[:.\-\s]*/i, "");
  return cleanedTitle || (language === "zh" ? "Novel2Script 剧本初稿" : "Novel2Script Script Draft");
}

function buildLogline(chapters: ParsedChapter[], style: string, language: ContentLanguage): string {
  const protagonist = inferCharacters(chapters, language)[0]?.name || (language === "zh" ? "主角" : "Protagonist");
  const firstConflict =
    chapters[0]?.summary ||
    (language === "zh" ? "一个未完成的愿望被重新点燃" : "an unfinished desire is reignited");
  if (language === "en") {
    return `${protagonist} faces a defining choice in a ${englishStyleLabels[style] || "dramatic"} story: ${firstConflict}`;
  }

  return `${protagonist}在${style}气质的故事中面对关键选择：${firstConflict}`;
}

function inferCharacters(chapters: ParsedChapter[], language: ContentLanguage): ScriptCharacter[] {
  const text = chapters.map((chapter) => chapter.content).join("\n");
  const knownNameCandidates = ["林夏", "顾川", "周明", "陈舟", "沈安", "陆远", "苏晴"];
  const explicitNames = knownNameCandidates.filter((name) => text.includes(name));
  const dialogueNames = Array.from(text.matchAll(/(?:^|[。！？\n])\s*([一-龥]{2,3})(?:说|问|喊|低声说|笑道)/g)).map(
    (match) => match[1]
  );
  const englishDialogueNames = Array.from(
    text.matchAll(/\b([A-Z][a-z]{1,20}(?:\s+[A-Z][a-z]{1,20})?)\s+(?:said|asked|shouted|whispered|replied)\b/g)
  ).map((match) => match[1]);
  const blacklist = ["如果", "对我", "愤怒", "开始", "真正", "最后", "里面", "这些"];
  const candidates = language === "zh" ? [...explicitNames, ...dialogueNames] : englishDialogueNames;
  const uniqueNames = Array.from(new Set(candidates))
    .filter((name) => !blacklist.some((word) => name.includes(word)))
    .slice(0, 4);
  const names = completeCharacterNames(uniqueNames, language);

  return names.slice(0, 4).map((name, index) => ({
    id: `char-${index + 1}`,
    name,
    role:
      language === "zh"
        ? index === 0
          ? "主角"
          : index === 1
            ? "关键关系人物"
            : "推动情节的人物"
        : index === 0
          ? "Protagonist"
          : index === 1
            ? "Key relationship figure"
            : "Story catalyst",
    description:
      language === "zh"
        ? index === 0
          ? "在故事核心矛盾中做出选择的人。"
          : "帮助主角暴露内心需求和外部阻力的人。"
        : index === 0
          ? "The person who makes a choice inside the central conflict."
          : "A figure who reveals the protagonist's need and external resistance.",
    motivation:
      language === "zh"
        ? index === 0
          ? "找到改变现状的方法。"
          : "守住自己的秘密、关系或目标。"
        : index === 0
          ? "Find a way to change the current situation."
          : "Protect a secret, relationship, or personal goal.",
  }));
}

function completeCharacterNames(names: string[], language: ContentLanguage): string[] {
  const fallbackNames =
    language === "zh"
      ? names.length === 0
        ? ["主角", "关键人物", "反对者", "见证者"]
        : ["关键人物", "反对者", "见证者"]
      : names.length === 0
        ? ["Protagonist", "Key Figure", "Opponent", "Witness"]
        : ["Key Figure", "Opponent", "Witness"];
  const unusedFallbacks = fallbackNames.filter((name) => !names.includes(name));
  const missingCount = Math.max(2 - names.length, 0);

  return [...names, ...unusedFallbacks.slice(0, missingCount)];
}

function buildScenes(
  chapter: ParsedChapter,
  chapterIndex: number,
  characters: ScriptCharacter[],
  config: GenerationConfig,
  language: ContentLanguage
): ScriptScene[] {
  const sceneCount = config.detailLevel === "简版" ? 1 : config.detailLevel === "标准版" ? 2 : 3;
  const segments = splitIntoSegments(chapter.content, sceneCount);

  return segments.map((segment, sceneIndex) => {
    const sceneId = `scene-${chapterIndex + 1}-${sceneIndex + 1}`;
    const summary = summarizeText(segment, 110);

    return {
      id: sceneId,
      chapterId: chapter.id,
      title:
        language === "zh"
          ? `${chapter.title} - 场景 ${sceneIndex + 1}`
          : `${chapter.title} - Scene ${sceneIndex + 1}`,
      location: defaultLocations[language][(chapterIndex + sceneIndex) % defaultLocations[language].length],
      time: defaultTimes[language][(chapterIndex + sceneIndex) % defaultTimes[language].length],
      atmosphere:
        atmosphereByStyle[language][config.style]?.[
          (chapterIndex + sceneIndex) % atmosphereByStyle[language][config.style].length
        ] || (language === "zh" ? "戏剧张力逐步增强" : "dramatic tension builds"),
      summary,
      beats: buildBeats(summary, characters, sceneIndex, config.scriptType, language),
    };
  });
}

function splitIntoSegments(content: string, count: number): string[] {
  const sentences = content.split(/(?<=[。！？.!?])/).filter((item) => item.trim());
  if (sentences.length <= count) return [content];

  const size = Math.ceil(sentences.length / count);
  return Array.from({ length: count }, (_, index) =>
    sentences.slice(index * size, (index + 1) * size).join("").trim()
  ).filter(Boolean);
}

function buildBeats(
  summary: string,
  characters: ScriptCharacter[],
  sceneIndex: number,
  scriptType: string,
  language: ContentLanguage
): ScriptBeat[] {
  const lead = characters[0]?.name || (language === "zh" ? "主角" : "Protagonist");
  const partner = characters[1]?.name || (language === "zh" ? "对手" : "Opponent");
  const visualPrefix = scriptType === "分镜脚本" ? (language === "zh" ? "镜头推进：" : "Camera push: ") : "";

  return [
    {
      type: "action",
      action:
        language === "zh"
          ? `${visualPrefix}${lead}进入场景，观察周围变化。`
          : `${visualPrefix}${lead} enters the scene and studies the change around them.`,
    },
    {
      type: "dialogue",
      character: lead,
      content:
        language === "zh"
          ? sceneIndex % 2 === 0
            ? "这件事不能再拖了。"
            : "我需要知道真相。"
          : sceneIndex % 2 === 0
            ? "We cannot delay this any longer."
            : "I need to know the truth.",
    },
    {
      type: "dialogue",
      character: partner,
      content:
        language === "zh"
          ? "如果你继续往前走，就必须承担后果。"
          : "If you keep going, you will have to face the consequences.",
    },
    {
      type: "narration",
      narration: summary,
    },
    {
      type: "transition",
      transition:
        language === "zh"
          ? sceneIndex % 2 === 0
            ? "切至下一场"
            : "淡出"
          : sceneIndex % 2 === 0
            ? "Cut to next scene"
            : "Fade out",
    },
  ];
}
