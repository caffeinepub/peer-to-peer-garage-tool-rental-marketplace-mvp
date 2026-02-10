import { useGetRentalsForUser, useGetTool } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import RentalStatusActions from '../components/rentals/RentalStatusActions';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import LoadingState from '../components/states/LoadingState';
import EmptyStateCard from '../components/states/EmptyStateCard';
import { getStatusColor, getStatusLabel } from '../utils/rentals/rentalStatusPresentation';
import { formatDate } from '../utils/rentals/rentalDateFormat';
import { RentalStatus } from '../backend';

function RentalRequestCard({ rental }: { rental: any }) {
  const { data: tool } = useGetTool(rental.toolId);
  const { identity } = useInternetIdentity();

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
          <Badge className={getStatusColor(rental.status as RentalStatus)}>
            {getStatusLabel(rental.status as RentalStatus)}
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
      <PageShell>
        <PageHeader
          title="Incoming Requests"
          subtitle="Rental requests for your tools"
        />

        {isLoading ? (
          <LoadingState />
        ) : incomingRequests.length === 0 ? (
          <EmptyStateCard
            icon={Calendar}
            title="No Requests Yet"
            description="Rental requests for your tools will appear here"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomingRequests.map((rental) => (
              <RentalRequestCard key={rental.id.toString()} rental={rental} />
            ))}
          </div>
        )}
      </PageShell>
    </RequireAuth>
  );
}
