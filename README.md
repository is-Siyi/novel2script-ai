# Novel2Script AI

Novel2Script AI 是一个面向小说作者的 AI 剧本改编助手。用户粘贴或上传 3 个章节以上的小说文本后，系统会自动识别章节、拆解内容，并使用 mock AI 逻辑生成结构化剧本 YAML，支持 Schema 校验、在线编辑和导出。

## 项目背景

很多小说作者具备故事和人物能力，但不熟悉剧本格式、场景拆分、节拍设计和结构化交付。这个项目希望把“小说到剧本初稿”的第一步自动化，让作者快速得到可编辑、可继续打磨的剧本 YAML。

## 核心功能

- 小说粘贴输入
- `.txt` / `.md` 文件上传
- 自动识别“第一章”“第1章”“Chapter 1”等章节标题
- 至少 3 章校验与提示
- 章节列表、字数和摘要展示
- 生成配置：剧本类型、风格、详细程度
- mock AI 生成结构化剧本对象
- YAML 展示与在线编辑
- YAML 字段名根据小说语言自动切换中文或英文
- JSON Schema 校验与错误提示
- 导出 YAML、导出 Markdown、复制 YAML

## 技术栈

- Next.js App Router
- TypeScript
- Tailwind CSS
- js-yaml
- ajv
- zod
- lucide-react

当前版本默认使用 `mockAiGenerator`，不依赖真实 API Key。`lucide-react` 仅用于界面图标。原创部分包括示例小说、mock 生成逻辑、YAML Schema、交互界面和文档。

## 安装运行

```bash
npm install
npm run dev
```

浏览器打开：

```text
http://localhost:3000
```

构建验证：

```bash
npm run build
```

## 演示流程

1. 点击“加载示例小说”
2. 查看系统识别出的 3 个章节、字数和摘要
3. 选择剧本类型、风格和详细程度
4. 点击“生成结构化剧本 YAML”
5. 查看校验通过状态
6. 手动修改 YAML，点击“重新校验”
7. 导出 YAML 或 Markdown

## 目录结构

```text
app/                     Next.js App Router 页面
components/              页面组件
lib/                     小说解析、mock AI、YAML、导出逻辑
schemas/script.schema.json
examples/                原创示例小说和示例剧本 YAML
docs/                    产品设计、Schema 说明和演示文档
```

## PR 与开发记录

比赛评审可查看 [PR and Commit Record](docs/PR_COMMIT_RECORD.md)，其中记录了当前仓库的 PR、commit、依赖与原创声明。后续 PR 使用 `.github/PULL_REQUEST_TEMPLATE.md`，确保功能描述、实现思路、测试方式和原创/依赖声明完整。

## Demo 视频

待补充：录制 3 分钟演示视频后，将可访问链接放到这里。

## 可选优化

- 接入真实大模型 API
- 支持长文本分段生成和合并
- 支持角色关系图谱
- 支持场景级批注和版本对比
- 支持导出 Final Draft / Fountain 格式
