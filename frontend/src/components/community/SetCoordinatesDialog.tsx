import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useCreateOrUpdateProfile } from '../../hooks/useQueries';
import { GeoCoordinates } from '../../backend';

interface SetCoordinatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentProfile: {
    displayName: string;
    contactInfo?: string;
    location: string;
    profilePicture: string;
    address?: string;
  };
}

async function geocodeAddressClient(address: string): Promise<GeoCoordinates | null> {
  try {
    const encoded = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || data.length === 0) return null;
    const { lat, lon } = data[0];
    return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
  } catch {
    return null;
  }
}

export default function SetCoordinatesDialog({
  open,
  onOpenChange,
  currentProfile,
}: SetCoordinatesDialogProps) {
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const updateProfile = useCreateOrUpdateProfile();

  const isLoading = isGeocoding || updateProfile.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setGeocodeError(null);
    setIsGeocoding(true);

    const fullAddress = [street.trim(), city.trim(), postalCode.trim()]
      .filter(Boolean)
      .join(', ');

    let coords: GeoCoordinates | null = null;
    try {
      coords = await geocodeAddressClient(fullAddress);
    } catch {
      // ignore
    } finally {
      setIsGeocoding(false);
    }

    if (!coords) {
      setGeocodeError(
        'Could not find coordinates for this address. Please check the address and try again.'
      );
      return;
    }

    try {
      await updateProfile.mutateAsync({
        displayName: currentProfile.displayName,
        contactInfo: currentProfile.contactInfo,
        location: city.trim(),
        profilePicture: currentProfile.profilePicture,
        coordinates: coords,
        address: fullAddress,
      });
      onOpenChange(false);
    } catch {
      setGeocodeError('Failed to save location. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Set Your Location
          </DialogTitle>
          <DialogDescription>
            Enter your address to appear on the community map. Your exact address is only used to
            determine your map pin location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              placeholder="123 Main St"
              value={street}
              onChange={e => setStreet(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                placeholder="San Francisco"
                value={city}
                onChange={e => setCity(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postal">Postal Code</Label>
              <Input
                id="postal"
                placeholder="94102"
                value={postalCode}
                onChange={e => setPostalCode(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {geocodeError && (
            <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{geocodeError}</span>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !city.trim()}>
              {isGeocoding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finding location…
                </>
              ) : updateProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 mr-2" />
                  Save Location
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
