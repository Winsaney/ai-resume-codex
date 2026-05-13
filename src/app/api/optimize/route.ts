export const runtime = 'edge';

import { getProviderById, getEffectiveBaseUrl } from '@/lib/providers';
import { buildEndpoint, createSSETransformerForFormat, parseErrorResponse, buildRequestHeaders, buildRequestBody } from '@/lib/api-client';

function getSystemPrompt(language: string): string {
  return language === 'en'
    ? "You are an expert Resume Optimizer. Given a user's resume and a target job description (JD), provide a strict, highly editorial and quantifiable analysis. Point out missing keywords, weaknesses, and rewrite the experience section to maximize ATS passing rate and impact. Format output entirely in pristine Markdown."
    : "你是一个顶级的简历优化专家（带有 Anthropic 编辑水准）。根据用户的简历和目标岗位 JD，提供极其严谨、具有高度专业性和量化指标的分析。精准指出缺失的关键技能、劣势，并提供编辑级的经历重写样例，以最大化 ATS 解析率和面试官的阅读体验。请全程使用优雅、排版严谨的 Markdown 格式输出。";
}

export async function POST(req: Request) {
  try {
    const { resume, jd, apiKey, baseUrl = '', model, language, providerId = 'openai' } = await req.json();

    if (!apiKey) {
      return new Response('API Key is missing. Please configure it in Settings.', { status: 400 });
    }

    const provider = getProviderById(providerId);
    const apiFormat = provider?.apiFormat || 'openai';
    const effectiveBaseUrl = getEffectiveBaseUrl(provider!, { baseUrl, apiKey });
    const endpoint = buildEndpoint(apiFormat, effectiveBaseUrl);
    const sysPrompt = getSystemPrompt(language);
    const promptText = `### Target Job Description (JD)\n${jd}\n\n### Current Resume Draft\n${resume}`;

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: buildRequestHeaders(apiFormat, apiKey),
      body: JSON.stringify(buildRequestBody(apiFormat, {
        model: model || provider?.models[0]?.id || 'gpt-4o',
        systemPrompt: sysPrompt,
        userContent: promptText,
        stream: true,
      })),
    });

    if (!upstream.ok) {
      const errMsg = await parseErrorResponse(upstream);
      return new Response(errMsg, { status: upstream.status });
    }

    const transformer = createSSETransformerForFormat(apiFormat);
    upstream.body!.pipeTo(transformer.writable);

    return new Response(transformer.readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  } catch (error: any) {
    return new Response(error.message || 'An error occurred during generation.', { status: 500 });
  }
}
