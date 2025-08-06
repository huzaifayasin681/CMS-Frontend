import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function getAuthHeaders(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }
  
  return {
    'Authorization': authHeader,
    'Content-Type': 'application/json'
  };
}

export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request);
    if (!headers) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    
    const response = await fetch(`${BACKEND_API_URL}/v1/test/test-notification`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to create test notification' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}