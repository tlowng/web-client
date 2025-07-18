// src/components/simple-api-test.tsx
import  { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import axios from 'axios';

export function SimpleApiTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDirectAPI = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log("Direct API test starting...");
      const API_URL = import.meta.env.VITE_API_URL;
      console.log("Environment API_URL:", API_URL);
      
      if (!API_URL) {
        setResult('❌ VITE_API_URL environment variable is not set!');
        setLoading(false);
        return;
      }

      const fullUrl = `${API_URL}/problems`;
      console.log("Testing URL:", fullUrl);
      
      const response = await axios.get(fullUrl);
      console.log("Direct API response:", response);
      
      setResult(`✅ Success! 
        Status: ${response.status}
        Data length: ${response.data?.length || 'N/A'}
        Data: ${JSON.stringify(response.data, null, 2)}`);
        
    } catch (error: any) {
      console.error("Direct API error:", error);
      
      let errorMsg = '❌ Error: ';
      if (error.code === 'ERR_NETWORK') {
        errorMsg += 'Network error - API server might not be running';
      } else if (error.response) {
        errorMsg += `HTTP ${error.response.status} - ${error.response.statusText}`;
        errorMsg += `\nResponse: ${JSON.stringify(error.response.data, null, 2)}`;
      } else {
        errorMsg += error.message;
      }
      
      setResult(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = () => {
    const envInfo = {
      'VITE_API_URL': import.meta.env.VITE_API_URL,
      'NODE_ENV': import.meta.env.NODE_ENV,
      'DEV': import.meta.env.DEV,
      'PROD': import.meta.env.PROD,
      'All env vars': import.meta.env
    };
    
    setResult(`Environment Info:\n${JSON.stringify(envInfo, null, 2)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simple API Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testDirectAPI} disabled={loading}>
            {loading ? 'Testing...' : 'Test Problems API Direct'}
          </Button>
          <Button onClick={checkEnvironment} variant="outline">
            Check Environment
          </Button>
        </div>
        
        {result && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Result:</h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}