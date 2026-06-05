# 剧本 YAML Schema 设计说明

Schema 文件位置：

```text
schemas/script.schema.json
```

## 顶层结构

```yaml
title: string
logline: string
genre: string
format: 影视剧 | 短剧 | 舞台剧 | 分镜脚本
style: 现实主义 | 悬疑 | 喜剧 | 青春 | 古风
detailLevel: 简版 | 标准版 | 详细版
characters: Character[]
chapters: Chapter[]
metadata: Metadata
```

设计原因：

- `title` 保留剧本名称，方便导出和版本管理。
- `logline` 用一句话概括核心冲突，帮助作者判断改编方向。
- `genre`、`format`、`style`、`detailLevel` 记录生成配置，便于复现。
- `characters` 独立在顶层，方便后续做角色表、关系图和一致性检查。
- `chapters` 保留小说章节来源，让作者能追溯每个场景来自哪一章。
- `metadata` 记录生成器和 Schema 版本，方便后续升级。

## Character

```yaml
id: string
name: string
role: string
description: string
motivation: string
```

设计原因：

- `id` 用于稳定引用，避免角色改名后引用混乱。
- `name` 是剧本文本中可读的角色名。
- `role` 说明人物功能，例如主角、反派、推动者。
- `description` 给导演、编剧和演员快速理解角色。
- `motivation` 帮助每场戏保持人物行动逻辑。

## Chapter

```yaml
id: string
title: string
summary: string
scenes: Scene[]
```

设计原因：

- 保留章节层，符合“从小说章节改编为剧本段落”的工作流程。
- `summary` 帮助作者快速浏览章节改编结果。
- `scenes` 是剧本创作的核心承载单位。

## Scene

```yaml
id: string
chapterId: string
title: string
location: string
time: string
atmosphere: string
summary: string
beats: Beat[]
```

设计原因：

- `location` 和 `time` 是剧本生产中最基础的场景信息。
- `atmosphere` 帮助控制影像或舞台调性。
- `summary` 便于快速审阅场景目的。
- `beats` 将场景拆成动作、对白、旁白和转场，方便继续细化。

## Beat

支持四种类型：

```yaml
type: action
action: string
```

```yaml
type: dialogue
character: string
content: string
```

```yaml
type: narration
narration: string
```

```yaml
type: transition
transition: string
```

设计原因：

- `action` 描述可被拍摄或表演的行为。
- `dialogue` 必须包含角色和台词，方便后续提取对白表。
- `narration` 承接小说中难以视觉化但仍有价值的信息。
- `transition` 描述场景衔接，适合影视和分镜脚本。

## 中英文字段显示

内部 JSON Schema 保持英文规范字段，便于程序校验和后续 API 集成。YAML 编辑器会根据上传小说的主要语言自动切换显示字段：

| Schema 字段 | 中文 YAML 显示 |
| --- | --- |
| `title` | `标题` |
| `logline` | `一句话梗概` |
| `genre` | `题材` |
| `characters` | `角色列表` |
| `chapters` | `章节列表` |
| `scenes` | `场景列表` |
| `location` | `地点` |
| `time` | `时间` |
| `atmosphere` | `氛围` |
| `summary` | `摘要` |
| `beats` | `节拍` |
| `action` | `动作` |
| `dialogue` | `对白` |
| `narration` | `旁白` |
| `transition` | `转场` |
| `character` | `角色` |
| `content` | `内容` |

设计原因：

- 英文小说默认输出英文 YAML 字段，方便技术系统继续处理。
- 中文小说默认输出中文 YAML 字段，降低小说作者理解结构的成本。
- 校验时会先把中文字段名规范化为英文 Schema 字段，再使用 JSON Schema 校验，因此中文 YAML 和英文 YAML 都能被同一套结构规则约束。

## 校验策略

本项目使用 `ajv` 读取 JSON Schema，对 YAML 解析后的对象进行校验。这样可以同时检查：

- YAML 格式是否正确
- 必填字段是否存在
- 枚举值是否合法
- 章节数量是否不少于 3
- scene 是否包含 location、time、atmosphere、summary、beats
- dialogue beat 是否包含 character 和 content
