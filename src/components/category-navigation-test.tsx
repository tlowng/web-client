import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { 
  getForumCategories, 
  getForumTopics, 
  getCategoryBySlug, 
} from '@/api';

export function CategoryNavigationTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const navigate = useNavigate();

  const logResult = (message: string) => {
    console.log(message);
    setResult(prev => prev + message + '\n');
  };

  const clearResults = () => setResult('');

  const testCategoryPageNavigation = async () => {
    setLoading(true);
    clearResults();
    logResult('🧭 TESTING CATEGORY PAGE NAVIGATION...\n');
    
    try {
      // 1. Get all categories
      logResult('📋 Step 1: Getting all categories...');
      const categories = await getForumCategories();
      
      for (const category of categories) {
        logResult(`\n🔍 Testing category: "${category.name}"`);
        logResult(`   ID: ${category._id}`);
        logResult(`   Slug: ${category.slug}`);
        
        try {
          // Test getting category by slug
          logResult(`   📄 Getting category by slug "${category.slug}"...`);
          const categoryBySlug = await getCategoryBySlug(category.slug);
          logResult(`   ✅ Category found: ${JSON.stringify(categoryBySlug, null, 2)}`);
          
          // Test getting topics for this category
          logResult(`   📝 Getting topics for category "${category.slug}"...`);
          const topicsInCategory = await getForumTopics({ category: category.slug });
          logResult(`   ✅ Found ${topicsInCategory.length} topics`);
          
          if (topicsInCategory.length > 0) {
            topicsInCategory.forEach((topic, index) => {
              logResult(`     ${index + 1}. "${topic.title}"`);
              logResult(`        - Topic ID: ${topic._id}`);
              logResult(`        - Topic Slug: ${topic.slug}`);
              logResult(`        - Category in topic: ${topic.category ? JSON.stringify(topic.category) : 'NULL'}`);
              logResult(`        - Author: ${topic.author.username}`);
              logResult(`        - Created: ${topic.createdAt}`);
            });
          }
          
        } catch (error: any) {
          logResult(`   ❌ Error with category "${category.name}": ${error.message}`);
        }
      }
      
    } catch (error: any) {
      logResult(`❌ Overall navigation test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificThongBaoCategory = async () => {
    setLoading(true);
    clearResults();
    logResult('🎯 TESTING "THÔNG BÁO" CATEGORY SPECIFICALLY...\n');
    
    try {
      // Test different ways to access "Thông báo" category
      const testSlugs = ['thong-bao', 'thông-báo', 'thongbao', 'announcement', 'notifications'];
      
      for (const slug of testSlugs) {
        logResult(`\n🔍 Testing slug: "${slug}"`);
        try {
          const category = await getCategoryBySlug(slug);
          logResult(`   ✅ Category found: ${JSON.stringify(category, null, 2)}`);
          
          // Get topics for this category
          const topics = await getForumTopics({ category: slug });
          logResult(`   📝 Topics found: ${topics.length}`);
          
          topics.forEach((topic, index) => {
            logResult(`     ${index + 1}. "${topic.title}"`);
            
            // Check if this topic's category matches
            if (topic.category) {
              const topicCategoryId = topic.category._id || topic.category;
              const expectedCategoryId = category._id;
              
              if (topicCategoryId === expectedCategoryId) {
                logResult(`        ✅ Category matches! (${topicCategoryId})`);
              } else {
                logResult(`        ❌ Category MISMATCH! Topic: ${topicCategoryId}, Expected: ${expectedCategoryId}`);
              }
            } else {
              logResult(`        ⚠️  Topic has NO category assigned!`);
            }
          });
          
        } catch (error: any) {
          logResult(`   ❌ Slug "${slug}" failed: ${error.message}`);
        }
      }
      
    } catch (error: any) {
      logResult(`❌ Thông báo test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTopicCategoryConsistency = async () => {
    setLoading(true);
    clearResults();
    logResult('🔄 TESTING TOPIC-CATEGORY CONSISTENCY...\n');
    
    try {
      // Get all topics
      logResult('📝 Getting all topics...');
      const allTopics = await getForumTopics({ limit: 50 });
      logResult(`✅ Found ${allTopics.length} topics total`);
      
      // Get all categories
      logResult('\n📋 Getting all categories...');
      const allCategories = await getForumCategories();
      logResult(`✅ Found ${allCategories.length} categories total`);
      
      // Create category lookup map
      const categoryMap = new Map();
      allCategories.forEach(cat => {
        categoryMap.set(cat._id, cat);
      });
      
      logResult('\n🔍 Checking topic-category consistency...');
      
      let inconsistentTopics = 0;
      let topicsWithoutCategory = 0;
      let topicsWithValidCategory = 0;
      
      allTopics.forEach((topic, index) => {
        logResult(`\n${index + 1}. "${topic.title}"`);
        logResult(`   Topic ID: ${topic._id}`);
        logResult(`   Topic Slug: ${topic.slug}`);
        
        if (!topic.category) {
          logResult(`   ⚠️  NO CATEGORY ASSIGNED`);
          topicsWithoutCategory++;
        } else {
          const categoryId = topic.category._id || topic.category;
          const categoryName = topic.category.name || 'Unknown';
          
          logResult(`   Category ID: ${categoryId}`);
          logResult(`   Category Name: ${categoryName}`);
          
          if (categoryMap.has(categoryId)) {
            const validCategory = categoryMap.get(categoryId);
            if (validCategory.name === categoryName) {
              logResult(`   ✅ Category is VALID and CONSISTENT`);
              topicsWithValidCategory++;
            } else {
              logResult(`   ⚠️  Category name MISMATCH! Expected: "${validCategory.name}", Got: "${categoryName}"`);
              inconsistentTopics++;
            }
          } else {
            logResult(`   ❌ Category ID NOT FOUND in categories list!`);
            inconsistentTopics++;
          }
        }
      });
      
      logResult(`\n📊 SUMMARY:`);
      logResult(`   ✅ Topics with valid category: ${topicsWithValidCategory}`);
      logResult(`   ⚠️  Topics without category: ${topicsWithoutCategory}`);
      logResult(`   ❌ Topics with inconsistent category: ${inconsistentTopics}`);
      
      if (inconsistentTopics > 0 || topicsWithoutCategory > 0) {
        logResult(`\n🚨 DATABASE INCONSISTENCY DETECTED!`);
      } else {
        logResult(`\n✅ All topics have consistent categories`);
      }
      
    } catch (error: any) {
      logResult(`❌ Consistency test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const navigateToThongBaoCategory = () => {
    logResult('🧭 Navigating to Thông báo category page...');
    // Try different possible slugs
    navigate('/forum/thong-bao');
  };

  const testRecentTopics = async () => {
    setLoading(true);
    clearResults();
    logResult('⏰ TESTING RECENT TOPICS...\n');
    
    try {
      const recentTopics = await getForumTopics({ sort: 'newest', limit: 10 });
      logResult(`✅ Found ${recentTopics.length} recent topics:`);
      
      recentTopics.forEach((topic, index) => {
        logResult(`\n${index + 1}. "${topic.title}"`);
        logResult(`   Created: ${topic.createdAt}`);
        logResult(`   Author: ${topic.author.username}`);
        logResult(`   Category: ${topic.category ? JSON.stringify(topic.category) : 'NO CATEGORY'}`);
        logResult(`   Slug: ${topic.slug}`);
        
        // Check if we can navigate to this topic
        logResult(`   🔗 Navigation URL: /forum/topic/${topic.slug}`);
      });
      
    } catch (error: any) {
      logResult(`❌ Recent topics test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-700">🧭 CATEGORY NAVIGATION DEBUG</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-orange-100 p-3 rounded border border-orange-300">
          <h4 className="font-bold text-orange-800">🎯 TESTING FOCUS:</h4>
          <p className="text-orange-700 text-sm">
            Check why topics appear in wrong categories and if category filtering works correctly.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Button 
            onClick={testCategoryPageNavigation} 
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Test All Categories
          </Button>
          
          <Button 
            onClick={testSpecificThongBaoCategory} 
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            Test Thông Báo
          </Button>
          
          <Button 
            onClick={testTopicCategoryConsistency} 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Test Consistency
          </Button>
          
          <Button 
            onClick={testRecentTopics} 
            disabled={loading}
            variant="outline"
          >
            Test Recent Topics
          </Button>
          
          <Button 
            onClick={navigateToThongBaoCategory} 
            disabled={loading}
            variant="secondary"
          >
            Go to Thông Báo
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
            <h4 className="font-semibold mb-2">Navigation Test Results:</h4>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-auto whitespace-pre-wrap max-h-96 font-mono">
              {result}
            </pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600 mt-4">
          <strong>Navigation Tests:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li><strong>Test All Categories</strong>: Check each category's topics and slugs</li>
            <li><strong>Test Thông Báo</strong>: Focus on the problematic category</li>
            <li><strong>Test Consistency</strong>: Verify topic-category relationships</li>
            <li><strong>Test Recent Topics</strong>: Check newest topics and their categories</li>
            <li><strong>Go to Thông Báo</strong>: Navigate directly to category page</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}