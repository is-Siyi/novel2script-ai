import yaml from "js-yaml";
import Ajv2020 from "ajv/dist/2020";
import schema from "@/schemas/script.schema.json";
import type { ContentLanguage } from "./language";
import { localizeYamlObject, normalizeYamlObject } from "./localizedYaml";
import type { ScriptDocument, ValidationResult } from "./types";

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validateScript = ajv.compile(schema);

export function toYaml(script: ScriptDocument, language: ContentLanguage = "en"): string {
  return yaml.dump(localizeYamlObject(script, language), {
    noRefs: true,
    lineWidth: 120,
    sortKeys: false,
  });
}

export function parseYaml(input: string): unknown {
  return normalizeYamlObject(yaml.load(input));
}

export function validateScriptYaml(input: string, language = inferYamlLanguage(input)): ValidationResult {
  try {
    const parsed = parseYaml(input);
    const valid = validateScript(parsed);

    if (valid) {
      return { valid: true, errors: [] };
    }

    return {
      valid: false,
      errors:
        validateScript.errors?.map((error) => {
          const path = error.instancePath || "/";
          return `${formatErrorPath(path, language)}: ${formatErrorMessage(error.message || "", language)}`;
        }) || [language === "zh" ? "未知 Schema 校验错误" : "Unknown schema validation error"],
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        language === "zh"
          ? `YAML 格式错误：${error instanceof Error ? error.message : String(error)}`
          : `YAML syntax error: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

function inferYamlLanguage(input: string): ContentLanguage {
  return /(^|\n)\s*(标题|一句话梗概|题材|角色列表|章节列表|场景列表|节拍)\s*:/u.test(input)
    ? "zh"
    : "en";
}

function formatErrorPath(path: string, language: ContentLanguage): string {
  if (language === "en") return path;

  return localizeSchemaText(path);
}

function formatErrorMessage(message: string, language: ContentLanguage): string {
  if (language === "en") return message;
  return localizeSchemaText(message);
}

function localizeSchemaText(text: string): string {
  return text
    .replace(/title/g, "标题")
    .replace(/logline/g, "一句话梗概")
    .replace(/genre/g, "题材")
    .replace(/detailLevel/g, "详细程度")
    .replace(/characters/g, "角色列表")
    .replace(/chapters/g, "章节列表")
    .replace(/scenes/g, "场景列表")
    .replace(/metadata/g, "元数据")
    .replace(/location/g, "地点")
    .replace(/time/g, "时间")
    .replace(/atmosphere/g, "氛围")
    .replace(/summary/g, "摘要")
    .replace(/beats/g, "节拍")
    .replace(/action/g, "动作")
    .replace(/dialogue/g, "对白")
    .replace(/narration/g, "旁白")
    .replace(/transition/g, "转场")
    .replace(/character/g, "角色")
    .replace(/content/g, "内容");
}

export function scriptToMarkdown(script: ScriptDocument): string {
  const lines: string[] = [
    `# ${script.title}`,
    "",
    `> ${script.logline}`,
    "",
    `- 类型：${script.format}`,
    `- 风格：${script.style}`,
    `- 详细程度：${script.detailLevel}`,
    "",
    "## 角色",
    "",
    ...script.characters.map(
      (character) =>
        `- **${character.name}**（${character.role}）：${character.description} 动机：${character.motivation}`
    ),
    "",
    "## 剧本正文",
  ];

  script.chapters.forEach((chapter) => {
    lines.push("", `### ${chapter.title}`, "", chapter.summary);

    chapter.scenes.forEach((scene) => {
      lines.push(
        "",
        `#### ${scene.title}`,
        "",
        `- 地点：${scene.location}`,
        `- 时间：${scene.time}`,
        `- 氛围：${scene.atmosphere}`,
        "",
        scene.summary,
        ""
      );

      scene.beats.forEach((beat) => {
        if (beat.type === "dialogue") {
          lines.push(`- **${beat.character}**：${beat.content}`);
        } else if (beat.type === "action") {
          lines.push(`- 动作：${beat.action}`);
        } else if (beat.type === "narration") {
          lines.push(`- 旁白：${beat.narration}`);
        } else {
          lines.push(`- 转场：${beat.transition}`);
        }
      });
    });
  });

  return lines.join("\n");
}
