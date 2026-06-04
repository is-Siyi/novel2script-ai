"use client";

import { useMemo, useState } from "react";
import { parseNovelChapters } from "@/lib/novelParser";
import { mockAiGenerateScript } from "@/lib/mockAiGenerator";
import { downloadTextFile } from "@/lib/download";
import { parseYaml, scriptToMarkdown, toYaml, validateScriptYaml } from "@/lib/yamlTools";
import { sampleNovel } from "@/lib/sampleData";
import type { DetailLevel, GenerationConfig, ScriptDocument, ScriptStyle, ScriptType } from "@/lib/types";

const scriptTypes: ScriptType[] = ["影视剧", "短剧", "舞台剧", "分镜脚本"];
const styles: ScriptStyle[] = ["现实主义", "悬疑", "喜剧", "青春", "古风"];
const detailLevels: DetailLevel[] = ["简版", "标准版", "详细版"];

const flowItems = ["上传小说", "AI 拆解", "生成 YAML", "Schema 校验", "在线编辑", "导出"];

export function Novel2ScriptApp() {
  const [novelText, setNovelText] = useState("");
  const [config, setConfig] = useState<GenerationConfig>({
    scriptType: "影视剧",
    style: "悬疑",
    detailLevel: "标准版",
  });
  const [yamlText, setYamlText] = useState("");
  const [script, setScript] = useState<ScriptDocument | null>(null);
  const [copied, setCopied] = useState(false);

  const chapters = useMemo(() => parseNovelChapters(novelText), [novelText]);
  const validation = useMemo(() => (yamlText ? validateScriptYaml(yamlText) : null), [yamlText]);
  const canGenerate = chapters.length >= 3;

  function loadExample() {
    setNovelText(sampleNovel);
    setYamlText("");
    setScript(null);
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      alert("请上传 .txt 或 .md 文件");
      return;
    }

    setNovelText(await file.text());
    setYamlText("");
    setScript(null);
  }

  function generateScript() {
    if (!canGenerate) return;
    const generated = mockAiGenerateScript(chapters, config);
    setScript(generated);
    setYamlText(toYaml(generated));
    setCopied(false);
  }

  function validateAndSync() {
    const result = validateScriptYaml(yamlText);
    if (!result.valid) return;
    const parsed = parseYaml(yamlText) as ScriptDocument;
    setScript(parsed);
  }

  async function copyYaml() {
    await navigator.clipboard.writeText(yamlText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function exportMarkdown() {
    const source = script || (validation?.valid ? (parseYaml(yamlText) as ScriptDocument) : null);
    if (!source) return;
    downloadTextFile("novel2script-script.md", scriptToMarkdown(source), "text/markdown;charset=utf-8");
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-accent">Novel2Script AI</p>
            <h1 className="mt-2 text-4xl font-black tracking-normal text-ink sm:text-6xl">
              Novel2Script AI
            </h1>
            <p className="mt-4 text-lg text-muted">面向小说作者的 AI 剧本改编助手</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="#workspace"
              className="rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
            >
              开始体验
            </a>
            <button
              type="button"
              onClick={loadExample}
              className="rounded-lg border border-line bg-paper px-5 py-3 text-sm font-bold text-ink transition hover:bg-white"
            >
              加载示例小说
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-6">
          {flowItems.map((item, index) => (
            <div key={item} className="rounded-lg border border-line bg-paper px-4 py-3">
              <span className="text-xs font-bold text-berry">0{index + 1}</span>
              <p className="mt-1 text-sm font-bold text-ink">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="workspace" className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-6">
          <Panel title="小说输入">
            <div className="space-y-4">
              <textarea
                value={novelText}
                onChange={(event) => {
                  setNovelText(event.target.value);
                  setScript(null);
                  setYamlText("");
                }}
                placeholder="粘贴至少 3 个章节的小说文本，例如：第一章、第1章、Chapter 1..."
                className="min-h-72 w-full resize-y rounded-lg border border-line bg-white p-4 text-sm leading-7 outline-none focus:border-accent focus:ring-4 focus:ring-teal-100"
              />
              <label className="block rounded-lg border border-dashed border-line bg-paper p-4 text-sm font-medium text-muted">
                上传 .txt 或 .md 文件
                <input
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  onChange={(event) => handleUpload(event.target.files?.[0])}
                  className="mt-3 block w-full text-sm"
                />
              </label>
              {!canGenerate && novelText && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  当前识别到 {chapters.length} 个章节。请提供至少 3 个章节后再生成剧本。
                </p>
              )}
            </div>
          </Panel>

          <Panel title="生成配置">
            <div className="grid gap-4">
              <SelectField
                label="剧本类型"
                value={config.scriptType}
                options={scriptTypes}
                onChange={(value) => setConfig((prev) => ({ ...prev, scriptType: value as ScriptType }))}
              />
              <SelectField
                label="风格"
                value={config.style}
                options={styles}
                onChange={(value) => setConfig((prev) => ({ ...prev, style: value as ScriptStyle }))}
              />
              <SelectField
                label="输出详细程度"
                value={config.detailLevel}
                options={detailLevels}
                onChange={(value) => setConfig((prev) => ({ ...prev, detailLevel: value as DetailLevel }))}
              />
              <button
                type="button"
                disabled={!canGenerate}
                onClick={generateScript}
                className="rounded-lg bg-berry px-4 py-3 text-sm font-bold text-white transition hover:bg-rose-900 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                生成结构化剧本 YAML
              </button>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="章节识别">
            {chapters.length === 0 ? (
              <EmptyState text="粘贴或上传小说后，这里会显示章节列表、字数和摘要。" />
            ) : (
              <div className="grid gap-3">
                {chapters.map((chapter) => (
                  <article key={chapter.id} className="rounded-lg border border-line bg-paper p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-ink">{chapter.title}</h3>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted">
                        {chapter.wordCount} 字
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{chapter.summary}</p>
                  </article>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="YAML 编辑器与 Schema 校验"
            action={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!yamlText}
                  onClick={validateAndSync}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-bold text-ink disabled:opacity-50"
                >
                  重新校验
                </button>
                <button
                  type="button"
                  disabled={!yamlText}
                  onClick={copyYaml}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-bold text-ink disabled:opacity-50"
                >
                  {copied ? "已复制" : "复制 YAML"}
                </button>
                <button
                  type="button"
                  disabled={!yamlText}
                  onClick={() => downloadTextFile("novel2script-script.yaml", yamlText, "text/yaml;charset=utf-8")}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-bold text-ink disabled:opacity-50"
                >
                  导出 YAML
                </button>
                <button
                  type="button"
                  disabled={!script && !validation?.valid}
                  onClick={exportMarkdown}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-xs font-bold text-ink disabled:opacity-50"
                >
                  导出 Markdown
                </button>
              </div>
            }
          >
            <textarea
              value={yamlText}
              onChange={(event) => setYamlText(event.target.value)}
              placeholder="生成剧本后，这里会显示可编辑的 YAML。"
              className="min-h-[520px] w-full resize-y rounded-lg border border-line bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-accent focus:ring-4 focus:ring-teal-100"
            />
            <div className="mt-4">
              {!yamlText ? (
                <EmptyState text="尚未生成 YAML。" />
              ) : validation?.valid ? (
                <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                  校验通过：YAML 格式正确，并符合剧本 Schema。
                </p>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <p className="font-bold">校验失败</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {validation?.errors.map((error) => <li key={error}>{error}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-panel">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-black text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-ink">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-line bg-white px-3 py-3 font-medium outline-none focus:border-accent focus:ring-4 focus:ring-teal-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-paper p-6 text-center text-sm text-muted">
      {text}
    </div>
  );
}
