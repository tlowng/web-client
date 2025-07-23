// src/pages/UserProfilePage.tsx - FINAL CLEANED VERSION
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
import { 
  User, 
  MapPin, 
  Globe, 
  Github, 
  Star, 
  MessageSquare, 
  FileText, 
  Settings,
  Save,
  X,
  ExternalLink,
  Activity,
  Clock,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';
import { useBreadcrumbTitle } from '@/contexts/breadcrumb-context';
import type { UserProfile, UserWithPopulatedActivity } from '@/types';

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

  const fetchUserProfile = useCallback(async (): Promise<UserWithPopulatedActivity> => {
    if (!userId) throw new Error('User ID is required');
    return await getForumProfile(userId) as UserWithPopulatedActivity;
  }, [userId]);

  const { data: userProfile, loading, error, refetch } = useFetch<UserWithPopulatedActivity>(
    fetchUserProfile,
    null,
    [userId]
  );

  const isOwnProfile = currentUser && userProfile && currentUser._id === userProfile.user._id;

  useBreadcrumbTitle(userProfile?.user?.username ? `Profile: ${userProfile.user.username}` : 'User Profile');

  // Initialize form when user profile is loaded
  useEffect(() => {
    if (userProfile?.profile && isOwnProfile) {
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
  }, [userProfile, isOwnProfile]);

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return;
    
    setSaving(true);
    try {
      await updateMyForumProfile(profileForm);
      setEditMode(false);
      refetch();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
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
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32 mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-red-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Error loading user profile: {error || 'User not found'}</p>
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

  const { user, profile, recentActivity } = userProfile;

  return (
    <div className="p-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <Avatar className="h-24 w-24 mx-auto">
                  <AvatarImage src={profile.avatar} alt={user.username} />
                  <AvatarFallback className="text-2xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  {profile.title && (
                    <Badge variant="secondary" className="mt-1">
                      {profile.title}
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {isOwnProfile && (
                  <Button
                    variant={editMode ? "outline" : "default"}
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className="w-full"
                  >
                    {editMode ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Forum Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4" />
                    <span className="font-bold text-lg">{profile.reputation}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Reputation</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-500">
                    <MessageSquare className="h-4 w-4" />
                    <span className="font-bold text-lg">{profile.postCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-500">
                    <FileText className="h-4 w-4" />
                    <span className="font-bold text-lg">{profile.topicCount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Topics</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">{new Date(profile.lastSeen).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Last seen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {profile.githubProfile && (
                <div className="flex items-center gap-2 text-sm">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`https://github.com/${profile.githubProfile}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    @{profile.githubProfile}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Edit Form */}
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
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={profileForm.title}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Your title..."
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Your location..."
                      maxLength={100}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="signature">Signature</Label>
                  <Textarea
                    id="signature"
                    value={profileForm.signature}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, signature: e.target.value }))}
                    placeholder="Your signature..."
                    maxLength={500}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="github">GitHub Username</Label>
                    <Input
                      id="github"
                      value={profileForm.githubProfile}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, githubProfile: e.target.value }))}
                      placeholder="username"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Preferences</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <Switch
                        id="email-notifications"
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
                      <Label htmlFor="show-online">Show Online Status</Label>
                      <Switch
                        id="show-online"
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
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Signature */}
          {profile.signature && !editMode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{profile.signature}</p>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          {recentActivity && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.topics?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Recent Topics
                    </h4>
                    <div className="space-y-2">
                      {recentActivity.topics.map((topic) => (
                        <div key={topic._id} className="border-l-2 border-blue-500 pl-3">
                          <Link 
                            to={`/forum/topic/${topic.slug}`}
                            className="font-medium hover:underline text-sm"
                          >
                            {topic.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {new Date(topic.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recentActivity.posts?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Recent Posts
                    </h4>
                    <div className="space-y-2">
                      {recentActivity.posts
                        .slice(0, 5)
                        .filter(post => post.topic) // Filter out posts with null topics
                        .map((post) => (
                          <div key={post._id} className="border-l-2 border-green-500 pl-3">
                            <Link 
                              to={`/forum/topic/${post.topic.slug}`}
                              className="font-medium hover:underline text-sm"
                            >
                              Re: {post.topic.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!recentActivity?.topics?.length && !recentActivity?.posts?.length) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
