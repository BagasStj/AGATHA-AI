import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { question } = await req.json();

  try {
    const response = await fetch(
      "http://localhost:3001/api/v1/prediction/d53b8250-9cc0-463d-bdf0-0e52822bc6a3",
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