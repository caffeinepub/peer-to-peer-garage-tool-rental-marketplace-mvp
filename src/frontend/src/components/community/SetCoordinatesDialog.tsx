import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2 } from 'lucide-react';
import { useCreateOrUpdateProfile, useGetCallerUserProfile } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface SetCoordinatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SetCoordinatesDialog({ open, onOpenChange }: SetCoordinatesDialogProps) {
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [errors, setErrors] = useState<{ streetAddress?: string; city?: string; postalCode?: string }>({});

  const { data: userProfile } = useGetCallerUserProfile();
  const createOrUpdateProfile = useCreateOrUpdateProfile();

  const validateAddress = () => {
    const newErrors: { streetAddress?: string; city?: string; postalCode?: string } = {};
    
    if (!streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }

    if (!city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateAddress()) {
      toast.error('Please fill in all required address fields');
      return;
    }

    if (!userProfile) {
      toast.error('Profile not found. Please try again.');
      return;
    }

    try {
      const fullAddress = `${streetAddress.trim()}, ${city.trim()}, ${postalCode.trim()}`;
      
      await createOrUpdateProfile.mutateAsync({
        displayName: userProfile.displayName,
        contactInfo: userProfile.contactInfo || undefined,
        location: userProfile.location || '',
        profilePicture: userProfile.profilePicture || '',
        coordinates: undefined,
        address: fullAddress,
      });
      
      toast.success('Location saved! Your pin will appear on the map.');
      onOpenChange(false);
      setStreetAddress('');
      setCity('');
      setPostalCode('');
      setErrors({});
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error('Failed to save location. Please try again.');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setStreetAddress('');
    setCity('');
    setPostalCode('');
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add Your Location
          </DialogTitle>
          <DialogDescription>
            Enter your address to appear on the community map. All fields are required. Your address will be geocoded to place your pin on the globe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="streetAddress">
              Street Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="streetAddress"
              type="text"
              placeholder="e.g., 123 Main Street"
              value={streetAddress}
              onChange={(e) => {
                setStreetAddress(e.target.value);
                if (errors.streetAddress) {
                  setErrors({ ...errors, streetAddress: undefined });
                }
              }}
              className={errors.streetAddress ? 'border-destructive' : ''}
              required
            />
            {errors.streetAddress && (
              <p className="text-sm text-destructive">{errors.streetAddress}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="e.g., San Francisco"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                if (errors.city) {
                  setErrors({ ...errors, city: undefined });
                }
              }}
              className={errors.city ? 'border-destructive' : ''}
              required
            />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">
              Postal Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postalCode"
              type="text"
              placeholder="e.g., 94102"
              value={postalCode}
              onChange={(e) => {
                setPostalCode(e.target.value);
                if (errors.postalCode) {
                  setErrors({ ...errors, postalCode: undefined });
                }
              }}
              className={errors.postalCode ? 'border-destructive' : ''}
              required
            />
            {errors.postalCode && (
              <p className="text-sm text-destructive">{errors.postalCode}</p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Privacy Note:</p>
            <p className="text-muted-foreground">
              Your address will be used to place a pin on the community map. The exact location will be approximate for privacy.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={createOrUpdateProfile.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={createOrUpdateProfile.isPending || !streetAddress.trim() || !city.trim() || !postalCode.trim()}
          >
            {createOrUpdateProfile.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
