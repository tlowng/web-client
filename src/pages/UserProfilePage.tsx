// src/pages/UserProfilePage.tsx
import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFetch } from '@/hooks/use-fetch';
import { getForumProfile, updateMyForumProfile, getMe } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  User, 
  MapPin, 
  Globe, 
  Github, 
  Calendar, 
  Star, 
  MessageSquare, 
  FileText, 
  Settings,
  Save,
  X,
  ExternalLink,
  Activity,
  Clock,
  Eye,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import type { UserProfile, ForumProfile, UserWithProfile, ForumTopic, ForumPost } from '@/api';

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    signature: '',
    title: '',
    location: '',
    website: '',
    githubProfile: '',
    preferences: {
      emailNotifications: true,
      showOnlineStatus: true,
    }
  });

  // Check if viewing own profile
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const user = await getMe();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to get current user:', error);
      }
    };
    checkCurrentUser();
  }, []);

  const fetchUserProfile = useCallback(async () => {
    if (!userId) throw new Error('User ID is required');
    return await getForumProfile(userId);
  }, [userId]);

  const { data: userProfile, loading, error, refetch } = useFetch<UserWithProfile>(
    fetchUserProfile,
    null,
    [userId]
  );

  const isOwnProfile = currentUser && userProfile && currentUser._id === userProfile.user._id;

  useBreadcrumbTitle(userProfile?.user?.username ? `${userProfile.user.username}'s Profile` : 'User Profile');

  // Initialize form when profile loads
  useEffect(() => {
    if (userProfile?.profile) {
      setProfileForm({
        signature: userProfile.profile.signature || '',
        title: userProfile.profile.title || '',
        location: userProfile.profile.location || '',
        website: userProfile.profile.website || '',
        githubProfile: userProfile.profile.githubProfile || '',
        preferences: {
          emailNotifications: userProfile.profile.preferences?.emailNotifications ?? true,
          showOnlineStatus: userProfile.profile.preferences?.showOnlineStatus ?? true,
        }
      });
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return;
    
    setSaving(true);
    try {
      await updateMyForumProfile(profileForm);
      toast.success('Profile updated successfully!');
      setEditMode(false);
      await refetch(); // Refresh profile data
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    // Reset form to original values
    if (userProfile?.profile) {
      setProfileForm({
        signature: userProfile.profile.signature || '',
        title: userProfile.profile.title || '',
        location: userProfile.profile.location || '',
        website: userProfile.profile.website || '',
        githubProfile: userProfile.profile.githubProfile || '',
        preferences: {
          emailNotifications: userProfile.profile.preferences?.emailNotifications ?? true,
          showOnlineStatus: userProfile.profile.preferences?.showOnlineStatus ?? true,
        }
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserTitle = (profile: ForumProfile) => {
    if (profile.title) return profile.title;
    
    // Auto-generate title based on reputation
    if (profile.reputation >= 5000) return 'Forum Legend';
    if (profile.reputation >= 2000) return 'Expert Contributor';
    if (profile.reputation >= 1000) return 'Senior Member';
    if (profile.reputation >= 500) return 'Active Member';
    if (profile.reputation >= 100) return 'Regular Member';
    return 'New Member';
  };

  const getActivityColor = (count: number) => {
    if (count >= 100) return 'text-red-500';
    if (count >= 50) return 'text-orange-500';
    if (count >= 25) return 'text-yellow-500';
    if (count >= 10) return 'text-green-500';
    return 'text-gray-500';
  };

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500">
              <p>Error loading profile: {error}</p>
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">User profile not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage 
                  src={`https://github.com/${userProfile.user.username}.png`}
                  alt={userProfile.user.username}
                />
                <AvatarFallback className="text-lg">
                  {userProfile.user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{userProfile.user.username}</h1>
                  {userProfile.user.role === 'admin' && (
                    <Badge variant="destructive">Admin</Badge>
                  )}
                  {userProfile.user.role === 'moderator' && (
                    <Badge variant="secondary">Moderator</Badge>
                  )}
                </div>
                
                <p className="text-muted-foreground">{getUserTitle(userProfile.profile)}</p>
                
                {userProfile.profile.signature && (
                  <p className="text-sm italic max-w-md">{userProfile.profile.signature}</p>
                )}
              </div>
            </div>
            
            <div className="ml-auto flex items-center gap-2">
              {isOwnProfile && (
                <>
                  {editMode ? (
                    <>
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={saving}
                        size="sm"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={cancelEdit}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => setEditMode(true)}
                      size="sm"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              {userProfile.profile.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{userProfile.profile.location}</span>
                </div>
              )}
              
              {userProfile.profile.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={userProfile.profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {userProfile.profile.website}
                    <ExternalLink className="h-3 w-3 inline ml-1" />
                  </a>
                </div>
              )}
              
              {userProfile.profile.githubProfile && (
                <div className="flex items-center gap-2 text-sm">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={userProfile.profile.githubProfile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    GitHub Profile
                    <ExternalLink className="h-3 w-3 inline ml-1" />
                  </a>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {formatDate(userProfile.user.createdAt)}</span>
              </div>
              
              {userProfile.profile.lastSeen && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Last seen {formatDate(userProfile.profile.lastSeen)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form (if in edit mode) */}
      {editMode && isOwnProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Your custom title"
                  value={profileForm.title}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="Your location"
                  value={profileForm.location}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://your-website.com"
                  value={profileForm.website}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Profile</Label>
                <Input
                  id="github"
                  placeholder="https://github.com/username"
                  value={profileForm.githubProfile}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, githubProfile: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="signature">Signature</Label>
              <Textarea
                id="signature"
                placeholder="Your signature or quote"
                value={profileForm.signature}
                onChange={(e) => setProfileForm(prev => ({ ...prev, signature: e.target.value }))}
                className="resize-none"
                rows={3}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-semibold">Preferences</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for forum activities
                  </p>
                </div>
                <Switch
                  checked={profileForm.preferences.emailNotifications}
                  onCheckedChange={(checked) => 
                    setProfileForm(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, emailNotifications: checked }
                    }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Online Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see when you're online
                  </p>
                </div>
                <Switch
                  checked={profileForm.preferences.showOnlineStatus}
                  onCheckedChange={(checked) => 
                    setProfileForm(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, showOnlineStatus: checked }
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reputation</p>
                <p className="text-2xl font-bold">{userProfile.profile.reputation}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posts</p>
                <p className={`text-2xl font-bold ${getActivityColor(userProfile.profile.postCount)}`}>
                  {userProfile.profile.postCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Topics</p>
                <p className={`text-2xl font-bold ${getActivityColor(userProfile.profile.topicCount)}`}>
                  {userProfile.profile.topicCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activity Score</p>
                <p className="text-2xl font-bold">
                  {Math.round((userProfile.profile.postCount + userProfile.profile.topicCount * 2) / 10) || 1}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {userProfile.recentActivity && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile.recentActivity.topics.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent topics.</p>
              ) : (
                <div className="space-y-3">
                  {userProfile.recentActivity.topics.slice(0, 5).map((topic) => (
                    <div key={topic._id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <Link 
                          to={`/forum/topic/${topic.slug}`}
                          className="font-medium hover:text-primary transition-colors text-sm"
                        >
                          {topic.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {new Date(topic.createdAt).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span className="text-xs">{topic.viewCount}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Posts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userProfile.recentActivity.posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No recent posts.</p>
              ) : (
                <div className="space-y-3">
                  {userProfile.recentActivity.posts.slice(0, 5).map((post) => (
                    <div key={post._id} className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        Replied in: <Link 
                          to={`/forum/topic/${post.topic}`} 
                          className="text-primary hover:underline"
                        >
                          Topic
                        </Link>
                      </div>
                      <div className="text-sm line-clamp-2">
                        {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {post.likeCount > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="text-xs">{post.likeCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}