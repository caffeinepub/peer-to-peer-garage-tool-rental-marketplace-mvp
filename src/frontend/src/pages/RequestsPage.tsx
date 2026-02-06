import { useGetRentalsForUser, useGetTool } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, ExternalLink } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import { RentalStatus } from '../backend';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import RentalStatusActions from '../components/rentals/RentalStatusActions';

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

function RentalRequestCard({ rental }: { rental: any }) {
  const { data: tool } = useGetTool(rental.toolId);
  const { identity } = useInternetIdentity();

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString();
  };

  const isOwner = !!(identity && rental.owner.toString() === identity.getPrincipal().toString());

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{tool?.title || 'Loading...'}</CardTitle>
            <CardDescription>
              {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
            </CardDescription>
          </div>
          <Badge className={statusColors[rental.status as RentalStatus]}>
            {statusLabels[rental.status as RentalStatus]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/rental/$rentalId" params={{ rentalId: rental.id.toString() }}>
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
          {tool && (
            <Button asChild variant="ghost" size="sm">
              <Link to="/listing/$listingId" params={{ listingId: tool.id.toString() }}>
                View Tool
              </Link>
            </Button>
          )}
          <RentalStatusActions rental={rental} isOwner={isOwner} isRenter={false} inline />
        </div>
      </CardContent>
    </Card>
  );
}

export default function RequestsPage() {
  const { data: rentals, isLoading } = useGetRentalsForUser();

  const incomingRequests = rentals?.owned || [];

  return (
    <RequireAuth>
      <ProfileSetupDialog />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Incoming Requests</h1>
          <p className="text-muted-foreground">Rental requests for your tools</p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : incomingRequests.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>No Requests Yet</CardTitle>
              <CardDescription>Rental requests for your tools will appear here</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomingRequests.map((rental) => (
              <RentalRequestCard key={rental.id.toString()} rental={rental} />
            ))}
          </div>
        )}
      </div>
    </RequireAuth>
  );
}
