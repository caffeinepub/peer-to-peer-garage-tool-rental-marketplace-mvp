import { useGetTool, useGetUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import RentalChatPanel from '../rentals/RentalChatPanel';
import type { RentalRequest } from '../../backend';
import { RentalStatus } from '../../backend';

interface ActiveConversationPanelProps {
  rental: RentalRequest | null;
  currentUserPrincipal: string;
}

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

export default function ActiveConversationPanel({ rental, currentUserPrincipal }: ActiveConversationPanelProps) {
  const { data: tool } = useGetTool(rental?.toolId);
  const isOwner = rental ? rental.owner.toString() === currentUserPrincipal : false;
  const otherUserPrincipal = rental ? (isOwner ? rental.renter : rental.owner) : null;
  const { data: otherUserProfile } = useGetUserProfile(otherUserPrincipal?.toString());

  if (!rental) {
    return (
      <Card className="flex h-[600px] items-center justify-center lg:h-[700px]">
        <CardContent className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <MessageSquare className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="mb-2">Select a Conversation</CardTitle>
          <CardDescription>Choose a conversation from the list to view messages</CardDescription>
        </CardContent>
      </Card>
    );
  }

  const otherUserName = otherUserProfile?.displayName || 'User';
  const roleName = isOwner ? 'Renter' : 'Owner';

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) / 1_000_000).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>{tool?.title || 'Loading...'}</CardTitle>
              <CardDescription>
                {roleName}: {otherUserName}
              </CardDescription>
              <CardDescription className="text-xs">
                {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
              </CardDescription>
            </div>
            <Badge className={statusColors[rental.status as RentalStatus]}>
              {statusLabels[rental.status as RentalStatus]}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <RentalChatPanel rentalId={rental.id} variant="messaging" />
    </div>
  );
}
