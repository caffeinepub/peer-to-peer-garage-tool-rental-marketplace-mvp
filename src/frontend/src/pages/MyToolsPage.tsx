import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetToolsByOwner, useGetRentalsForUser } from '../hooks/useQueries';
import { useNavigate, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wrench, Plus, Bell, CheckCircle } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import ListingsGrid from '../components/listings/ListingsGrid';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import LoadingState from '../components/states/LoadingState';
import EmptyStateCard from '../components/states/EmptyStateCard';
import { RentalStatus } from '../backend';

export default function MyToolsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const ownerPrincipal = identity?.getPrincipal().toString();
  const { data: listings = [], isLoading: listingsLoading } = useGetToolsByOwner(ownerPrincipal);
  const { data: rentals, isLoading: rentalsLoading } = useGetRentalsForUser();

  const ownedRentals = rentals?.owned || [];
  const pendingRequests = ownedRentals.filter((r) => r.status === RentalStatus.requested);
  const activeRentals = ownedRentals.filter((r) => r.status === RentalStatus.approved);

  const isLoading = listingsLoading || rentalsLoading;

  return (
    <RequireAuth>
      <ProfileSetupDialog />
      <PageShell>
        <PageHeader
          title="My Tools"
          subtitle="Manage your tool listings"
          actions={
            <Button onClick={() => navigate({ to: '/add-listing' })}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tool
            </Button>
          }
        />

        {!isLoading && (pendingRequests.length > 0 || activeRentals.length > 0) && (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            {pendingRequests.length > 0 && (
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <Bell className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
                <AlertDescription className="ml-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">
                      {pendingRequests.length} pending {pendingRequests.length === 1 ? 'request' : 'requests'}
                    </span>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-yellow-700 dark:text-yellow-400">
                      <Link to="/requests">View Requests →</Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {activeRentals.length > 0 && (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-400" />
                <AlertDescription className="ml-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-700 dark:text-green-400">
                      {activeRentals.length} active {activeRentals.length === 1 ? 'rental' : 'rentals'}
                    </span>
                    <Button asChild variant="link" size="sm" className="h-auto p-0 text-green-700 dark:text-green-400">
                      <Link to="/requests">Manage Rentals →</Link>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {isLoading ? (
          <LoadingState />
        ) : listings.length === 0 ? (
          <EmptyStateCard
            icon={Wrench}
            title="No Tools Listed Yet"
            description="Start earning by listing your unused tools"
            action={
              <Button onClick={() => navigate({ to: '/add-listing' })}>
                <Plus className="mr-2 h-4 w-4" />
                List Your First Tool
              </Button>
            }
          />
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </PageShell>
    </RequireAuth>
  );
}
