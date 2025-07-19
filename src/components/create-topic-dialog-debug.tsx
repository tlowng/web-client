// src/components/create-topic-dialog-debug.tsx
// Copy CreateTopicDialog hiện tại và thêm debug logs

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { getMe } from '@/api';
import type { ForumCategory, UserProfile } from '@/api';
import axios from 'axios';

interface CreateTopicDialogDebugProps {
  categories: ForumCategory[];
  children: React.ReactNode;
  defaultCategoryId?: string;
}

export function CreateTopicDialogDebug({ categories, children, defaultCategoryId }: CreateTopicDialogDebugProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: defaultCategoryId || '',
    tags: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('🔍 CreateTopicDialog Auth Check:', !!token);
      
      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = await getMe();
        console.log('✅ CreateTopicDialog User loaded:', user);
        setCurrentUser(user);
      } catch (error) {
        console.error('❌ CreateTopicDialog Auth failed:', error);
        setCurrentUser(null);
        localStorage.removeItem('token');
      }
    };

    if (open) {
      checkAuth();
    }
  }, [open]);

  const handleSubmitDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 CreateTopicDialog Submit Started');
    console.log('📝 Form Data:', formData);
    console.log('👤 Current User:', currentUser);
    
    if (!currentUser) {
      console.log('❌ No user - redirecting to login');
      toast.error('Please login to create topics');
      navigate('/login');
      return;
    }

    if (!formData.title.trim()) {
      console.log('❌ Missing title');
      toast.error('Please enter a title');
      return;
    }

    if (!formData.content.trim()) {
      console.log('❌ Missing content');
      toast.error('Please enter content');
      return;
    }

    if (!formData.categoryId) {
      console.log('❌ Missing category');
      toast.error('Please select a category');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      console.log('🔑 Token preview:', token?.substring(0, 20) + '...');

      // Process tags exactly like test component
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      console.log('🏷️ Processed tags:', tags);

      const requestData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        tags: tags
      };

      console.log('📡 Request data:', requestData);
      console.log('🌐 API URL:', `${import.meta.env.VITE_API_URL}/forum/topics`);

      // USE EXACT SAME APPROACH AS WORKING TEST COMPONENT
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

      console.log('✅ CreateTopicDialog Response:', response);
      console.log('✅ Response data:', response.data);

      toast.success('Topic created successfully!');
      setOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        categoryId: defaultCategoryId || '',
        tags: '',
      });
      
      // Navigate using same logic as test component
      if (response.data?.success && response.data?.data?.slug) {
        console.log('🔄 Navigating to:', `/forum/topic/${response.data.data.slug}`);
        navigate(`/forum/topic/${response.data.data.slug}`);
      } else {
        console.warn('⚠️ Unexpected response structure:', response.data);
        window.location.reload();
      }
      
    } catch (error: any) {
      console.error('❌ CreateTopicDialog Error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      let message = 'Failed to create topic';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            message = 'Please login to create topics';
            localStorage.removeItem('token');
            navigate('/login');
            break;
          case 403:
            message = 'You do not have permission to create topics';
            break;
          case 429:
            message = 'Too many requests. Please wait before creating another topic';
            break;
          case 400:
            message = data?.message || 'Invalid topic data';
            break;
          default:
            message = data?.message || `Server error (${status})`;
        }
      } else if (error.request) {
        message = 'Network error. Please check your connection';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log('🔄 Dialog open change:', newOpen);
    if (!newOpen) {
      setFormData({
        title: '',
        content: '',
        categoryId: defaultCategoryId || '',
        tags: '',
      });
    }
    setOpen(newOpen);
  };

  // Show login prompt if not authenticated
  if (open && !currentUser && !loading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to create topics.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              setOpen(false);
              navigate('/login');
            }}>
              Go to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmitDirect}>
          <DialogHeader>
            <DialogTitle>Create New Topic (DEBUG VERSION)</DialogTitle>
            <DialogDescription>
              This is the debug version with detailed logging
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title"
                value={formData.title}
                onChange={(e) => {
                  console.log('📝 Title changed:', e.target.value);
                  setFormData({ ...formData, title: e.target.value });
                }}
                maxLength={200}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => {
                  console.log('📁 Category changed:', value);
                  setFormData({ ...formData, categoryId: value });
                }}
                required
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      <span className="flex items-center gap-2">
                        <span style={{ color: category.color }}>{category.icon}</span>
                        {category.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your topic content here..."
                className="min-h-[200px] resize-y"
                value={formData.content}
                onChange={(e) => {
                  console.log('📄 Content changed:', e.target.value.length, 'chars');
                  setFormData({ ...formData, content: e.target.value });
                }}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                placeholder="test, debug, frontend (comma separated)"
                value={formData.tags}
                onChange={(e) => {
                  console.log('🏷️ Tags changed:', e.target.value);
                  setFormData({ ...formData, tags: e.target.value });
                }}
              />
            </div>

            {/* DEBUG INFO */}
            <div className="text-xs bg-gray-100 p-2 rounded">
              <strong>DEBUG INFO:</strong><br/>
              User: {currentUser?.username || 'Not loaded'}<br/>
              Title: {formData.title.length} chars<br/>
              Content: {formData.content.length} chars<br/>
              Category: {formData.categoryId}<br/>
              Tags: {formData.tags}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !currentUser}>
              {loading ? 'Creating...' : 'Create Topic (DEBUG)'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}