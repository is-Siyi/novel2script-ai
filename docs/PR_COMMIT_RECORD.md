# PR and Commit Record

本文档用于比赛评审核对 Novel2Script AI 的开发过程、Pull Request 记录、commit 记录、依赖说明和原创声明。

## 合规原则

- 所有功能变更通过 Pull Request 合并到 `main`。
- 每个 PR 聚焦一类变更，避免把无关功能混在同一个 PR。
- PR 描述需要包含功能描述、实现思路和测试方式。
- commit 和 PR 时间戳保持真实，不伪造、不回填历史时间。
- 当前记录中的时间以北京时间 `Asia/Shanghai` 展示；参赛时需确认所选批次的开始与截止时间覆盖这些真实时间戳。

## Pull Request 记录

| PR | 标题 | 分支 | 合并时间（北京时间） | 变更范围 |
| --- | --- | --- | --- | --- |
| [#1](https://github.com/is-Siyi/novel2script-ai/pull/1) | feat: implement novel to script workflow | `feature/workflow` | 2026-06-05 00:41:24 | 实现核心 Web 工作台、小说输入、章节识别、配置、mock AI 生成、YAML 编辑、Schema 校验和导出 |
| [#2](https://github.com/is-Siyi/novel2script-ai/pull/2) | docs: add examples and competition docs | `docs/examples` | 2026-06-05 00:42:30 | 补充原创示例小说、示例 YAML、README、产品设计、Schema 文档和演示指南 |
| [#3](https://github.com/is-Siyi/novel2script-ai/pull/3) | fix: stabilize schema validation build | `fix/build` | 2026-06-05 00:42:39 | 修复 Ajv draft 2020-12 校验入口和本地构建稳定性 |
| [#4](https://github.com/is-Siyi/novel2script-ai/pull/4) | fix: improve mock character extraction | `fix/characters` | 2026-06-05 00:42:49 | 优化 mock 人物抽取，减少句子被误识别为人物名 |
| [#5](https://github.com/is-Siyi/novel2script-ai/pull/5) | fix: remove hardcoded character fallback | `fix/remove-hardcoded-character-fallback` | 2026-06-05 01:07:43 | 移除示例人物名硬编码兜底，避免用户上传小说未出现的人名进入 YAML |

## Commit 记录

| Commit | 时间（北京时间） | 说明 |
| --- | --- | --- |
| `60751df` | 2026-06-05 00:19:50 | `feat: scaffold Next.js app` |
| `116f1e6` | 2026-06-05 00:19:58 | `feat: implement novel to script workflow` |
| `74d96b3` | 2026-06-05 00:20:06 | `docs: add examples and competition docs` |
| `48932bc` | 2026-06-05 00:27:06 | `fix: stabilize schema validation build` |
| `fc71430` | 2026-06-05 00:29:33 | `fix: improve mock character extraction` |
| `3b46b04` | 2026-06-05 00:41:24 | `Merge pull request #1 from is-Siyi/feature/workflow` |
| `659af51` | 2026-06-05 00:42:29 | `Merge pull request #2 from is-Siyi/docs/examples` |
| `d17aedc` | 2026-06-05 00:42:39 | `Merge pull request #3 from is-Siyi/fix/build` |
| `0325029` | 2026-06-05 00:42:48 | `Merge pull request #4 from is-Siyi/fix/characters` |
| `4f3f5ec` | 2026-06-05 00:57:39 | `fix: remove hardcoded character fallback` |
| `4639d26` | 2026-06-05 01:07:42 | `Merge pull request #5 from is-Siyi/fix/remove-hardcoded-character-fallback` |

## 依赖与原创说明

本项目引用的第三方框架和库已在 README 的技术栈中列明：

- Next.js App Router
- TypeScript
- Tailwind CSS
- js-yaml
- ajv
- zod

原创部分包括：

- 小说章节识别与摘要展示流程
- mock AI 剧本生成逻辑
- 剧本 YAML 数据结构和 JSON Schema
- YAML 编辑、校验、复制和导出交互
- `examples/sample-novel.txt` 原创示例小说
- `examples/sample-script.yaml` 原创示例剧本 YAML
- 产品设计、Schema 说明和演示文档

当前版本未复用个人历史项目代码。如后续引入过去代码片段，应在对应 PR 描述中写明来源、范围和改动方式。

## 后续 PR 填写要求

后续每个 PR 应至少包含：

- 标题：一句话说明新增或修改了什么。
- 功能描述：说明该功能的作用与使用方式。
- 实现思路：说明技术选型或核心实现逻辑。
- 测试方式：说明如何验证功能正常运行。
- 原创与依赖声明：说明是否新增第三方依赖，是否复用过往代码。

