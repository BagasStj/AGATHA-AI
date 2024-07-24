import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { prompt, temperature, topP, presencePenalty, frequencyPenalty, maxTokens } = await req.json();

    const chatSettings = await prisma.chatSettings.create({
      data: {
        prompt,
        temperature,
        topP,
        presencePenalty,
        frequencyPenalty,
        maxTokens,
      },
    });

    return NextResponse.json(chatSettings, { status: 201 });
  } catch (error) {
    console.error('Error saving chat settings:', error);
    return NextResponse.json({ message: 'Error saving chat settings' }, { status: 500 });
  }
}