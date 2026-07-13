import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const approval = await prisma.actionApproval.findUnique({
      where: { id: params.id }
    });

    if (!approval) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(approval);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch approval status' }, { status: 500 });
  }
}
