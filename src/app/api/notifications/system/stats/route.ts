import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getAuthHeaders(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  return {
    'Content-Type': 'application/json',
    ...(authorization && { 'Authorization': authorization }),
  };
}

export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request);
    
    const response = await fetch(`${BACKEND_API_URL}/v1/notifications/system/stats`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { message: 'Backend request failed', error: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying system stats request:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}