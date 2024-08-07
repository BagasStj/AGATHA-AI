import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'UserId is required' }, { status: 400 });
    }

    const documents = await prisma.file.findMany({
      select: {
        id: true,
        fileName: true,
        created: true,
      },
      where: {
        userId: userId,
      },
      orderBy: {
        created: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}