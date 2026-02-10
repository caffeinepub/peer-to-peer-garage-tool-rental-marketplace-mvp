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
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Home } from 'lucide-react';

export default function ProfileSetupDialog() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const createOrUpdateProfile = useCreateOrUpdateProfile();

  const [displayName, setDisplayName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [location, setLocation] = useState('');
  const [streetAddress, setStreetAddress] = useState('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName);
      setContactInfo(userProfile.contactInfo || '');
      setLocation(userProfile.location || '');
      setStreetAddress(userProfile.streetAddress || '');
    }
  }, [userProfile]);

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
        streetAddress: streetAddress.trim() || undefined,
      });
      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Profile save error:', error);
      toast.error('Failed to save profile');
    }
  };

  return (
    <Dialog open={showProfileSetup} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Welcome to ToolShare!</DialogTitle>
            <DialogDescription>Let's set up your profile to get started</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
              <Label htmlFor="contactInfo">Contact Info (optional)</Label>
              <Textarea
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Email, phone, or preferred contact method"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="streetAddress" className="text-sm font-semibold">Street Address (Optional)</Label>
              </div>
              <p className="text-xs text-muted-foreground">
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
          <DialogFooter>
            <Button type="submit" disabled={createOrUpdateProfile.isPending} className="w-full">
              {createOrUpdateProfile.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
