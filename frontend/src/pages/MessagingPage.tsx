import { useState } from 'react';
import { useGetRentalsForUser } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { MessageSquare } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import ConversationsList from '../components/messaging/ConversationsList';
import ActiveConversationPanel from '../components/messaging/ActiveConversationPanel';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import LoadingState from '../components/states/LoadingState';
import EmptyStateCard from '../components/states/EmptyStateCard';
import type { RentalRequest } from '../backend';

export default function MessagingPage() {
  const { data: rentals, isLoading } = useGetRentalsForUser();
  const { identity } = useInternetIdentity();
  const [selectedRental, setSelectedRental] = useState<RentalRequest | null>(null);

  const allRentals = [...(rentals?.owned || []), ...(rentals?.rented || [])];

  return (
    <RequireAuth>
      <ProfileSetupDialog />
      <PageShell>
        <PageHeader
          title="Messages"
          subtitle="Chat with other users about your rentals"
        />

        {isLoading ? (
          <LoadingState />
        ) : allRentals.length === 0 ? (
          <EmptyStateCard
            icon={MessageSquare}
            title="No Conversations Yet"
            description="Start renting or listing tools to begin conversations with other users"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
            <ConversationsList
              rentals={allRentals}
              selectedRental={selectedRental}
              onSelectRental={setSelectedRental}
              currentUserPrincipal={identity?.getPrincipal().toString() || ''}
            />
            <ActiveConversationPanel
              rental={selectedRental}
              currentUserPrincipal={identity?.getPrincipal().toString() || ''}
            />
          </div>
        )}
      </PageShell>
    </RequireAuth>
  );
}
