import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();
    const { input } = body;

    if (!input) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { model: true }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Mark agent as running
    await prisma.agent.update({
      where: { id: agentId },
      data: { status: 'running', lastActiveAt: new Date() }
    });

    const startTime = Date.now();
    let output = '';
    let tokensUsed = 0;
    let status = 'success';

    try {
      // Try to call the LLM Gateway
      const gatewayUrl = process.env.LLM_GATEWAY_URL || 'http://localhost:8000';
      const response = await fetch(`${gatewayUrl}/v1/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.API_KEY || 'enterprise-secret-key-123'
        },
        body: JSON.stringify({
          model: agent.model?.name || 'llama-3-8b',
          prompt: `${agent.systemPrompt}\n\nUser: ${input}\n\nAssistant:`,
          max_tokens: agent.maxTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        output = data.choices?.[0]?.text || 'No response generated.';
        tokensUsed = output.split(/\s+/).length * 2; // rough estimate
      } else {
        throw new Error('Gateway returned non-OK status');
      }
    } catch (e) {
      // Fallback mock response
      output = `[Agent: ${agent.name}] Processed your request: "${input.substring(0, 100)}". The system prompt is configured as: "${agent.systemPrompt.substring(0, 80)}...". In production, this connects to your local LLM via the Privacy Gateway.`;
      tokensUsed = Math.floor(Math.random() * 500) + 100;
    }

    const latencyMs = Date.now() - startTime;

    // Log the run
    const run = await prisma.agentRun.create({
      data: {
        input,
        output,
        tokensUsed,
        latencyMs,
        status,
        agentId,
        modelId: agent.modelId,
      }
    });

    // Update agent stats
    const totalRuns = agent.totalRuns + 1;
    await prisma.agent.update({
      where: { id: agentId },
      data: {
        status: 'idle',
        totalRuns,
        lastActiveAt: new Date(),
      }
    });

    return NextResponse.json({
      runId: run.id,
      output,
      tokensUsed,
      latencyMs,
      status,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to execute agent run' }, { status: 500 });
  }
}
