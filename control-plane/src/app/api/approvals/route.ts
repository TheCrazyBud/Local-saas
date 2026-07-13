import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
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
      }
    });

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create approval request' }, { status: 500 });
  }
}
