import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { resolveOrgId } from '../../../lib/auth';

/**
 * GET /api/models — List all models for the current organization
 */
export async function GET() {
  try {
    const orgId = await resolveOrgId();

    const models = await prisma.model.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { agents: true, runs: true } },
      },
    });

    return NextResponse.json(models);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
  }
}

/**
 * POST /api/models — Register a model in the current organization
 */
export async function POST(request: Request) {
  try {
    const orgId = await resolveOrgId();
    const body = await request.json();
    const { name, provider, parameterCount, quantization, endpoint } = body;

    if (!name) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }

    const model = await prisma.model.create({
      data: {
        name,
        provider: provider || 'ollama',
        parameterCount: parameterCount || null,
        quantization: quantization || null,
        endpoint: endpoint || 'http://localhost:11434',
        status: 'available',
        orgId,
      },
    });

    await prisma.auditLog.create({
      data: {
        event: `Model registered: ${name} (${provider || 'ollama'})`,
        location: 'Control Plane API',
        status: 'Success',
        orgId,
      },
    });

    return NextResponse.json(model, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Model with this name already exists in this org' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to register model' }, { status: 500 });
  }
}

/**
 * DELETE /api/models?id=xxx — Delete a model from the registry
 */
export async function DELETE(request: Request) {
  try {
    const orgId = await resolveOrgId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Model ID is required' }, { status: 400 });
    }

    const model = await prisma.model.findFirst({ where: { id, orgId } });
    if (!model) {
      return NextResponse.json({ error: 'Model not found' }, { status: 404 });
    }

    await prisma.model.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        event: `Model deleted: ${model.name}`,
        location: 'Control Plane API',
        status: 'Success',
        orgId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete model' }, { status: 500 });
  }
}
