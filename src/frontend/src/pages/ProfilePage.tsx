import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useCreateOrUpdateProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, MapPin, Calendar, Clock, Mail, Edit2, Save, X } from 'lucide-react';
import { formatTimeOnApp, formatJoinDate } from '../utils/timeOnApp';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import { getUrlParameter, removeUrlParameter } from '../utils/urlParams';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const createOrUpdateProfile = useCreateOrUpdateProfile();
  const navigate = useNavigate();

  // Check for edit mode from URL parameter
  const editParam = getUrlParameter('edit');
  const [isEditing, setIsEditing] = useState(editParam === '1');
  
  const [displayName, setDisplayName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState('');

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setContactInfo(userProfile.contactInfo || '');
      setLocation(userProfile.location || '');
      setProfilePicture(userProfile.profilePicture || '');
    }
  }, [userProfile]);

  // Initialize edit mode from URL parameter
  useEffect(() => {
    const editParam = getUrlParameter('edit');
    if (editParam === '1') {
      setIsEditing(true);
    }
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await createOrUpdateProfile.mutateAsync({
        displayName: displayName.trim(),
        contactInfo: contactInfo.trim() || undefined,
        location: location.trim() || 'Not specified',
        profilePicture: profilePicture.trim(),
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Clear the edit parameter from URL
      removeUrlParameter('edit');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setContactInfo(userProfile.contactInfo || '');
      setLocation(userProfile.location || '');
      setProfilePicture(userProfile.profilePicture || '');
    }
    setIsEditing(false);
    // Clear the edit parameter from URL
    removeUrlParameter('edit');
  };

  const handleEditClick = () => {
    setIsEditing(true);
    // Add edit parameter to URL
    const currentUrl = new URL(window.location.href);
    const hash = currentUrl.hash;
    const separator = hash.includes('?') ? '&' : '?';
    window.history.replaceState(null, '', `${currentUrl.pathname}${currentUrl.search}${hash}${separator}edit=1`);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const initials = userProfile?.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const timeOnApp = userProfile?.joinedAt ? formatTimeOnApp(userProfile.joinedAt) : 'N/A';
  const joinDate = userProfile?.joinedAt ? formatJoinDate(userProfile.joinedAt) : 'N/A';
  const principalId = identity?.getPrincipal().toString() || 'N/A';

  return (
    <>
      <ProfileSetupDialog />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">My Profile</h1>
            {!isEditing && (
              <Button onClick={handleEditClick} variant="outline">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    {profilePicture && !isEditing ? (
                      <AvatarImage src={profilePicture} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{userProfile?.displayName || 'User'}</CardTitle>
                  <CardDescription className="mt-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Member for {timeOnApp}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name *</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Contact Info</Label>
                      <Textarea
                        id="contactInfo"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="Email, phone, or preferred contact method"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City, State"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profilePicture">Profile Picture URL</Label>
                      <Input
                        id="profilePicture"
                        value={profilePicture}
                        onChange={(e) => setProfilePicture(e.target.value)}
                        placeholder="https://example.com/photo.jpg or data:image/..."
                      />
                      {profilePicture && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={profilePicture} alt="Preview" />
                            <AvatarFallback className="bg-muted">
                              <User className="h-8 w-8" />
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" disabled={createOrUpdateProfile.isPending}>
                      <Save className="mr-2 h-4 w-4" />
                      {createOrUpdateProfile.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Display Name</p>
                        <p className="text-base">{userProfile?.displayName || 'Not set'}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Contact Info</p>
                        <p className="text-base">{userProfile?.contactInfo || 'Not provided'}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p className="text-base">{userProfile?.location || 'Not specified'}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Joined</p>
                        <p className="text-base">{joinDate}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">Principal ID</p>
                        <p className="text-xs font-mono break-all text-muted-foreground">{principalId}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
