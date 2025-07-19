// src/components/immediate-create-topic-test.tsx
// TEST COMPONENT - Add này vào ForumPage để test ngay

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';

export function ImmediateCreateTopicTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  const testCreateTopicDirect = async () => {
    setLoading(true);
    setResult('Testing direct API call...');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setResult('❌ No token found - please login first');
        return;
      }

      // Copy exact request from your working Insomnia test
      const requestData = {
        title: "TEST FROM FRONTEND",
        content: "Testing create topic from React frontend",
        categoryId: "6645b2067751a02165e3b3d1", // Use same categoryId that worked
        tags: ["test", "frontend", "debug"]
      };

      console.log('Making direct axios call...');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/forum/topics`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      console.log('Direct API response:', response);

      if (response.data?.success && response.data?.data?.slug) {
        setResult(`✅ SUCCESS! Topic created with slug: ${response.data.data.slug}`);
        toast.success('Topic created successfully!');
        
        // Navigate to the new topic
        setTimeout(() => {
          navigate(`/forum/topic/${response.data.data.slug}`);
        }, 1000);
      } else {
        setResult(`⚠️ Unexpected response structure: ${JSON.stringify(response.data, null, 2)}`);
      }

    } catch (error: any) {
      console.error('Direct API call failed:', error);
      
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        url: error.config?.url
      };

      setResult(`❌ ERROR: ${JSON.stringify(errorDetails, null, 2)}`);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed - please login again');
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setResult(`Token exists: ${token.substring(0, 20)}...`);
    } else {
      setResult('❌ No token found');
    }
  };

  const checkEnvironment = () => {
    const env = {
      API_URL: import.meta.env.VITE_API_URL,
      NODE_ENV: import.meta.env.NODE_ENV,
      DEV: import.meta.env.DEV,
      currentURL: window.location.href
    };
    setResult(`Environment: ${JSON.stringify(env, null, 2)}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto mb-6 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-700">🚨 CREATE TOPIC DEBUG TEST</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={checkEnvironment} variant="outline" size="sm">
            Check Env
          </Button>
          <Button onClick={checkToken} variant="outline" size="sm">
            Check Token
          </Button>
          <Button 
            onClick={testCreateTopicDirect} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Testing...' : 'Test Create Topic'}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Result:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto whitespace-pre-wrap max-h-60">
              {result}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 mt-4">
          <strong>Instructions:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Click "Check Token" to verify authentication</li>
            <li>Click "Test Create Topic" to test API call</li>
            <li>If successful, you'll be redirected to the new topic</li>
            <li>If failed, check the error details in result</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}   