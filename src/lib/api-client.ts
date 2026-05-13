import { type ApiFormat } from './providers';

// --- Endpoint builder ---

export function buildEndpoint(apiFormat: ApiFormat, baseUrl: string): string {
  if (apiFormat === 'anthropic') {
    const base = baseUrl.replace(/\/+$/, '');
    return `${base}/v1/messages`;
  }
  let url = baseUrl.trim();
  if (url.endsWith('/chat/completions')) {
    url = url.slice(0, -'/chat/completions'.length);
  }
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return `${url}/chat/completions`;
}

// --- SSE transformer ---

type ContentExtractor = (json: any) => string | null;

function createSSETransformer(extractContent: ContentExtractor): TransformStream {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let sseBuffer = '';

  return new TransformStream({
    transform(chunk, controller) {
      sseBuffer += decoder.decode(chunk, { stream: true });
      const lines = sseBuffer.split('\n');
      sseBuffer = lines.pop()!;

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const content = extractContent(JSON.parse(data));
          if (content) controller.enqueue(encoder.encode(content));
        } catch { /* skip malformed chunks */ }
      }
    },
    flush(controller) {
      if (sseBuffer.startsWith('data: ')) {
        const data = sseBuffer.slice(6).trim();
        if (data && data !== '[DONE]') {
          try {
            const content = extractContent(JSON.parse(data));
            if (content) controller.enqueue(encoder.encode(content));
          } catch { /* ignore */ }
        }
      }
    },
  });
}

const openAIExtractor: ContentExtractor = (json) => json?.choices?.[0]?.delta?.content || null;
const anthropicExtractor: ContentExtractor = (json) =>
  (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') ? json.delta.text : null;

export function createSSETransformerForFormat(apiFormat: ApiFormat): TransformStream {
  return createSSETransformer(apiFormat === 'anthropic' ? anthropicExtractor : openAIExtractor);
}

// --- Error handling ---

export async function parseErrorResponse(response: Response): Promise<string> {
  const errText = await response.text();
  let errMsg = `HTTP ${response.status}`;
  try {
    const errJson = JSON.parse(errText);
    errMsg += `: ${errJson?.error?.message || errJson?.message || errText}`;
  } catch {
    errMsg += `: ${errText}`;
  }
  return errMsg;
}

// --- Request builders ---

export function buildRequestHeaders(apiFormat: ApiFormat, apiKey: string): Record<string, string> {
  const base = { 'Content-Type': 'application/json' };
  if (apiFormat === 'anthropic') {
    return { ...base, 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
  }
  return { ...base, Authorization: `Bearer ${apiKey}` };
}

export interface RequestOptions {
  model: string;
  systemPrompt: string;
  userContent: string;
  stream: boolean;
  maxTokens?: number;
}

export function buildRequestBody(apiFormat: ApiFormat, opts: RequestOptions): Record<string, unknown> {
  if (apiFormat === 'anthropic') {
    return {
      model: opts.model,
      max_tokens: opts.maxTokens ?? 8192,
      system: opts.systemPrompt,
      messages: [{ role: 'user', content: opts.userContent }],
      stream: opts.stream,
    };
  }
  return {
    model: opts.model,
    messages: [
      { role: 'system', content: opts.systemPrompt },
      { role: 'user', content: opts.userContent },
    ],
    stream: opts.stream,
  };
}
