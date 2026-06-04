import type { ParsedChapter } from "./types";

const chapterTitlePattern =
  /(^|\n)\s*((第[零〇一二三四五六七八九十百千万0-9]+[章节回幕][^\n]*)|(Chapter\s+[0-9]+[^\n]*)|([0-9]+\.\s*[^\n]{1,40}))\s*(?=\n|$)/gi;

export function parseNovelChapters(rawText: string): ParsedChapter[] {
  const normalized = rawText.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const matches = Array.from(normalized.matchAll(chapterTitlePattern));

  if (matches.length === 0) {
    return [
      buildChapter("chapter-1", "未识别章节", normalized),
    ];
  }

  return matches
    .map((match, index) => {
      const title = (match[2] || `第 ${index + 1} 章`).trim();
      const start = (match.index || 0) + match[0].length;
      const end = matches[index + 1]?.index ?? normalized.length;
      const content = normalized.slice(start, end).trim();

      return buildChapter(`chapter-${index + 1}`, title, content);
    })
    .filter((chapter) => chapter.content.length > 0);
}

export function summarizeText(text: string, maxLength = 90): string {
  const compact = text.replace(/\s+/g, " ").trim();
  const sentence = compact.split(/[。！？.!?]/).find(Boolean) || compact;
  return sentence.length > maxLength ? `${sentence.slice(0, maxLength)}...` : sentence;
}

function buildChapter(id: string, title: string, content: string): ParsedChapter {
  return {
    id,
    title,
    content,
    wordCount: countWords(content),
    summary: summarizeText(content),
  };
}

function countWords(text: string): number {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g)?.length || 0;
  const englishWords = text.match(/[A-Za-z0-9]+/g)?.length || 0;
  return chineseChars + englishWords;
}
