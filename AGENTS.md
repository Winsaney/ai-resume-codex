<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ResumeAI Pro — AI Resume Optimizer

## Overview

AI-powered resume optimization tool. Users submit a resume + target JD, receive a professional deep analysis report with missing keywords, weakness diagnosis, and rewrite suggestions to maximize ATS pass rates.

## Tech Stack

- **Next.js 16.2.4** (App Router) + **React 19.2.4** + **TypeScript 5**
- **Tailwind CSS v4** + **Shadcn/ui** (base-nova style) + **@base-ui/react**
- **Vercel AI SDK v6** (`@ai-sdk/react`, `@ai-sdk/openai`) for streaming
- **MinerU Agent API** for PDF/document parsing (free, no token)
- **Lucide React** icons, **react-markdown** for rendering
- Package manager: **pnpm**

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── optimize/route.ts    # AI optimization (Edge Runtime, SSE→text stream)
│   │   ├── parse-pdf/route.ts   # MinerU PDF proxy (Node.js runtime, maxDuration=60)
│   │   └── test/route.ts        # API connectivity test (Edge Runtime)
│   ├── dashboard/page.tsx       # Main workspace — resume/JD input, PDF upload, AI results
│   ├── page.tsx                 # Landing page — hero, features
│   ├── layout.tsx               # Root layout — Poppins + Lora fonts, Providers
│   ├── globals.css              # Theme variables, animations, markdown styles
│   └── Providers.tsx            # SettingsProvider + LanguageProvider wrapper
├── components/
│   ├── ui/                      # Shadcn/ui: button, card, textarea
│   ├── LanguageSwitcher.tsx     # EN/中 toggle
│   └── SettingsModal.tsx        # API config modal (baseUrl, apiKey, model)
└── lib/
    ├── SettingsContext.tsx       # API config state — localStorage('resume-api-config')
    ├── utils.ts                 # cn() helper (clsx + tailwind-merge)
    └── i18n/
        ├── LanguageContext.tsx   # Language state — localStorage('resume-language')
        └── translations.ts      # EN/ZH translation dict
```

## Key Patterns

- **Streaming**: `/api/optimize` transforms OpenAI SSE → plain text stream for `useCompletion` with `streamProtocol: 'text'`
- **Client config**: API credentials stored in browser localStorage, passed in request body (not env vars)
- **State management**: React Context only (SettingsContext, LanguageContext) — no Redux/Zustand
- **Edge vs Node.js runtime**: `optimize` and `test` use Edge; `parse-pdf` uses Node.js (long polling requires it)
- **Design system**: Anthropic-inspired, brand colors defined in CSS vars (`--color-brand-orange: #d97757`, etc.), serif fonts for content areas

## API Routes

### POST `/api/optimize`
Body: `{ resume, jd, apiKey, baseUrl, model, language }` → streaming text response

### POST `/api/parse-pdf`
FormData: `file`, `language`, `enableTable`, `isOcr` → `{ markdown: string }`
Proxies MinerU Agent API (4-step: get signed URL → upload to OSS → poll → fetch markdown)

### POST `/api/test`
Body: `{ apiKey, baseUrl, model }` → `{ success, message, endpoint }`

## i18n

Translations in `src/lib/i18n/translations.ts`. Add keys to both `en` and `zh` objects. Use `t('key')` via `useLanguage()` hook.
