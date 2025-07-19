// src/components/category-bug-debug.tsx
// COMPONENT ĐỂ DEBUG BUG CATEGORY

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { getForumCategories, getForumTopics } from '@/api';

export function CategoryBugDebug() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [testCategoryId, setTestCategoryId] = useState('6879168bad86e470dc1e8b4b');

  const logResult = (message: string) => {
    console.log(message);
    setResult(prev => prev + message + '\n');
  };

  const clearResults = () => setResult('');

  const testCategoryValidation = async () => {
    setLoading(true);
    clearResults();
    logResult('🔍 TESTING CATEGORY VALIDATION BUG...\n');
    
    try {
      // 1. Get all categories
      logResult('📋 Step 1: Getting all categories...');
      const categories = await getForumCategories();
      logResult(`✅ Found ${categories.length} categories:`);
      
      categories.forEach((cat, index) => {
        logResult(`  ${index + 1}. "${cat.name}" - ID: ${cat._id}`);
        if (cat.name.includes('thông báo') || cat.name.includes('Thông báo')) {
          logResult(`      ⚠️  THIS IS THE "THÔNG BÁO" CATEGORY!`);
        }
      });
      
      // 2. Test create topic with "Thông báo" category
      logResult('\n📝 Step 2: Testing create topic with "Thông báo" category...');
      const thongBaoId = '6879168bad86e470dc1e8b4b';
      
      await testCreateTopicWithCategory(thongBaoId, 'Topic for Thông Báo Category');
      
      // 3. Test create topic with unknown category
      logResult('\n📝 Step 3: Testing create topic with UNKNOWN category...');
      const unknownId = '507f1f77bcf86cd799439011'; // MongoDB ObjectId format but doesn't exist
      
      await testCreateTopicWithCategory(unknownId, 'Topic with Unknown Category');
      
      // 4. Test create topic with first valid category
      if (categories.length > 0) {
        logResult('\n📝 Step 4: Testing create topic with FIRST VALID category...');
        const firstValidId = categories[0]._id;
        logResult(`  Using category: "${categories[0].name}" - ID: ${firstValidId}`);
        
        await testCreateTopicWithCategory(firstValidId, 'Topic with First Valid Category');
      }
      
      // 5. Check topics in "Thông báo" category
      logResult('\n📋 Step 5: Checking topics in "Thông báo" category...');
      await checkTopicsInCategory('thong-bao'); // Assuming slug
      
    } catch (error: any) {
      logResult(`❌ Overall test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateTopicWithCategory = async (categoryId: string, title: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const requestData = {
        title: title,
        content: `This is a test topic created to debug category validation. Category ID used: ${categoryId}`,
        categoryId: categoryId,
        tags: ['debug', 'category-test']
      };

      logResult(`  📡 Request data: ${JSON.stringify(requestData, null, 2)}`);

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

      logResult(`  ✅ SUCCESS: Topic created!`);
      logResult(`  📄 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      // Check what category was actually assigned
      if (response.data?.data?.category) {
        logResult(`  🏷️  Topic assigned to category: ${JSON.stringify(response.data.data.category)}`);
      } else {
        logResult(`  ⚠️  No category info in response!`);
      }
      
      return response.data;
      
    } catch (error: any) {
      logResult(`  ❌ FAILED: ${error.message}`);
      logResult(`  📄 Status: ${error.response?.status}`);
      logResult(`  📄 Response: ${JSON.stringify(error.response?.data, null, 2)}`);
      
      if (error.response?.data?.errors) {
        logResult(`  📋 Detailed errors:`);
        error.response.data.errors.forEach((err: any, index: number) => {
          logResult(`    ${index + 1}. ${JSON.stringify(err)}`);
        });
      }
      
      return null;
    }
  };

  const checkTopicsInCategory = async (categorySlug: string) => {
    try {
      logResult(`  🔍 Fetching topics for category slug: "${categorySlug}"`);
      
      // Try to get topics by category
      const topics = await getForumTopics({ category: categorySlug });
      
      logResult(`  ✅ Found ${topics.length} topics in this category:`);
      topics.forEach((topic, index) => {
        logResult(`    ${index + 1}. "${topic.title}"`);
        logResult(`       - Created: ${topic.createdAt}`);
        logResult(`       - Category: ${topic.category ? JSON.stringify(topic.category) : 'NO CATEGORY'}`);
        logResult(`       - ID: ${topic._id}`);
      });
      
    } catch (error: any) {
      logResult(`  ❌ Failed to get topics: ${error.message}`);
    }
  };

  const testSpecificCategoryId = async () => {
    setLoading(true);
    clearResults();
    
    logResult(`🧪 Testing specific category ID: ${testCategoryId}\n`);
    
    await testCreateTopicWithCategory(testCategoryId, `Test Topic for ID ${testCategoryId}`);
    
    setLoading(false);
  };

  const inspectCategoryDetails = async () => {
    setLoading(true);
    clearResults();
    logResult('🔍 INSPECTING CATEGORY DETAILS...\n');
    
    try {
      // Get categories via different methods
      logResult('📋 Method 1: Using getForumCategories()...');
      const categories1 = await getForumCategories();
      
      logResult('📋 Method 2: Direct API call...');
      const response2 = await axios.get(
        `${import.meta.env.VITE_API_URL}/forum/categories`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': localStorage.getItem('token')
          }
        }
      );
      
      logResult('📊 COMPARISON:');
      logResult(`Method 1 result: ${JSON.stringify(categories1, null, 2)}`);
      logResult(`Method 2 result: ${JSON.stringify(response2.data, null, 2)}`);
      
      // Check if "Thông báo" category exists
      const thongBaoCategory = categories1.find(cat => 
        cat._id === '6879168bad86e470dc1e8b4b' || 
        cat.name.toLowerCase().includes('thông báo')
      );
      
      if (thongBaoCategory) {
        logResult(`\n✅ Found "Thông báo" category:`);
        logResult(`   ${JSON.stringify(thongBaoCategory, null, 2)}`);
      } else {
        logResult(`\n❌ "Thông báo" category NOT FOUND!`);
      }
      
    } catch (error: any) {
      logResult(`❌ Inspection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testBackendDirectly = async () => {
    setLoading(true);
    clearResults();
    logResult('🌐 TESTING BACKEND DIRECTLY...\n');
    
    try {
      // Test categories endpoint
      logResult('1. Testing /forum/categories...');
      const categoriesResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/forum/categories`
      );
      logResult(`   ✅ Status: ${categoriesResponse.status}`);
      logResult(`   📄 Data: ${JSON.stringify(categoriesResponse.data, null, 2)}`);
      
      // Test topics endpoint
      logResult('\n2. Testing /forum/topics...');
      const topicsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/forum/topics`
      );
      logResult(`   ✅ Status: ${topicsResponse.status}`);
      logResult(`   📄 Topics count: ${topicsResponse.data?.data?.topics?.length || 'N/A'}`);
      
      // Test topics by specific category
      logResult('\n3. Testing /forum/topics?category=thong-bao...');
      const categoryTopicsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/forum/topics?category=thong-bao`
      );
      logResult(`   ✅ Status: ${categoryTopicsResponse.status}`);
      logResult(`   📄 Category topics: ${JSON.stringify(categoryTopicsResponse.data, null, 2)}`);
      
    } catch (error: any) {
      logResult(`❌ Backend test failed: ${error.message}`);
      if (error.response) {
        logResult(`   Status: ${error.response.status}`);
        logResult(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto mb-6 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-700">🐛 CATEGORY BUG DEBUG PANEL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
          <h4 className="font-bold text-yellow-800">🚨 REPORTED BUG:</h4>
          <p className="text-yellow-700 text-sm">
            Topic created with unknown categoryId appears in "Thông báo" category, 
            but topic with "Thông báo" categoryId fails with 400 error.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            onClick={testCategoryValidation} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            Full Category Test
          </Button>
          
          <Button 
            onClick={inspectCategoryDetails} 
            disabled={loading}
            variant="outline"
          >
            Inspect Categories
          </Button>
          
          <Button 
            onClick={testBackendDirectly} 
            disabled={loading}
            variant="outline"
          >
            Test Backend
          </Button>
          
          <Button 
            onClick={clearResults} 
            disabled={loading}
            variant="ghost"
          >
            Clear Results
          </Button>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="test-category-id">Test Specific Category ID:</Label>
          <div className="flex gap-2">
            <Input
              id="test-category-id"
              value={testCategoryId}
              onChange={(e) => setTestCategoryId(e.target.value)}
              placeholder="Enter category ID to test"
            />
            <Button 
              onClick={testSpecificCategoryId}
              disabled={loading}
              variant="secondary"
            >
              Test ID
            </Button>
          </div>
        </div>
        
        {result && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Debug Results:</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto whitespace-pre-wrap max-h-96 font-mono">
              {result}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 mt-4">
          <strong>Debug Strategy:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li><strong>Full Category Test</strong>: Test all scenarios systematically</li>
            <li><strong>Inspect Categories</strong>: Check if "Thông báo" category exists</li>
            <li><strong>Test Backend</strong>: Direct API calls to isolate frontend issues</li>
            <li><strong>Test Specific ID</strong>: Test any category ID manually</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}