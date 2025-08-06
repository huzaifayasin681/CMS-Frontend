'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth';
import Cookies from 'js-cookie';

export default function TestAuthPage() {
  const { isAuthenticated, user, token } = useAuthStore();
  const [cookieToken, setCookieToken] = useState<string | undefined>();
  const [apiTest, setApiTest] = useState<string>('Testing...');

  useEffect(() => {
    setCookieToken(Cookies.get('cms_token'));
    
    // Test API call
    const testAPI = async () => {
      try {
        const token = Cookies.get('cms_token');
        const response = await fetch('/api/notifications/unread-count', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiTest(`✅ API Working - Unread: ${data.data?.count || 0}`);
        } else {
          setApiTest(`❌ API Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        setApiTest(`❌ API Error: ${error}`);
      }
    };
    
    if (cookieToken) {
      testAPI();
    }
  }, [cookieToken]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Auth Store Status</h2>
          <p>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
          <p>User: {user?.username || 'None'}</p>
          <p>Token: {token ? '✅ Present' : '❌ Missing'}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">Cookie Status</h2>
          <p>Cookie Token: {cookieToken ? '✅ Present' : '❌ Missing'}</p>
          <p>Length: {cookieToken?.length || 0}</p>
        </div>
        
        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">API Test</h2>
          <p>{apiTest}</p>
        </div>
        
        {!isAuthenticated && (
          <div className="p-4 border rounded bg-yellow-50">
            <h2 className="font-semibold mb-2">🚨 Solution</h2>
            <p>You need to log in first:</p>
            <ol className="list-decimal list-inside mt-2">
              <li>Go to <a href="/login" className="text-blue-600 underline">/login</a></li>
              <li>Username: <code className="bg-gray-200 px-1 rounded">huzaifayasin681</code></li>
              <li>Password: <code className="bg-gray-200 px-1 rounded">test</code></li>
              <li>After login, notifications and WebSocket will work</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}