// src/components/frontend-cleanup-tool.tsx
// TOOL TO VERIFY FIXES AND CLEAN UP DATA FROM FRONTEND

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { getForumCategories, getForumTopics } from '@/api';

export function FrontendCleanupTool() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  const logResult = (message: string) => {
    console.log(message);
    setResult(prev => prev + message + '\n');
  };

  const clearResults = () => setResult('');

  const verifyBackendFixes = async () => {
    setLoading(true);
    clearResults();
    logResult('🔍 VERIFYING BACKEND FIXES...\n');
    
    try {
      const token = localStorage.getItem('token');
      
      // Test 1: Try to create topic with invalid categoryId
      logResult('📝 Test 1: Creating topic with INVALID categoryId...');
      try {
        const invalidResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/forum/topics`,
          {
            title: "Test Invalid Category",
            content: "This should fail with proper validation",
            categoryId: "507f1f77bcf86cd799439011", // Invalid ID
            tags: ["validation-test"]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            }
          }
        );
        
        logResult('❌ BACKEND NOT FIXED: Invalid categoryId was accepted!');
        logResult(`   Response: ${JSON.stringify(invalidResponse.data, null, 2)}`);
        
      } catch (error: any) {
        if (error.response?.status === 400) {
          logResult('✅ BACKEND FIXED: Invalid categoryId properly rejected!');
          logResult(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
          logResult(`⚠️  Unexpected error: ${error.message}`);
        }
      }
      
      // Test 2: Try to create topic with short title
      logResult('\n📝 Test 2: Creating topic with SHORT title...');
      try {
        const shortTitleResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/forum/topics`,
          {
            title: "123", // Too short
            content: "This should fail with title validation",
            categoryId: "6879168bad86e470dc1e8b4b",
            tags: ["validation-test"]
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token
            }
          }
        );
        
        logResult('❌ BACKEND NOT FIXED: Short title was accepted!');
        logResult(`   Response: ${JSON.stringify(shortTitleResponse.data, null, 2)}`);
        
      } catch (error: any) {
        if (error.response?.status === 400) {
          logResult('✅ BACKEND FIXED: Short title properly rejected!');
          logResult(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
          logResult(`⚠️  Unexpected error: ${error.message}`);
        }
      }
      
      // Test 3: Check if category filtering is fixed
      logResult('\n📝 Test 3: Checking category filtering...');
      const categoryTopics = await getForumTopics({ category: 'thong-bao' });
      
      const topicsWithNullCategory = categoryTopics.filter(topic => !topic.category);
      
      if (topicsWithNullCategory.length > 0) {
        logResult(`❌ BACKEND NOT FIXED: Found ${topicsWithNullCategory.length} topics with NULL category in "Thông báo"`);
        topicsWithNullCategory.forEach((topic, index) => {
          logResult(`   ${index + 1}. "${topic.title}" - ID: ${topic._id}`);
        });
      } else {
        logResult('✅ BACKEND FIXED: All topics in "Thông báo" have valid categories!');
      }
      
    } catch (error: any) {
      logResult(`❌ Verification failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testValidTopicCreation = async () => {
    setLoading(true);
    clearResults();
    logResult('✅ TESTING VALID TOPIC CREATION...\n');
    
    try {
      const token = localStorage.getItem('token');
      const categories = await getForumCategories();
      
      if (categories.length === 0) {
        logResult('❌ No categories available for testing');
        return;
      }
      
      const validCategory = categories[0];
      logResult(`Using category: "${validCategory.name}" (${validCategory._id})`);
      
      const validTopicData = {
        title: "Valid Test Topic with Proper Validation",
        content: "This is a properly formatted topic with sufficient content length to pass validation requirements. It should be created successfully.",
        categoryId: validCategory._id,
        tags: ["test", "validation", "success"]
      };
      
      logResult(`📡 Creating topic: ${JSON.stringify(validTopicData, null, 2)}`);
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/forum/topics`,
        validTopicData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      
      logResult('✅ SUCCESS: Valid topic created!');
      logResult(`📄 Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data?.data?.slug) {
        logResult(`🔗 Topic URL: /forum/topic/${response.data.data.slug}`);
        
        // Test navigation
        setTimeout(() => {
          toast.success('Navigating to created topic...');
          navigate(`/forum/topic/${response.data.data.slug}`);
        }, 2000);
      }
      
    } catch (error: any) {
      logResult(`❌ Valid topic creation failed: ${error.message}`);
      logResult(`📄 Response: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const analyzeDataConsistency = async () => {
    setLoading(true);
    clearResults();
    logResult('📊 ANALYZING DATA CONSISTENCY...\n');
    
    try {
      // Get all categories and topics
      const categories = await getForumCategories();
      const allTopics = await getForumTopics({ limit: 100 });
      
      logResult(`📋 Total categories: ${categories.length}`);
      logResult(`📝 Total topics analyzed: ${allTopics.length}`);
      
      // Create category map
      const categoryMap = new Map();
      categories.forEach(cat => categoryMap.set(cat._id, cat));
      
      // Analyze topics
      let validTopics = 0;
      let invalidTopics = 0;
      let nullCategoryTopics = 0;
      
      const invalidTopicsList: any[] = [];
      
      allTopics.forEach(topic => {
        if (!topic.category) {
          nullCategoryTopics++;
          invalidTopicsList.push({
            id: topic._id,
            title: topic.title,
            issue: 'NULL_CATEGORY'
          });
        } else {
          const categoryId = topic.category._id || topic.category;
          if (categoryMap.has(categoryId)) {
            validTopics++;
          } else {
            invalidTopics++;
            invalidTopicsList.push({
              id: topic._id,
              title: topic.title,
              categoryId: categoryId,
              issue: 'INVALID_CATEGORY_ID'
            });
          }
        }
      });
      
      logResult(`\n📊 ANALYSIS RESULTS:`);
      logResult(`   ✅ Valid topics: ${validTopics}`);
      logResult(`   ❌ Topics with invalid category ID: ${invalidTopics}`);
      logResult(`   ⚠️  Topics with NULL category: ${nullCategoryTopics}`);
      
      if (invalidTopicsList.length > 0) {
        logResult(`\n🚨 PROBLEMATIC TOPICS:`);
        invalidTopicsList.forEach((topic, index) => {
          logResult(`   ${index + 1}. "${topic.title}"`);
          logResult(`      ID: ${topic.id}`);
          logResult(`      Issue: ${topic.issue}`);
          if (topic.categoryId) {
            logResult(`      Invalid Category ID: ${topic.categoryId}`);
          }
        });
        
        logResult(`\n💡 RECOMMENDATION:`);
        logResult(`   1. Run database cleanup script on backend`);
        logResult(`   2. Move orphaned topics to default category`);
        logResult(`   3. Fix backend validation to prevent future issues`);
      } else {
        logResult(`\n✅ ALL TOPICS HAVE VALID CATEGORIES!`);
      }
      
      // Category topic counts
      logResult(`\n📋 CATEGORY BREAKDOWN:`);
      categories.forEach(category => {
        const topicsInCategory = allTopics.filter(topic => {
          const topicCategoryId = topic.category?._id || topic.category;
          return topicCategoryId === category._id;
        });
        
        logResult(`   "${category.name}": ${topicsInCategory.length} topics`);
      });
      
    } catch (error: any) {
      logResult(`❌ Analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cleanupTestTopics = async () => {
    setLoading(true);
    clearResults();
    logResult('🧹 CLEANING UP TEST TOPICS...\n');
    
    try {
      const token = localStorage.getItem('token');
      const allTopics = await getForumTopics({ limit: 100 });
      
      // Find test topics (topics with debug/test tags or titles)
      const testTopics = allTopics.filter(topic => 
        topic.title.toLowerCase().includes('test') ||
        topic.title.toLowerCase().includes('debug') ||
        topic.tags?.some((tag: string) => 
          ['test', 'debug', 'validation-test', 'category-test'].includes(tag.toLowerCase())
        )
      );
      
      logResult(`🔍 Found ${testTopics.length} test topics to clean up:`);
      
      let cleanedCount = 0;
      
      for (const topic of testTopics) {
        try {
          logResult(`   Deleting: "${topic.title}" (${topic._id})`);
          
          // Note: This assumes you have a DELETE endpoint
          // You might need to implement this on the backend
          await axios.delete(
            `${import.meta.env.VITE_API_URL}/forum/topics/${topic._id}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'x-auth-token': token
              }
            }
          );
          
          cleanedCount++;
          logResult(`     ✅ Deleted successfully`);
          
        } catch (error: any) {
          logResult(`     ❌ Failed to delete: ${error.message}`);
        }
      }
      
      logResult(`\n✅ Cleanup completed: ${cleanedCount}/${testTopics.length} topics deleted`);
      
      if (cleanedCount > 0) {
        toast.success(`Cleaned up ${cleanedCount} test topics`);
      }
      
    } catch (error: any) {
      logResult(`❌ Cleanup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto mb-6 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="text-green-700">🛠️ FRONTEND CLEANUP & VERIFICATION TOOL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-green-100 p-3 rounded border border-green-300">
          <h4 className="font-bold text-green-800">🎯 PURPOSE:</h4>
          <p className="text-green-700 text-sm">
            Verify backend fixes, test valid topic creation, analyze data consistency, and clean up test data.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button 
            onClick={verifyBackendFixes} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            Verify Backend Fixes
          </Button>
          
          <Button 
            onClick={testValidTopicCreation} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            Test Valid Creation
          </Button>
          
          <Button 
            onClick={analyzeDataConsistency} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Analyze Data
          </Button>
          
          <Button 
            onClick={cleanupTestTopics} 
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Cleanup Test Data
          </Button>
        </div>

        <Button 
          onClick={clearResults} 
          disabled={loading}
          variant="ghost" 
          size="sm"
        >
          Clear Results
        </Button>
        
        {result && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Verification Results:</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto whitespace-pre-wrap max-h-96 font-mono">
              {result}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 mt-4">
          <strong>Tool Functions:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li><strong>Verify Backend Fixes</strong>: Test if backend validation is working</li>
            <li><strong>Test Valid Creation</strong>: Create a properly formatted topic</li>
            <li><strong>Analyze Data</strong>: Check database consistency and identify issues</li>
            <li><strong>Cleanup Test Data</strong>: Remove test topics created during debugging</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}