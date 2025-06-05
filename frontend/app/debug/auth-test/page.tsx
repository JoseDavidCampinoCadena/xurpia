'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { getCookie } from '@/app/utils/cookies';
import { evaluationsApi } from '@/app/api/evaluations.api';

const AuthTestPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | undefined>('');
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = getCookie('token');
    setToken(storedToken);
  }, []);

  const testEvaluationsAPI = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      console.log('🧪 Testing evaluations API...');
      console.log('User:', user);
      console.log('Token present:', !!token);
      console.log('Is authenticated:', isAuthenticated);
      
      const evaluations = await evaluationsApi.getUserEvaluations();
      console.log('✅ API call successful:', evaluations);
      setTestResult(`Success! Retrieved ${evaluations.length} evaluations`);
    } catch (error: any) {
      console.error('❌ API call failed:', error);
      setTestResult(`Error: ${error?.response?.status} - ${error?.response?.data?.message || error?.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>User ID:</strong> {user?.id || 'None'}</p>
            <p><strong>User Name:</strong> {user?.name || 'None'}</p>
            <p><strong>User Email:</strong> {user?.email || 'None'}</p>
            <p><strong>Token Present:</strong> {token ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Token (first 20 chars):</strong> {token ? token.substring(0, 20) + '...' : 'None'}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          <button 
            onClick={testEvaluationsAPI}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test getUserEvaluations API'}
          </button>
          
          {testResult && (
            <div className={`mt-4 p-3 rounded ${testResult.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {testResult}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Browser Storage</h2>
          <div className="space-y-2">
            <p><strong>Token Cookie:</strong> {getCookie('token') || 'Not set'}</p>
            <p><strong>User Cookie:</strong> {getCookie('user') || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;
