import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;
    const body = await request.json();
    const { message, conversationId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { model: true }
    });

    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' } } }
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          agentId,
        },
        include: { messages: true }
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        role: 'user',
        content: message,
        tokens: message.split(/\s+/).length,
        conversationId: conversation.id,
      }
    });

    // Build conversation context
    const history = conversation.messages.map((m: any) => `${m.role}: ${m.content}`).join('\n');
    const fullPrompt = `${agent.systemPrompt}\n\n${history}\nuser: ${message}\nassistant:`;

    let assistantResponse = '';

    try {
      const gatewayUrl = process.env.LLM_GATEWAY_URL || 'http://localhost:8000';
      const response = await fetch(`${gatewayUrl}/v1/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.API_KEY || 'enterprise-secret-key-123'
        },
        body: JSON.stringify({
          model: agent.model?.name || 'llama-3-8b',
          prompt: fullPrompt,
          max_tokens: agent.maxTokens,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        assistantResponse = data.choices?.[0]?.text || 'No response generated.';
      } else {
        throw new Error('Gateway error');
      }
    } catch (e) {
      assistantResponse = `I'm ${agent.name}. I received your message: "${message.substring(0, 80)}". My system prompt is: "${agent.systemPrompt.substring(0, 100)}". Connect a local LLM to get real responses.`;
    }

    // Save assistant message
    const assistantMsg = await prisma.message.create({
      data: {
        role: 'assistant',
        content: assistantResponse,
        tokens: assistantResponse.split(/\s+/).length,
        conversationId: conversation.id,
      }
    });

    // Update agent
    await prisma.agent.update({
      where: { id: agentId },
      data: { lastActiveAt: new Date() }
    });

    return NextResponse.json({
      conversationId: conversation.id,
      message: {
        id: assistantMsg.id,
        role: 'assistant',
        content: assistantResponse,
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}
