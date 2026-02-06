import { useState } from 'react';
import { useGetRentalsForUser } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Loader2, MessageSquare } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import ConversationsList from '../components/messaging/ConversationsList';
import ActiveConversationPanel from '../components/messaging/ActiveConversationPanel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { RentalRequest } from '../backend';

export default function MessagingPage() {
  const { data: rentals, isLoading } = useGetRentalsForUser();
  const { identity } = useInternetIdentity();
  const [selectedRental, setSelectedRental] = useState<RentalRequest | null>(null);

  // Combine owned and rented rentals for conversations
  const allRentals = [...(rentals?.owned || []), ...(rentals?.rented || [])];

  return (
    <RequireAuth>
      <ProfileSetupDialog />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">Chat with other users about your rentals</p>
        </div>

        {isLoading ? (
          <div className="flex min-h-[600px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : allRentals.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>No Conversations Yet</CardTitle>
              <CardDescription>
                Start renting or listing tools to begin conversations with other users
              </CardDescription>
            </CardHeader>
          </Card>
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
      </div>
    </RequireAuth>
  );
}
