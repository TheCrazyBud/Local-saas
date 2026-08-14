import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { resolveOrgId } from '../../../lib/auth';

/**
 * GET /api/settings — Get settings for the current org
 */
export async function GET() {
  try {
    const orgId = await resolveOrgId();

    let settings = await prisma.orgSettings.findUnique({ where: { orgId } });

    if (!settings) {
      settings = await prisma.orgSettings.create({
        data: {
          orgId,
          ollamaEndpoint: 'http://localhost:11434',
          gatewayEndpoint: 'http://localhost:8000',
          apiKey: 'enterprise-secret-key-123',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PATCH /api/settings — Update settings for the current org
 */
export async function PATCH(request: Request) {
  try {
    const orgId = await resolveOrgId();
    const body = await request.json();

    const settings = await prisma.orgSettings.upsert({
      where: { orgId },
      update: {
        ...(body.ollamaEndpoint !== undefined && { ollamaEndpoint: body.ollamaEndpoint }),
        ...(body.gatewayEndpoint !== undefined && { gatewayEndpoint: body.gatewayEndpoint }),
        ...(body.apiKey !== undefined && { apiKey: body.apiKey }),
        ...(body.defaultTemp !== undefined && { defaultTemp: parseFloat(body.defaultTemp) }),
        ...(body.defaultMaxTokens !== undefined && { defaultMaxTokens: parseInt(body.defaultMaxTokens) }),
      },
      create: {
        orgId,
        ollamaEndpoint: body.ollamaEndpoint || 'http://localhost:11434',
        gatewayEndpoint: body.gatewayEndpoint || 'http://localhost:8000',
        apiKey: body.apiKey || 'enterprise-secret-key-123',
        defaultTemp: body.defaultTemp ? parseFloat(body.defaultTemp) : 0.7,
        defaultMaxTokens: body.defaultMaxTokens ? parseInt(body.defaultMaxTokens) : 2048,
      },
    });

    await prisma.auditLog.create({
      data: {
        event: 'Organization settings updated',
        location: 'Control Plane UI',
        status: 'Success',
        orgId,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
