import { useState, useEffect } from 'react';
import { useGetCallerUserProfile, useCreateOrUpdateProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupDialog() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const createOrUpdateProfile = useCreateOrUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');

  const isAuthenticated = !!identity;

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (!showProfileSetup) {
      setDisplayName('');
      setContactInfo('');
      setLocation('');
      setAddress('');
    }
  }, [showProfileSetup]);

  const handleSubmit = async (e: React.FormEvent) => {
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
        profilePicture: '',
        coordinates: undefined,
        address: address.trim() || undefined,
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile');
    }
  };

  if (isInitializing || !isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={showProfileSetup} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Welcome to ToolShare!
          </DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started. You can update this information later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
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
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State, ZIP"
            />
            <p className="text-xs text-muted-foreground">
              Used for the community map. You can add this later.
            </p>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createOrUpdateProfile.isPending} className="w-full">
              {createOrUpdateProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
