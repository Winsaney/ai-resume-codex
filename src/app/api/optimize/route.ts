export const runtime = 'edge';

function buildEndpointUrl(baseUrl: string): string {
  let url = (baseUrl || 'https://api.openai.com/v1').trim();
  if (url.endsWith('/chat/completions')) {
    url = url.slice(0, -'/chat/completions'.length);
  }
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return `${url}/chat/completions`;
}

export async function POST(req: Request) {
  try {
    const { resume, jd, apiKey, baseUrl, model, language } = await req.json();

    if (!apiKey) {
      return new Response('API Key is missing. Please configure it in Settings.', { status: 400 });
    }

    const sysPrompt = language === 'en'
      ? "You are an expert Resume Optimizer. Given a user's resume and a target job description (JD), provide a strict, highly editorial and quantifiable analysis. Point out missing keywords, weaknesses, and rewrite the experience section to maximize ATS passing rate and impact. Format output entirely in pristine Markdown."
      : "你是一个顶级的简历优化专家（带有 Anthropic 编辑水准）。根据用户的简历和目标岗位 JD，提供极其严谨、具有高度专业性和量化指标的分析。精准指出缺失的关键技能、劣势，并提供编辑级的经历重写样例，以最大化 ATS 解析率和面试官的阅读体验。请全程使用优雅、排版严谨的 Markdown 格式输出。";

    const promptText = `### Target Job Description (JD)\n${jd}\n\n### Current Resume Draft\n${resume}`;

    const endpoint = buildEndpointUrl(baseUrl || 'https://api.openai.com/v1');

    // Use raw fetch to bypass @ai-sdk URL construction bugs with subpath base URLs
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: sysPrompt },
          { role: 'user', content: promptText },
        ],
        stream: true,
      }),
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      let errMsg = `HTTP ${upstream.status}: `;
      try {
        const errJson = JSON.parse(errText);
        errMsg += errJson?.error?.message || errJson?.message || errText;
      } catch {
        errMsg += errText;
      }
      return new Response(errMsg, { status: upstream.status });
    }

    // The upstream returns OpenAI-compatible SSE.
    // useCompletion with streamProtocol:'text' expects plain text chunks.
    // Transform OpenAI SSE → plain text stream.
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Buffer for handling SSE data split across TCP chunks
    let sseBuffer = '';

    const transformedStream = new TransformStream({
      transform(chunk, controller) {
        sseBuffer += decoder.decode(chunk, { stream: true });
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop()!;

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const json = JSON.parse(data);
            const content = json?.choices?.[0]?.delta?.content;
            if (content != null && content !== '') {
              controller.enqueue(encoder.encode(content));
            }
          } catch {
            // skip malformed chunks
          }
        }
      },

      flush(controller) {
        if (sseBuffer.startsWith('data: ')) {
          const data = sseBuffer.slice(6).trim();
          if (data && data !== '[DONE]') {
            try {
              const json = JSON.parse(data);
              const content = json?.choices?.[0]?.delta?.content;
              if (content != null && content !== '') {
                controller.enqueue(encoder.encode(content));
              }
            } catch { /* ignore */ }
          }
        }
      }
    });

    upstream.body!.pipeTo(transformedStream.writable);

    return new Response(transformedStream.readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    return new Response(error.message || 'An error occurred during generation.', { status: 500 });
  }
}
