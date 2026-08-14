import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { resolveOrgId } from '../../../lib/auth';

/**
 * GET /api/approvals — List all approvals for the current organization
 */
export async function GET() {
  try {
    const orgId = await resolveOrgId();

    const approvals = await prisma.actionApproval.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(approvals);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch approvals' }, { status: 500 });
  }
}

/**
 * POST /api/approvals — Create a new approval request
 */
export async function POST(request: Request) {
  try {
    const orgId = await resolveOrgId();
    const body = await request.json();
    const { agentName, actionType, payload } = body;

    if (!agentName || !actionType || !payload) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const approval = await prisma.actionApproval.create({
      data: {
        agentName,
        actionType,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
        orgId,
      },
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create approval request' }, { status: 500 });
  }
}
