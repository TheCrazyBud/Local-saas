import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { resolveOrgId } from '../../../lib/auth';

/**
 * GET /api/agents — List all agents for the current organization
 */
export async function GET() {
  try {
    const orgId = await resolveOrgId();

    const agents = await prisma.agent.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        model: { select: { name: true } },
        _count: { select: { runs: true, conversations: true } },
      },
    });

    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

/**
 * POST /api/agents — Create a new agent
 */
export async function POST(request: Request) {
  try {
    const orgId = await resolveOrgId();
    const body = await request.json();
    const { name, description, modelId, systemPrompt, temperature, maxTokens } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    // If modelId provided, verify it belongs to the same org
    if (modelId) {
      const model = await prisma.model.findFirst({
        where: { id: modelId, orgId },
      });
      if (!model) {
        return NextResponse.json({ error: 'Model not found in this organization' }, { status: 404 });
      }
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        systemPrompt: systemPrompt || 'You are a helpful assistant.',
        temperature: temperature ?? 0.7,
        maxTokens: maxTokens ?? 2048,
        modelId: modelId || null,
        orgId,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        event: `Agent created: ${name}`,
        location: 'Control Plane API',
        status: 'Success',
        orgId,
      },
    });

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}

/**
 * DELETE /api/agents — Delete an agent by id (passed as query param)
 */
export async function DELETE(request: Request) {
  try {
    const orgId = await resolveOrgId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const agent = await prisma.agent.findFirst({ where: { id, orgId } });
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    await prisma.agent.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        event: `Agent deleted: ${agent.name}`,
        location: 'Control Plane API',
        status: 'Success',
        orgId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}
