import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Power } from 'lucide-react';
import type { ToolListing } from '../../backend';
import { useEditToolListing } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface OwnerActionsProps {
  listing: ToolListing;
}

export default function OwnerActions({ listing }: OwnerActionsProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const editToolListing = useEditToolListing();

  const isOwner = identity && listing.owner.toString() === identity.getPrincipal().toString();

  if (!isOwner) return null;

  const handleToggleAvailability = async () => {
    try {
      await editToolListing.mutateAsync({
        toolId: listing.id,
        title: listing.title,
        category: listing.category,
        description: listing.description,
        condition: listing.condition,
        dailyPrice: Number(listing.dailyPrice),
        securityDeposit: listing.securityDeposit ? Number(listing.securityDeposit) : undefined,
        location: listing.location,
        available: !listing.available,
        photos: listing.photos,
      });
      toast.success(`Tool marked as ${!listing.available ? 'available' : 'unavailable'}`);
    } catch (error: any) {
      console.error('Toggle availability error:', error);
      toast.error('Failed to update availability');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigate({ to: '/edit-listing/$listingId', params: { listingId: listing.id.toString() } })}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Listing
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleAvailability} disabled={editToolListing.isPending}>
          <Power className="mr-2 h-4 w-4" />
          {listing.available ? 'Mark Unavailable' : 'Mark Available'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
