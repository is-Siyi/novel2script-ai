import type { ParsedChapter } from "./types";

export type ContentLanguage = "zh" | "en";

export function detectTextLanguage(text: string): ContentLanguage {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const latinWords = text.match(/[A-Za-z]{2,}/g)?.length || 0;

  return chineseChars >= latinWords ? "zh" : "en";
}

export function detectChapterLanguage(chapters: ParsedChapter[]): ContentLanguage {
  return detectTextLanguage(chapters.map((chapter) => `${chapter.title}\n${chapter.content}`).join("\n"));
}
