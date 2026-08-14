import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { resolveOrgId } from '../../../lib/auth';

/**
 * GET /api/deployments — List all deployments for the current organization
 */
export async function GET() {
  try {
    const orgId = await resolveOrgId();

    const deployments = await prisma.deployment.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        model: { select: { name: true } },
      },
    });

    return NextResponse.json(deployments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deployments' }, { status: 500 });
  }
}

/**
 * POST /api/deployments — Create a new deployment
 */
export async function POST(request: Request) {
  try {
    const orgId = await resolveOrgId();
    const body = await request.json();
    const { name, region, modelId } = body;

    if (!name || !region) {
      return NextResponse.json(
        { error: 'Name and region are required' },
        { status: 400 }
      );
    }

    // Generate a deterministic VPC ID
    const vpcId = `vpc-${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 6)}`;

    const deployment = await prisma.deployment.create({
      data: {
        name,
        region,
        vpcId,
        modelId: modelId || null,
        orgId,
      },
    });

    await prisma.auditLog.create({
      data: {
        event: `Deployment created: ${name} in ${region}`,
        location: 'Control Plane API',
        status: 'Success',
        orgId,
      },
    });

    return NextResponse.json(deployment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create deployment' }, { status: 500 });
  }
}

/**
 * PATCH /api/deployments — Update deployment status
 */
export async function PATCH(request: Request) {
  try {
    const orgId = await resolveOrgId();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const dep = await prisma.deployment.findFirst({ where: { id, orgId } });
    if (!dep) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }

    const updated = await prisma.deployment.update({
      where: { id },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        event: `Deployment ${dep.name} status changed to ${status}`,
        location: 'Control Plane API',
        status: 'Success',
        orgId,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update deployment' }, { status: 500 });
  }
}
