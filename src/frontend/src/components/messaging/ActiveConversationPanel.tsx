import { useGetTool, useGetUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import RentalChatPanel from '../rentals/RentalChatPanel';
import type { RentalRequest } from '../../backend';
import { RentalStatus } from '../../backend';
import { getStatusColor, getStatusLabel } from '../../utils/rentals/rentalStatusPresentation';
import { formatDate } from '../../utils/rentals/rentalDateFormat';

interface ActiveConversationPanelProps {
  rental: RentalRequest | null;
  currentUserPrincipal: string;
}

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
            <Badge className={getStatusColor(rental.status as RentalStatus)}>
              {getStatusLabel(rental.status as RentalStatus)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <RentalChatPanel rentalId={rental.id} variant="messaging" />
    </div>
  );
}
