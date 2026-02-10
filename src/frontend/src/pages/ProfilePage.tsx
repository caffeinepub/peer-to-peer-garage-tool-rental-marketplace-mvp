import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useCreateOrUpdateProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { User, MapPin, Calendar, Clock, Mail, Edit2, Save, X, Home } from 'lucide-react';
import { formatTimeOnApp, formatJoinDate } from '../utils/timeOnApp';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import LoadingState from '../components/states/LoadingState';
import EmptyStateCard from '../components/states/EmptyStateCard';
import { getUrlParameter } from '../utils/urlParams';

export default function ProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
  const createOrUpdateProfile = useCreateOrUpdateProfile();
  const navigate = useNavigate();

  const editParam = getUrlParameter('edit');
  const [isEditing, setIsEditing] = useState(editParam === '1');
  
  const [displayName, setDisplayName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setContactInfo(userProfile.contactInfo || '');
      setLocation(userProfile.location || '');
      setProfilePicture(userProfile.profilePicture || '');
      setStreetAddress(userProfile.streetAddress || '');
    }
  }, [userProfile]);

  useEffect(() => {
    const editParam = getUrlParameter('edit');
    if (editParam === '1') {
      setIsEditing(true);
    }
  }, []);

  const removeEditParam = () => {
    const hash = window.location.hash;
    const queryStartIndex = hash.indexOf('?');
    
    if (queryStartIndex === -1) return;
    
    const routePath = hash.substring(0, queryStartIndex);
    const queryString = hash.substring(queryStartIndex + 1);
    const params = new URLSearchParams(queryString);
    params.delete('edit');
    
    const newQueryString = params.toString();
    const newHash = routePath + (newQueryString ? '?' + newQueryString : '');
    window.history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
  };

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
        coordinates: undefined,
        streetAddress: streetAddress.trim() || undefined,
      });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      removeEditParam();
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
      setStreetAddress(userProfile.streetAddress || '');
    }
    setIsEditing(false);
    removeEditParam();
  };

  const handleEditClick = () => {
    setIsEditing(true);
    const currentUrl = new URL(window.location.href);
    const hash = currentUrl.hash;
    const separator = hash.includes('?') ? '&' : '?';
    window.history.replaceState(null, '', `${currentUrl.pathname}${currentUrl.search}${hash}${separator}edit=1`);
  };

  if (!isAuthenticated) {
    return (
      <PageShell>
        <EmptyStateCard
          icon={User}
          title="Access Denied"
          description="Please log in to view your profile"
        />
      </PageShell>
    );
  }

  if (profileLoading) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
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
      <PageShell>
        <PageHeader
          title="My Profile"
          actions={
            !isEditing && (
              <Button onClick={handleEditClick} variant="outline">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )
          }
        />

        <Card className="max-w-3xl">
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

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Home className="h-5 w-5 text-muted-foreground" />
                      <Label htmlFor="streetAddress" className="text-base font-semibold">Street Address</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your street address is private and only visible to you.
                    </p>
                    <Input
                      id="streetAddress"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="123 Main St, City, State, ZIP"
                    />
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
                    <Home className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Street Address</p>
                      <p className="text-base">{userProfile?.streetAddress || 'Not provided'}</p>
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
      </PageShell>
    </>
  );
}
