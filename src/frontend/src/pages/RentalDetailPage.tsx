import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetRentalsForUser, useGetTool } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, MapPin, DollarSign } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import RentalStatusActions from '../components/rentals/RentalStatusActions';
import RentalChatPanel from '../components/rentals/RentalChatPanel';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import PageShell from '../components/layout/PageShell';
import LoadingState from '../components/states/LoadingState';
import EmptyStateCard from '../components/states/EmptyStateCard';
import { getStatusColor, getStatusLabel } from '../utils/rentals/rentalStatusPresentation';
import { formatLongDate, calculateRentalDays } from '../utils/rentals/rentalDateFormat';
import { RentalStatus } from '../backend';

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

  if (rentalsLoading || toolLoading) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    );
  }

  if (!rental || !tool) {
    return (
      <RequireAuth>
        <PageShell>
          <EmptyStateCard
            icon={Calendar}
            title="Rental Not Found"
            description="The rental you're looking for doesn't exist."
            action={
              <Button onClick={() => navigate({ to: '/my-rentals' })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Rentals
              </Button>
            }
          />
        </PageShell>
      </RequireAuth>
    );
  }

  const totalDays = calculateRentalDays(rental.startDate, rental.endDate);
  const totalCost = Number(tool.dailyPrice) * totalDays;

  return (
    <RequireAuth>
      <ProfileSetupDialog />
      <PageShell>
        <Button variant="ghost" onClick={() => navigate({ to: isOwner ? '/requests' : '/my-rentals' })} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl">Rental Request</CardTitle>
                    <CardDescription>Request ID: {rental.id.toString()}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(rental.status as RentalStatus)}>
                    {getStatusLabel(rental.status as RentalStatus)}
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
                        <p className="text-sm text-muted-foreground">{formatLongDate(rental.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">End Date</p>
                        <p className="text-sm text-muted-foreground">{formatLongDate(rental.endDate)}</p>
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
                      <span>{formatLongDate(rental.created)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{formatLongDate(rental.lastUpdated)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(isOwner || isRenter) && <RentalChatPanel rentalId={rental.id} />}
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
      </PageShell>
    </RequireAuth>
  );
}
