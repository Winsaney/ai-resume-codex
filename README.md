# ResumeAI Pro — AI 简历优化助手

基于 AI 的智能简历优化工具，输入简历和目标岗位 JD，即可获得专业的深度分析报告，包括缺失关键词、劣势诊断、经历重写建议等，帮助最大化 ATS 通过率。

## 功能特性

- **深度简历解析** — AI 逐条分析简历内容，精准定位不足
- **岗位精准匹配** — 对比 JD 识别缺失技能与关键词
- **编辑级润色建议** — 提供重写样例，提升表达力度与量化指标
- **流式实时输出** — 分析结果逐字流式呈现，无需等待
- **中英双语支持** — 界面与 AI 分析均支持中/英文切换
- **自定义 API 配置** — 支持任意 OpenAI 兼容接口（Base URL / Key / Model）

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router) + React 19 + TypeScript |
| 样式 | Tailwind CSS v4 + Shadcn/ui |
| AI | Vercel AI SDK v6 + @ai-sdk/openai |
| 图标 | Lucide React |
| 运行时 | Edge Runtime (API 路由) |

## 快速开始

### 环境要求

- Node.js >= 18
- pnpm

### 安装与运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开 http://localhost:3000 即可使用。

### 配置 API

首次使用需点击右上角齿轮图标，填入：

- **Base URL** — OpenAI 兼容接口地址（默认 `https://api.openai.com/v1`）
- **API Key** — 你的密钥
- **Model** — 模型名称（默认 `gpt-3.5-turbo`）

配置保存在浏览器 localStorage 中，不会上传到任何服务器。

## 使用方式

1. 在首页点击进入工作台
2. 左侧粘贴当前简历内容
3. 右侧粘贴目标岗位 JD
4. 点击「生成分析报告」
5. AI 将流式输出 Markdown 格式的分析报告
6. 可一键复制报告内容

## 项目结构

```
src/
├── app/
│   ├── api/
│   │   ├── optimize/route.ts    # AI 优化 API（Edge Runtime，流式输出）
│   │   └── test/route.ts        # API 连通性测试
│   ├── dashboard/page.tsx       # 主工作台页面
│   ├── page.tsx                 # 首页
│   ├── layout.tsx               # 根布局
│   ├── globals.css              # 全局样式与设计系统
│   └── Providers.tsx            # Context Providers
├── components/
│   ├── ui/                      # Shadcn/ui 基础组件
│   ├── LanguageSwitcher.tsx     # 中英文切换
│   └── SettingsModal.tsx        # API 设置弹窗
└── lib/
    ├── SettingsContext.tsx       # API 配置状态管理
    ├── i18n/
    │   ├── LanguageContext.tsx   # 语言状态管理
    │   └── translations.ts      # 中英文翻译
    └── utils.ts                 # 工具函数
```

## 其他命令

```bash
pnpm build    # 生产构建
pnpm start    # 启动生产服务
pnpm lint     # ESLint 检查
```
