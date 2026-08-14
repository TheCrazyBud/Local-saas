import { NextResponse } from 'next/server';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';

/**
 * GET /api/ollama — List all models available in the local Ollama instance
 */
export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to connect to Ollama', status: 'offline' },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      status: 'online',
      models: data.models || [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ollama is not reachable', status: 'offline' },
      { status: 502 }
    );
  }
}
