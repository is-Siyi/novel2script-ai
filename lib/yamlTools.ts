import yaml from "js-yaml";
import Ajv from "ajv";
import schema from "@/schemas/script.schema.json";
import type { ScriptDocument, ValidationResult } from "./types";

const ajv = new Ajv({ allErrors: true, strict: false });
const validateScript = ajv.compile(schema);

export function toYaml(script: ScriptDocument): string {
  return yaml.dump(script, {
    noRefs: true,
    lineWidth: 120,
    sortKeys: false,
  });
}

export function parseYaml(input: string): unknown {
  return yaml.load(input);
}

export function validateScriptYaml(input: string): ValidationResult {
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
          return `${path}: ${error.message}`;
        }) || ["未知 Schema 校验错误"],
    };
  } catch (error) {
    return {
      valid: false,
      errors: [`YAML 格式错误：${error instanceof Error ? error.message : String(error)}`],
    };
  }
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
