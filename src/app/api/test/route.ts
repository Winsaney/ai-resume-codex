export const runtime = 'edge';

/**
 * Builds the full endpoint URL correctly regardless of whether the user
 * included a trailing slash or the /chat/completions segment.
 */
function buildEndpointUrl(baseUrl: string): string {
  let url = baseUrl.trim();
  // Remove any accidental /chat/completions the user may have pasted
  if (url.endsWith('/chat/completions')) {
    url = url.slice(0, -'/chat/completions'.length);
  }
  // Remove trailing slash so we can safely append
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  return `${url}/chat/completions`;
}

export async function POST(req: Request) {
  try {
    const { apiKey, baseUrl, model } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'API Key is required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const endpoint = buildEndpointUrl(baseUrl || 'https://api.openai.com/v1');

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `HTTP ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson?.error?.message || errJson?.message || errMsg;
      } catch {}
      return new Response(
        JSON.stringify({ success: false, error: errMsg }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Connection successful', endpoint }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Connection failed' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
