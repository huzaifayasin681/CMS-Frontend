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

export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request);
    if (!headers) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    
    // Forward all query parameters to backend
    const queryString = searchParams.toString();
    const backendUrl = `${BACKEND_API_URL}/v1/notifications${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform _id to id for frontend compatibility
    if (data.data && data.data.notifications) {
      data.data.notifications = data.data.notifications.map((notification: any) => ({
        ...notification,
        id: notification._id
      }));
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}