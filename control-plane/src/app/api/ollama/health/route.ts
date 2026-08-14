import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * GET /api/ollama/health — Check Ollama connectivity and version
 */
export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/version`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ status: 'offline', version: null, models: 0 });
    }

    const versionData = await response.json();

    // Also get model count
    let modelCount = 0;
    try {
      const tagsResp = await fetch(`${OLLAMA_URL}/api/tags`, { cache: 'no-store' });
      if (tagsResp.ok) {
        const tagsData = await tagsResp.json();
        modelCount = (tagsData.models || []).length;
      }
    } catch {}

    return NextResponse.json({
      status: 'online',
      version: versionData.version || 'unknown',
      models: modelCount,
      endpoint: OLLAMA_URL,
    });
  } catch {
    return NextResponse.json({
      status: 'offline',
      version: null,
      models: 0,
      endpoint: OLLAMA_URL,
    });
  }
}
