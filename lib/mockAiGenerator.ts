import type {
  GenerationConfig,
  ParsedChapter,
  ScriptBeat,
  ScriptCharacter,
  ScriptDocument,
  ScriptScene,
} from "./types";
import { summarizeText } from "./novelParser";

const defaultLocations = ["旧书店", "雨夜街口", "天台", "排练厅", "城郊车站"];
const defaultTimes = ["清晨", "午后", "黄昏", "深夜"];
const atmosphereByStyle: Record<string, string[]> = {
  现实主义: ["克制", "生活化", "压抑后透出希望"],
  悬疑: ["紧张", "不安", "暗流涌动"],
  喜剧: ["轻快", "误会频出", "温暖"],
  青春: ["明亮", "躁动", "真诚"],
  古风: ["含蓄", "风雅", "宿命感"],
};

export function mockAiGenerateScript(
  chapters: ParsedChapter[],
  config: GenerationConfig
): ScriptDocument {
  const title = inferTitle(chapters);
  const characters = inferCharacters(chapters);

  return {
    title,
    logline: buildLogline(chapters, config.style),
    genre: `${config.style}${config.scriptType}`,
    format: config.scriptType,
    style: config.style,
    detailLevel: config.detailLevel,
    characters,
    chapters: chapters.map((chapter, chapterIndex) => ({
      id: chapter.id,
      title: chapter.title,
      summary: chapter.summary,
      scenes: buildScenes(chapter, chapterIndex, characters, config),
    })),
    metadata: {
      sourceChapterCount: chapters.length,
      generatedBy: "mockAiGenerator",
      schemaVersion: "1.0.0",
    },
  };
}

function inferTitle(chapters: ParsedChapter[]): string {
  const firstTitle = chapters[0]?.title || "未命名小说";
  return firstTitle.replace(/^第.+?[章节回幕]\s*/, "") || "Novel2Script 剧本初稿";
}

function buildLogline(chapters: ParsedChapter[], style: string): string {
  const protagonist = inferCharacters(chapters)[0]?.name || "主角";
  const firstConflict = chapters[0]?.summary || "一个未完成的愿望被重新点燃";
  return `${protagonist}在${style}气质的故事中面对关键选择：${firstConflict}`;
}

function inferCharacters(chapters: ParsedChapter[]): ScriptCharacter[] {
  const text = chapters.map((chapter) => chapter.content).join("\n");
  const knownNameCandidates = ["林夏", "顾川", "周明", "陈舟", "沈安", "陆远", "苏晴"];
  const explicitNames = knownNameCandidates.filter((name) => text.includes(name));
  const dialogueNames = Array.from(text.matchAll(/(?:^|[。！？\n])\s*([一-龥]{2,3})(?:说|问|喊|低声说|笑道)/g)).map(
    (match) => match[1]
  );
  const blacklist = ["如果", "对我", "愤怒", "开始", "真正", "最后", "里面", "这些"];
  const uniqueNames = Array.from(new Set([...explicitNames, ...dialogueNames]))
    .filter((name) => !blacklist.some((word) => name.includes(word)))
    .slice(0, 4);
  const names = completeCharacterNames(uniqueNames);

  return names.slice(0, 4).map((name, index) => ({
    id: `char-${index + 1}`,
    name,
    role: index === 0 ? "主角" : index === 1 ? "关键关系人物" : "推动情节的人物",
    description:
      index === 0
        ? "在故事核心矛盾中做出选择的人。"
        : "帮助主角暴露内心需求和外部阻力的人。",
    motivation:
      index === 0
        ? "找到改变现状的方法。"
        : "守住自己的秘密、关系或目标。",
  }));
}

function completeCharacterNames(names: string[]): string[] {
  const fallbackNames = names.length === 0
    ? ["主角", "关键人物", "反对者", "见证者"]
    : ["关键人物", "反对者", "见证者"];
  const unusedFallbacks = fallbackNames.filter((name) => !names.includes(name));
  const missingCount = Math.max(2 - names.length, 0);

  return [...names, ...unusedFallbacks.slice(0, missingCount)];
}

function buildScenes(
  chapter: ParsedChapter,
  chapterIndex: number,
  characters: ScriptCharacter[],
  config: GenerationConfig
): ScriptScene[] {
  const sceneCount = config.detailLevel === "简版" ? 1 : config.detailLevel === "标准版" ? 2 : 3;
  const segments = splitIntoSegments(chapter.content, sceneCount);

  return segments.map((segment, sceneIndex) => {
    const sceneId = `scene-${chapterIndex + 1}-${sceneIndex + 1}`;
    const summary = summarizeText(segment, 110);

    return {
      id: sceneId,
      chapterId: chapter.id,
      title: `${chapter.title} - 场景 ${sceneIndex + 1}`,
      location: defaultLocations[(chapterIndex + sceneIndex) % defaultLocations.length],
      time: defaultTimes[(chapterIndex + sceneIndex) % defaultTimes.length],
      atmosphere:
        atmosphereByStyle[config.style]?.[
          (chapterIndex + sceneIndex) % atmosphereByStyle[config.style].length
        ] || "戏剧张力逐步增强",
      summary,
      beats: buildBeats(summary, characters, sceneIndex, config.scriptType),
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
  scriptType: string
): ScriptBeat[] {
  const lead = characters[0]?.name || "主角";
  const partner = characters[1]?.name || "对手";
  const visualPrefix = scriptType === "分镜脚本" ? "镜头推进：" : "";

  return [
    {
      type: "action",
      action: `${visualPrefix}${lead}进入场景，观察周围变化。`,
    },
    {
      type: "dialogue",
      character: lead,
      content: sceneIndex % 2 === 0 ? "这件事不能再拖了。" : "我需要知道真相。",
    },
    {
      type: "dialogue",
      character: partner,
      content: "如果你继续往前走，就必须承担后果。",
    },
    {
      type: "narration",
      narration: summary,
    },
    {
      type: "transition",
      transition: sceneIndex % 2 === 0 ? "切至下一场" : "淡出",
    },
  ];
}
