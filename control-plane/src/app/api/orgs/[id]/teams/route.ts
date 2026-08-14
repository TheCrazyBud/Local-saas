import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

/**
 * GET /api/orgs/[id]/teams — List teams in an organization
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params;

    const teams = await prisma.team.findMany({
      where: { orgId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(teams);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

/**
 * POST /api/orgs/[id]/teams — Create a team in an organization
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orgId } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    const team = await prisma.team.create({
      data: { name, orgId },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
  }
}
