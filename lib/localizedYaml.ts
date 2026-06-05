import type { ContentLanguage } from "./language";

const englishToChineseEntries = [
  ["title", "标题"],
  ["logline", "一句话梗概"],
  ["genre", "题材"],
  ["format", "剧本类型"],
  ["style", "风格"],
  ["detailLevel", "详细程度"],
  ["characters", "角色列表"],
  ["chapters", "章节列表"],
  ["metadata", "元数据"],
  ["sourceChapterCount", "源章节数"],
  ["generatedBy", "生成器"],
  ["schemaVersion", "Schema版本"],
  ["id", "ID"],
  ["name", "姓名"],
  ["role", "角色定位"],
  ["description", "描述"],
  ["motivation", "动机"],
  ["summary", "摘要"],
  ["scenes", "场景列表"],
  ["chapterId", "章节ID"],
  ["location", "地点"],
  ["time", "时间"],
  ["atmosphere", "氛围"],
  ["beats", "节拍"],
  ["type", "节拍类型"],
  ["action", "动作"],
  ["narration", "旁白"],
  ["transition", "转场"],
  ["character", "角色"],
  ["content", "内容"],
] as const;

const beatTypeToChineseEntries = [
  ["action", "动作"],
  ["dialogue", "对白"],
  ["narration", "旁白"],
  ["transition", "转场"],
] as const;

const englishToChineseKey = new Map<string, string>(englishToChineseEntries);
const chineseToEnglishKey = new Map<string, string>(
  englishToChineseEntries.map(([english, chinese]) => [chinese, english])
);
const englishToChineseBeatType = new Map<string, string>(beatTypeToChineseEntries);
const chineseToEnglishBeatType = new Map<string, string>(
  beatTypeToChineseEntries.map(([english, chinese]) => [chinese, english])
);

export function localizeYamlObject(value: unknown, language: ContentLanguage): unknown {
  if (language === "en") return value;
  return mapYamlObject(value, "localize");
}

export function normalizeYamlObject(value: unknown): unknown {
  return mapYamlObject(value, "normalize");
}

function mapYamlObject(value: unknown, mode: "localize" | "normalize", parentKey?: string): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => mapYamlObject(item, mode, parentKey));
  }

  if (!isPlainObject(value)) {
    return mapScalar(value, mode, parentKey);
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      mapKey(key, mode),
      mapYamlObject(item, mode, key),
    ])
  );
}

function mapKey(key: string, mode: "localize" | "normalize"): string {
  if (mode === "localize") return englishToChineseKey.get(key) || key;
  return chineseToEnglishKey.get(key) || key;
}

function mapScalar(value: unknown, mode: "localize" | "normalize", parentKey?: string): unknown {
  if (typeof value !== "string") return value;
  if (parentKey !== "type" && parentKey !== "节拍类型") return value;

  if (mode === "localize") {
    return englishToChineseBeatType.get(value) || value;
  }

  return chineseToEnglishBeatType.get(value) || value;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
