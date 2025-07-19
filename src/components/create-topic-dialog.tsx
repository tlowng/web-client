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
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';
import { getMe } from '@/api';
import type { ForumCategory, UserProfile } from '@/api';
import axios from 'axios';

interface CreateTopicDialogProps {
  categories: ForumCategory[];
  children: React.ReactNode;
  defaultCategoryId?: string;
}

interface CreateTopicResponse {
  success: boolean;
  data: {
    _id: string;
    title: string;
    content: string;
    author: string;
    category: string;
    slug: string;
    viewCount: number;
    replyCount: number;
    isPinned: boolean;
    isLocked: boolean;
    tags: string[];
    lastActivity: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export function CreateTopicDialog({ categories, children, defaultCategoryId }: CreateTopicDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    tags: '',
  });

  // Set default category when dialog opens
  useEffect(() => {
    if (open && categories.length > 0 && !formData.categoryId) {
      const categoryToUse = defaultCategoryId || categories[0]._id;
      setFormData(prev => ({ ...prev, categoryId: categoryToUse }));
    }
  }, [open, categories, defaultCategoryId, formData.categoryId]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCurrentUser(null);
        return;
      }

      try {
        const user = await getMe();
        setCurrentUser(user);
      } catch (error) {
        console.error('Auth check failed:', error);
        setCurrentUser(null);
        localStorage.removeItem('token');
      }
    };

    if (open) {
      checkAuth();
    }
  }, [open]);

  // HTML formatting helpers
  const insertHtmlTag = (tag: string, hasClosing: boolean = true) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    
    let replacement = '';
    if (hasClosing) {
      replacement = selectedText 
        ? `<${tag}>${selectedText}</${tag}>`
        : `<${tag}></${tag}>`;
    } else {
      replacement = `<${tag}>`;
    }
    
    const newContent = 
      formData.content.substring(0, start) + 
      replacement + 
      formData.content.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Reset cursor position
    setTimeout(() => {
      const newPosition = hasClosing && !selectedText 
        ? start + tag.length + 2  // Position inside the tag
        : start + replacement.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  // Sanitize HTML for preview (basic safety)
  const sanitizeHtml = (html: string) => {
    // Allow only basic formatting tags
    const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'a'];
    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
    
    return html.replace(tagRegex, (match, tagName) => {
      if (allowedTags.includes(tagName.toLowerCase())) {
        return match;
      }
      return ''; // Remove disallowed tags
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return false;
    }

    if (formData.title.trim().length < 5) {
      toast.error('Title must be at least 5 characters long');
      return false;
    }

    if (formData.title.trim().length > 200) {
      toast.error('Title cannot exceed 200 characters');
      return false;
    }

    if (!formData.content.trim()) {
      toast.error('Please enter content');
      return false;
    }

    // Remove HTML tags for length validation
    const textContent = formData.content.replace(/<[^>]*>/g, '').trim();
    if (textContent.length < 10) {
      toast.error('Content must be at least 10 characters long (excluding HTML tags)');
      return false;
    }

    if (!formData.categoryId) {
      toast.error('Please select a category');
      return false;
    }

    const categoryExists = categories.some(cat => cat._id === formData.categoryId);
    if (!categoryExists) {
      toast.error('Selected category is invalid. Please choose another category.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error('Please login to create topics');
      navigate('/login');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5);

      // Sanitize HTML content before sending
      const sanitizedContent = sanitizeHtml(formData.content.trim());

      const requestData = {
        title: formData.title.trim(),
        content: sanitizedContent,
        categoryId: formData.categoryId,
        tags: tags
      };

      console.log('Creating topic with HTML content:', requestData);

      const response = await axios.post<CreateTopicResponse>(
        `${import.meta.env.VITE_API_URL}/forum/topics`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );

      console.log('Topic creation response:', response.data);

      toast.success('Topic created successfully!');
      setOpen(false);
      
      setFormData({
        title: '',
        content: '',
        categoryId: defaultCategoryId || categories[0]?._id || '',
        tags: '',
      });
      setShowPreview(false);
      
      if (response.data.success && response.data.data?.slug) {
        navigate(`/forum/topic/${response.data.data.slug}`);
      } else {
        const slug = response.data.data?.slug || (response.data as any)?.slug;
        
        if (slug) {
          navigate(`/forum/topic/${slug}`);
        } else {
          const selectedCategory = categories.find(cat => cat._id === formData.categoryId);
          if (selectedCategory?.slug) {
            navigate(`/forum/${selectedCategory.slug}`);
          } else {
            window.location.reload();
          }
        }
      }
      
    } catch (error: any) {
      console.error('Create topic error:', error);
      
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
            if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
              const firstError = data.errors[0];
              if (typeof firstError === 'object' && firstError.message) {
                message = firstError.message;
              } else if (typeof firstError === 'string') {
                message = firstError;
              } else {
                message = 'Invalid data provided';
              }
            } else if (data?.message) {
              message = data.message;
            } else {
              message = 'Invalid topic data';
            }
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
    if (!newOpen) {
      setFormData({
        title: '',
        content: '',
        categoryId: defaultCategoryId || categories[0]?._id || '',
        tags: '',
      });
      setShowPreview(false);
    }
    setOpen(newOpen);
  };

  // Calculate content stats
  const textContent = formData.content.replace(/<[^>]*>/g, '');
  const htmlTagCount = (formData.content.match(/<[^>]*>/g) || []).length;

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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Topic</DialogTitle>
            <DialogDescription>
              Start a new discussion in the forum. HTML formatting is supported!
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title (5-200 characters)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={200}
                required
              />
              <div className="text-xs text-muted-foreground">
                {formData.title.length}/200 characters
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
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
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Content * (HTML Supported)</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? 'Edit' : 'Preview'}
                  </Button>
                </div>
              </div>
              
              {/* HTML Toolbar */}
              <div className="flex flex-wrap gap-1 p-2 bg-muted rounded border">
                <Button type="button" variant="ghost" size="sm" onClick={() => insertHtmlTag('strong')}>
                  <strong>B</strong>
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => insertHtmlTag('em')}>
                  <em>I</em>
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => insertHtmlTag('u')}>
                  <u>U</u>
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => insertHtmlTag('code')}>
                  &lt;/&gt;
                </Button>
                <div className="w-px bg-border mx-1"></div>
                <Button type="button" variant="ghost" size="sm" onClick={() => insertHtmlTag('p')}>
                  ¶
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => insertHtmlTag('br', false)}>
                  ↵
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => insertHtmlTag('h3')}>
                  H3
                </Button>
                <div className="w-px bg-border mx-1"></div>
                <Button type="button" variant="ghost" size="sm" onClick={() => insertHtmlTag('ul')}>
                  • List
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => insertHtmlTag('blockquote')}>
                  "
                </Button>
              </div>
              
              {showPreview ? (
                <Card className="p-4 min-h-[200px] bg-background">
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(formData.content) || '<p class="text-muted-foreground">Preview will appear here...</p>' }}
                  />
                </Card>
              ) : (
                <Textarea
                  id="content"
                  placeholder="Write your topic content here... 

Supported HTML tags: <p>, <br>, <strong>, <em>, <u>, <code>, <pre>, <h1-h6>, <ul>, <ol>, <li>, <blockquote>, <a>

Example:
<p>This is a paragraph with <strong>bold text</strong> and <em>italic text</em>.</p>
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>
<code>console.log('Hello World!');</code>"
                  className="min-h-[300px] resize-y font-mono text-sm"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              )}
              
              <div className="text-xs text-muted-foreground">
                Text: {textContent.length} chars (min 10) • HTML tags: {htmlTagCount} • 
                {showPreview ? 'Viewing formatted preview' : 'Raw HTML editor'}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                placeholder="algorithm, tips, discussion (comma separated, max 5)"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !currentUser}>
              {loading ? 'Creating...' : 'Create Topic'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}