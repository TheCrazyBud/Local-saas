import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * POST /api/ollama/pull — Pull a model from Ollama registry
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }

    const response = await fetch(`${OLLAMA_URL}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, stream: false }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Ollama pull failed: ${errText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ status: 'success', result: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to pull model from Ollama' },
      { status: 502 }
    );
  }
}
