import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetRentalsForUser, useGetTool } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Calendar, MapPin, DollarSign } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import { RentalStatus } from '../backend';
import RentalStatusActions from '../components/rentals/RentalStatusActions';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';

const statusColors: Record<RentalStatus, string> = {
  [RentalStatus.requested]: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  [RentalStatus.approved]: 'bg-green-500/10 text-green-700 dark:text-green-400',
  [RentalStatus.declined]: 'bg-red-500/10 text-red-700 dark:text-red-400',
  [RentalStatus.cancelledByOwner]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  [RentalStatus.cancelledByRenter]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  [RentalStatus.completed]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
};

const statusLabels: Record<RentalStatus, string> = {
  [RentalStatus.requested]: 'Requested',
  [RentalStatus.approved]: 'Approved',
  [RentalStatus.declined]: 'Declined',
  [RentalStatus.cancelledByOwner]: 'Cancelled by Owner',
  [RentalStatus.cancelledByRenter]: 'Cancelled by Renter',
  [RentalStatus.completed]: 'Completed',
};

export default function RentalDetailPage() {
  const { rentalId } = useParams({ from: '/rental/$rentalId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: rentals, isLoading: rentalsLoading } = useGetRentalsForUser();

  const rental = [...(rentals?.owned || []), ...(rentals?.rented || [])].find(
    (r) => r.id.toString() === rentalId
  );

  const { data: tool, isLoading: toolLoading } = useGetTool(rental?.toolId);

  const isOwner = !!(identity && rental && rental.owner.toString() === identity.getPrincipal().toString());
  const isRenter = !!(identity && rental && rental.renter.toString() === identity.getPrincipal().toString());

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (rentalsLoading || toolLoading) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!rental || !tool) {
    return (
      <RequireAuth>
        <div className="container py-12">
          <Card>
            <CardHeader>
              <CardTitle>Rental Not Found</CardTitle>
              <CardDescription>The rental you're looking for doesn't exist.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate({ to: '/my-rentals' })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Rentals
              </Button>
            </CardContent>
          </Card>
        </div>
      </RequireAuth>
    );
  }

  const totalDays = Math.ceil(
    (Number(rental.endDate) - Number(rental.startDate)) / (1_000_000 * 1000 * 60 * 60 * 24)
  );
  const totalCost = Number(tool.dailyPrice) * totalDays;

  return (
    <RequireAuth>
      <ProfileSetupDialog />
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate({ to: isOwner ? '/requests' : '/my-rentals' })} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">Rental Request</CardTitle>
                    <CardDescription>Request ID: {rental.id.toString()}</CardDescription>
                  </div>
                  <Badge className={statusColors[rental.status as RentalStatus]}>
                    {statusLabels[rental.status as RentalStatus]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-4 text-lg font-semibold">Tool Details</h3>
                  <div className="flex gap-4">
                    {tool.photos.length > 0 && (
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img src={tool.photos[0]} alt={tool.title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="font-semibold">{tool.title}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {tool.location}
                      </div>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm"
                        onClick={() => navigate({ to: '/listing/$listingId', params: { listingId: tool.id.toString() } })}
                      >
                        View full listing →
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 text-lg font-semibold">Rental Period</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Start Date</p>
                        <p className="text-sm text-muted-foreground">{formatDate(rental.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">End Date</p>
                        <p className="text-sm text-muted-foreground">{formatDate(rental.endDate)}</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Total duration: {totalDays} {totalDays === 1 ? 'day' : 'days'}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 text-lg font-semibold">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requested</span>
                      <span>{formatDate(rental.created)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{formatDate(rental.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Daily Rate</span>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4" />
                    {Number(tool.dailyPrice)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{totalDays} days</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <div className="flex items-center gap-1 text-xl font-bold text-primary">
                    <DollarSign className="h-5 w-5" />
                    {totalCost}
                  </div>
                </div>
                {tool.securityDeposit && (
                  <div className="rounded-lg bg-muted p-3 text-sm">
                    <p className="font-medium">Security Deposit</p>
                    <p className="text-muted-foreground">${Number(tool.securityDeposit)} (refundable)</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <RentalStatusActions rental={rental} isOwner={isOwner} isRenter={isRenter} />
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
