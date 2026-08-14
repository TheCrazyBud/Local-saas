import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { agentTools: true } }
      }
    });
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, endpoint, schema, riskLevel } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const tool = await prisma.tool.create({
      data: {
        name,
        description,
        endpoint: endpoint || null,
        schema: schema ? JSON.stringify(schema) : null,
        riskLevel: riskLevel || 'low',
      }
    });

    return NextResponse.json(tool, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Tool with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create tool' }, { status: 500 });
  }
}
