import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetTool, useGetToolAvailability } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, DollarSign, Shield, Calendar, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { ToolCategory, ToolCondition } from '../backend';
import RentalRequestForm from '../components/rentals/RentalRequestForm';
import OwnerActions from '../components/listings/OwnerActions';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';

const categoryLabels: Record<ToolCategory, string> = {
  [ToolCategory.powerTools]: 'Power Tools',
  [ToolCategory.handTools]: 'Hand Tools',
  [ToolCategory.gardenTools]: 'Garden Tools',
  [ToolCategory.automotive]: 'Automotive',
  [ToolCategory.specialty]: 'Specialty',
};

const conditionLabels: Record<ToolCondition, string> = {
  [ToolCondition.new_]: 'New',
  [ToolCondition.gentlyUsed]: 'Gently Used',
  [ToolCondition.wellUsed]: 'Well Used',
  [ToolCondition.needsRepair]: 'Needs Repair',
};

export default function ListingDetailPage() {
  const { listingId } = useParams({ from: '/listing/$listingId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: listing, isLoading } = useGetTool(BigInt(listingId));
  const { data: isAvailable } = useGetToolAvailability(BigInt(listingId));

  if (isLoading) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Tool Not Found</CardTitle>
            <CardDescription>The tool you're looking for doesn't exist or has been removed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/browse' })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Browse
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = identity && listing.owner.toString() === identity.getPrincipal().toString();
  const isAuthenticated = !!identity;

  return (
    <>
      <ProfileSetupDialog />
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate({ to: '/browse' })} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">{listing.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{categoryLabels[listing.category]}</Badge>
                      <Badge variant="secondary">{conditionLabels[listing.condition]}</Badge>
                      {!listing.available && <Badge variant="destructive">Unavailable</Badge>}
                    </div>
                  </div>
                  {isOwner && <OwnerActions listing={listing} />}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {listing.photos.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {listing.photos.map((photo, index) => (
                      <div key={index} className="aspect-video overflow-hidden rounded-lg bg-muted">
                        <img
                          src={photo}
                          alt={`${listing.title} ${index + 1}`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) {
                              fallback.classList.remove('hidden');
                            }
                          }}
                        />
                        <div className="hidden h-full items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <h3 className="mb-2 text-lg font-semibold">Description</h3>
                  <p className="text-muted-foreground">{listing.description}</p>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{listing.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Availability</p>
                      <p className="text-sm text-muted-foreground">
                        {isAvailable ? 'Available now' : 'Currently rented'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Daily Rate</span>
                  <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                    <DollarSign className="h-6 w-6" />
                    {Number(listing.dailyPrice)}
                  </div>
                </div>
                {listing.securityDeposit && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      Security Deposit
                    </span>
                    <span className="text-sm font-medium">${Number(listing.securityDeposit)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {!isOwner && isAuthenticated && (
              <RentalRequestForm toolId={listing.id} isAvailable={isAvailable ?? false} />
            )}

            {!isAuthenticated && (
              <Card>
                <CardHeader>
                  <CardTitle>Interested?</CardTitle>
                  <CardDescription>Sign in to request this tool</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => navigate({ to: '/' })}>
                    Sign In to Rent
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
