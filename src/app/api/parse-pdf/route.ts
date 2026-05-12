export const maxDuration = 60;

const MINERU_BASE = 'https://mineru.net/api/v1/agent';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const language = (formData.get('language') as string) || 'ch';
    const enableTable = formData.get('enableTable') !== 'false';
    const isOcr = formData.get('isOcr') === 'true';

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const validExts = ['pdf', 'docx', 'pptx', 'xlsx', 'png', 'jpg', 'jpeg'];
    if (!validExts.includes(ext)) {
      return Response.json({ error: `Unsupported file type: .${ext}` }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json({ error: 'File exceeds 10MB limit' }, { status: 400 });
    }

    // Step 1: Get signed upload URL
    const initRes = await fetch(`${MINERU_BASE}/parse/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_name: file.name,
        language,
        enable_table: enableTable,
        is_ocr: isOcr,
        enable_formula: false,
      }),
    });

    const initData = await initRes.json();
    if (initData.code !== 0) {
      return Response.json({ error: `MinerU error: ${initData.msg}`, step: 'init' }, { status: 502 });
    }

    const { task_id, file_url } = initData.data;

    // Step 2: Upload file to OSS
    const uploadRes = await fetch(file_url, {
      method: 'PUT',
      body: await file.arrayBuffer(),
    });

    if (!uploadRes.ok) {
      return Response.json({ error: `Upload failed: HTTP ${uploadRes.status}`, step: 'upload' }, { status: 502 });
    }

    // Step 3: Poll for result
    const maxAttempts = 90;
    const interval = 2000;
    let markdownUrl: string | null = null;

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(r => setTimeout(r, interval));

      const pollRes = await fetch(`${MINERU_BASE}/parse/${task_id}`);
      const pollData = await pollRes.json();
      const state = pollData.data?.state;

      if (state === 'done') {
        markdownUrl = pollData.data.markdown_url;
        break;
      }
      if (state === 'failed') {
        return Response.json(
          { error: pollData.data.err_msg || 'Parse failed', step: 'parse' },
          { status: 502 },
        );
      }
    }

    if (!markdownUrl) {
      return Response.json({ error: 'Parsing timed out (3 min)', step: 'poll' }, { status: 504 });
    }

    // Step 4: Fetch markdown content
    const mdRes = await fetch(markdownUrl);
    const markdown = await mdRes.text();

    return Response.json({ markdown });
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'An error occurred during PDF parsing.' },
      { status: 500 },
    );
  }
}
