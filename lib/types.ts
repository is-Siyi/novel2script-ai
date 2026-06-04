export type ScriptType = "影视剧" | "短剧" | "舞台剧" | "分镜脚本";

export type ScriptStyle = "现实主义" | "悬疑" | "喜剧" | "青春" | "古风";

export type DetailLevel = "简版" | "标准版" | "详细版";

export type BeatType = "action" | "dialogue" | "narration" | "transition";

export interface ParsedChapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  summary: string;
}

export interface GenerationConfig {
  scriptType: ScriptType;
  style: ScriptStyle;
  detailLevel: DetailLevel;
}

export interface ScriptCharacter {
  id: string;
  name: string;
  role: string;
  description: string;
  motivation: string;
}

export interface ScriptBeat {
  type: BeatType;
  action?: string;
  character?: string;
  content?: string;
  narration?: string;
  transition?: string;
}

export interface ScriptScene {
  id: string;
  chapterId: string;
  title: string;
  location: string;
  time: string;
  atmosphere: string;
  summary: string;
  beats: ScriptBeat[];
}

export interface ScriptChapter {
  id: string;
  title: string;
  summary: string;
  scenes: ScriptScene[];
}

export interface ScriptDocument {
  title: string;
  logline: string;
  genre: string;
  format: ScriptType;
  style: ScriptStyle;
  detailLevel: DetailLevel;
  characters: ScriptCharacter[];
  chapters: ScriptChapter[];
  metadata: {
    sourceChapterCount: number;
    generatedBy: string;
    schemaVersion: string;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
