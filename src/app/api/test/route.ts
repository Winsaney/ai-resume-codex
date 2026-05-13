export const runtime = 'edge';

import { getProviderById, getEffectiveBaseUrl } from '@/lib/providers';
import { buildEndpoint, parseErrorResponse, buildRequestHeaders, buildRequestBody } from '@/lib/api-client';

export async function POST(req: Request) {
  try {
    const { apiKey, baseUrl = '', model, providerId = 'openai' } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API Key is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const provider = getProviderById(providerId);
    const apiFormat = provider?.apiFormat || 'openai';
    const effectiveBaseUrl = getEffectiveBaseUrl(provider!, { baseUrl, apiKey });
    const endpoint = buildEndpoint(apiFormat, effectiveBaseUrl);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: buildRequestHeaders(apiFormat, apiKey),
      body: JSON.stringify(buildRequestBody(apiFormat, {
        model: model || provider?.models[0]?.id || 'gpt-4o',
        systemPrompt: '',
        userContent: 'Hi',
        stream: false,
        maxTokens: 5,
      })),
    });

    if (!response.ok) {
      const errMsg = await parseErrorResponse(response);
      return new Response(
        JSON.stringify({ success: false, error: errMsg }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Connection successful', endpoint }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Connection failed' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
