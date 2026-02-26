import { useGetTool, useGetUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare } from 'lucide-react';
import type { RentalRequest } from '../../backend';
import { RentalStatus } from '../../backend';
import { getStatusColor, getStatusLabel } from '../../utils/rentals/rentalStatusPresentation';

interface ConversationsListProps {
  rentals: RentalRequest[];
  selectedRental: RentalRequest | null;
  onSelectRental: (rental: RentalRequest) => void;
  currentUserPrincipal: string;
}

function ConversationItem({
  rental,
  isSelected,
  onSelect,
  currentUserPrincipal,
}: {
  rental: RentalRequest;
  isSelected: boolean;
  onSelect: () => void;
  currentUserPrincipal: string;
}) {
  const { data: tool } = useGetTool(rental.toolId);
  const isOwner = rental.owner.toString() === currentUserPrincipal;
  const otherUserPrincipal = isOwner ? rental.renter : rental.owner;
  const { data: otherUserProfile } = useGetUserProfile(otherUserPrincipal.toString());

  const otherUserName = otherUserProfile?.displayName || 'User';
  const roleName = isOwner ? 'Renter' : 'Owner';

  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent ${
        isSelected ? 'border-primary bg-accent' : 'border-border'
      }`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-tight line-clamp-1">{tool?.title || 'Loading...'}</h3>
        <Badge className={`shrink-0 text-xs ${getStatusColor(rental.status as RentalStatus)}`}>
          {getStatusLabel(rental.status as RentalStatus)}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        {roleName}: {otherUserName}
      </p>
    </button>
  );
}

export default function ConversationsList({
  rentals,
  selectedRental,
  onSelectRental,
  currentUserPrincipal,
}: ConversationsListProps) {
  return (
    <Card className="h-[600px] lg:h-[700px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversations
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-6 pb-6 lg:h-[600px]">
          <div className="space-y-2">
            {rentals.map((rental) => (
              <ConversationItem
                key={rental.id.toString()}
                rental={rental}
                isSelected={selectedRental?.id === rental.id}
                onSelect={() => onSelectRental(rental)}
                currentUserPrincipal={currentUserPrincipal}
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
