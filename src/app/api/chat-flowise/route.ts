import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { question } = await req.json();

  try {
    const response = await fetch(
      "https://flowiseai-railway-production-9629.up.railway.app/api/v1/prediction/f903b2f7-6e8a-464c-b299-80011cb0ac73",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json({ content: result.text });
  } catch (error) {
    console.error('Error querying Flowise:', error);
    return NextResponse.json({ error: 'Failed to get response from Flowise' }, { status: 500 });
  }
}