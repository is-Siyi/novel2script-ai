"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Braces,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileDown,
  FileText,
  Layers3,
  Play,
  RefreshCw,
  Sparkles,
  UploadCloud,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { detectTextLanguage } from "@/lib/language";
import { parseNovelChapters } from "@/lib/novelParser";
import { mockAiGenerateScript } from "@/lib/mockAiGenerator";
import { downloadTextFile } from "@/lib/download";
import { parseYaml, scriptToMarkdown, toYaml, validateScriptYaml } from "@/lib/yamlTools";
import { sampleNovel } from "@/lib/sampleData";
import type { DetailLevel, GenerationConfig, ScriptDocument, ScriptStyle, ScriptType } from "@/lib/types";

const scriptTypes: ScriptType[] = ["影视剧", "短剧", "舞台剧", "分镜脚本"];
const styles: ScriptStyle[] = ["现实主义", "悬疑", "喜剧", "青春", "古风"];
const detailLevels: DetailLevel[] = ["简版", "标准版", "详细版"];

const flowItems: Array<{ label: string; Icon: LucideIcon }> = [
  { label: "上传小说", Icon: UploadCloud },
  { label: "AI 拆解", Icon: Sparkles },
  { label: "生成 YAML", Icon: Braces },
  { label: "Schema 校验", Icon: CheckCircle2 },
  { label: "在线编辑", Icon: FileText },
  { label: "导出", Icon: Download },
];

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
  const sourceLanguage = useMemo(() => detectTextLanguage(novelText), [novelText]);
  const validation = useMemo(
    () => (yamlText ? validateScriptYaml(yamlText, sourceLanguage) : null),
    [sourceLanguage, yamlText]
  );
  const canGenerate = chapters.length >= 3;
  const totalWordCount = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0);
  const sceneCount =
    script?.chapters.reduce((sum, chapter) => sum + chapter.scenes.length, 0) || 0;

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
    setYamlText(toYaml(generated, sourceLanguage));
    setCopied(false);
  }

  function validateAndSync() {
    const result = validateScriptYaml(yamlText, sourceLanguage);
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
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lift">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-6 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-bold uppercase text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              Novel2Script AI
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-normal text-ink sm:text-6xl">
              Novel2Script AI
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              面向小说作者的 AI 剧本改编助手，把小说快速转换为可编辑、可校验、可导出的结构化剧本 YAML。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#workspace"
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white shadow-panel transition hover:-translate-y-0.5 hover:bg-teal-800"
              >
                <Play className="h-4 w-4" />
                开始体验
              </a>
              <button
                type="button"
                onClick={loadExample}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
              >
                <BookOpen className="h-4 w-4" />
                加载示例小说
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-navy p-6 text-white lg:border-l lg:border-t-0 sm:p-8">
            <p className="text-sm font-bold text-teal-200">当前工作台状态</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric label="章节" value={chapters.length || "-"} />
              <Metric label="字数" value={totalWordCount || "-"} />
              <Metric label="场景" value={sceneCount || "-"} />
            </div>
            <div className="mt-6 rounded-lg border border-white/10 bg-white/10 p-4">
              <p className="text-xs font-bold uppercase text-teal-200">Validation</p>
              <div className="mt-3 flex items-center gap-2 text-sm font-bold">
                {validation?.valid ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    YAML 已通过 Schema 校验
                  </>
                ) : yamlText ? (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-300" />
                    YAML 需要修正后再导出
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 text-slate-300" />
                    等待生成剧本 YAML
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid border-t border-slate-200 bg-slate-50/80 md:grid-cols-6">
          {flowItems.map(({ label, Icon }, index) => (
            <div key={label} className="flex items-center gap-3 border-slate-200 px-4 py-4 md:border-r md:last:border-r-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-accent shadow-sm">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <span className="text-xs font-black text-berry">0{index + 1}</span>
                <p className="text-sm font-bold text-ink">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="workspace" className="grid gap-6 lg:grid-cols-[430px_1fr]">
        <div className="flex flex-col gap-6">
          <Panel title="小说输入" description="粘贴正文或上传 Markdown / TXT 文件，系统会自动拆分章节。">
            <div className="space-y-4">
              <textarea
                value={novelText}
                onChange={(event) => {
                  setNovelText(event.target.value);
                  setScript(null);
                  setYamlText("");
                }}
                placeholder="粘贴至少 3 个章节的小说文本，例如：第一章、第1章、Chapter 1..."
                className="min-h-72 w-full resize-y rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7 text-ink outline-none transition placeholder:text-slate-400 focus:border-accent focus:ring-4 focus:ring-teal-100"
              />
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-bold text-muted transition hover:border-accent hover:bg-teal-50/50">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-accent shadow-sm">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <span className="grid gap-1">
                  上传 .txt 或 .md 文件
                  <span className="text-xs font-medium text-slate-500">支持纯文本和 Markdown 小说草稿</span>
                </span>
                <input
                  type="file"
                  accept=".txt,.md,text/plain,text/markdown"
                  onChange={(event) => handleUpload(event.target.files?.[0])}
                  className="sr-only"
                />
              </label>
              {!canGenerate && novelText && (
                <p className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-800">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>当前识别到 {chapters.length} 个章节。请提供至少 3 个章节后再生成剧本。</span>
                </p>
              )}
            </div>
          </Panel>

          <Panel title="生成配置" description="控制剧本体裁、改编风格和生成颗粒度。">
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
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-berry px-4 py-3 text-sm font-bold text-white shadow-panel transition hover:-translate-y-0.5 hover:bg-rose-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none disabled:hover:translate-y-0"
              >
                <Wand2 className="h-4 w-4" />
                生成结构化剧本 YAML
              </button>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="章节识别" description="实时展示章节数量、每章字数和自动摘要。">
            {chapters.length === 0 ? (
              <EmptyState text="粘贴或上传小说后，这里会显示章节列表、字数和摘要。" />
            ) : (
              <div className="grid gap-3">
                {chapters.map((chapter) => (
                  <article key={chapter.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 font-bold text-ink">
                        <Layers3 className="h-4 w-4 text-accent" />
                        {chapter.title}
                      </h3>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-muted">
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
            description={`生成结果可直接编辑，字段语言会跟随小说语言自动切换为${sourceLanguage === "zh" ? "中文" : "English"}。`}
            action={
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!yamlText}
                  onClick={validateAndSync}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  重新校验
                </button>
                <button
                  type="button"
                  disabled={!yamlText}
                  onClick={copyYaml}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  {copied ? "已复制" : "复制 YAML"}
                </button>
                <button
                  type="button"
                  disabled={!yamlText}
                  onClick={() => downloadTextFile("novel2script-script.yaml", yamlText, "text/yaml;charset=utf-8")}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  导出 YAML
                </button>
                <button
                  type="button"
                  disabled={!script && !validation?.valid}
                  onClick={exportMarkdown}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-ink transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  导出 Markdown
                </button>
              </div>
            }
          >
            <textarea
              value={yamlText}
              onChange={(event) => setYamlText(event.target.value)}
              placeholder="生成剧本后，这里会显示可编辑的 YAML。"
              className="min-h-[520px] w-full resize-y rounded-lg border border-slate-800 bg-[linear-gradient(180deg,#111827,#0f172a)] p-4 font-mono text-sm leading-6 text-slate-100 shadow-inner outline-none transition placeholder:text-slate-500 focus:border-accent focus:ring-4 focus:ring-teal-100"
            />
            <div className="mt-4">
              {!yamlText ? (
                <EmptyState text="尚未生成 YAML。" />
              ) : validation?.valid ? (
                <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>校验通过：YAML 格式正确，并符合剧本 Schema。</span>
                </p>
              ) : (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <p className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    校验失败
                  </p>
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
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-ink">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-3">
      <p className="text-xs font-bold text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
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
        className="rounded-lg border border-slate-200 bg-white px-3 py-3 font-medium text-ink outline-none transition focus:border-accent focus:ring-4 focus:ring-teal-100"
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
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-muted">
      <FileText className="mx-auto mb-3 h-6 w-6 text-slate-400" />
      <p>{text}</p>
    </div>
  );
}
