import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

/**
 * GET /api/orgs — List all organizations (for org switcher)
 */
export async function GET() {
  try {
    const orgs = await prisma.organization.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { members: true, agents: true, models: true } },
      },
    });

    return NextResponse.json(orgs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

/**
 * POST /api/orgs — Create a new organization
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        settings: {
          create: {
            ollamaEndpoint: 'http://localhost:11434',
            gatewayEndpoint: 'http://localhost:8000',
            apiKey: `key-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`,
          },
        },
      },
      include: { settings: true },
    });

    return NextResponse.json(org, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Organization with this slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}
