import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUpdateRentalStatus } from '../../hooks/useQueries';
import { RentalStatus } from '../../backend';
import { Check, X, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface RentalStatusActionsProps {
  rental: any;
  isOwner: boolean;
  isRenter: boolean;
  inline?: boolean;
}

export default function RentalStatusActions({ rental, isOwner, isRenter, inline = false }: RentalStatusActionsProps) {
  const updateStatus = useUpdateRentalStatus();

  const handleStatusUpdate = async (newStatus: RentalStatus, actionName: string) => {
    try {
      await updateStatus.mutateAsync({
        rentalId: rental.id,
        newStatus,
      });
      toast.success(`Rental ${actionName.toLowerCase()} successfully`);
    } catch (error: any) {
      console.error('Status update error:', error);
      toast.error(error.message || `Failed to ${actionName.toLowerCase()} rental`);
    }
  };

  const currentStatus = rental.status as RentalStatus;

  // Owner actions for requested status
  if (isOwner && currentStatus === RentalStatus.requested) {
    const content = (
      <>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className={inline ? '' : 'w-full'} size={inline ? 'sm' : 'default'} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Approve
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Rental Request?</AlertDialogTitle>
              <AlertDialogDescription>
                This will mark your tool as unavailable for the requested dates. You can coordinate pickup details with the renter.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate(RentalStatus.approved, 'Approved')}>
                Approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className={inline ? '' : 'w-full'} size={inline ? 'sm' : 'default'} disabled={updateStatus.isPending}>
              <X className="mr-2 h-4 w-4" />
              Decline
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Decline Rental Request?</AlertDialogTitle>
              <AlertDialogDescription>
                The renter will be notified that their request was declined.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate(RentalStatus.declined, 'Declined')}>
                Decline
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );

    if (inline) {
      return <div className="flex gap-2">{content}</div>;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Respond to this rental request</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">{content}</CardContent>
      </Card>
    );
  }

  // Owner actions for approved status
  if (isOwner && currentStatus === RentalStatus.approved) {
    const content = (
      <>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className={inline ? '' : 'w-full'} size={inline ? 'sm' : 'default'} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Complete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Complete Rental?</AlertDialogTitle>
              <AlertDialogDescription>
                Mark this rental as completed once the tool has been returned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate(RentalStatus.completed, 'Completed')}>
                Complete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className={inline ? '' : 'w-full'} size={inline ? 'sm' : 'default'} disabled={updateStatus.isPending}>
              <Ban className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Rental?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel the approved rental. The renter will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate(RentalStatus.cancelledByOwner, 'Cancelled')}>
                Cancel Rental
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );

    if (inline) {
      return <div className="flex gap-2">{content}</div>;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage this approved rental</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">{content}</CardContent>
      </Card>
    );
  }

  // Renter actions for requested status
  if (isRenter && currentStatus === RentalStatus.requested) {
    const content = (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className={inline ? '' : 'w-full'} size={inline ? 'sm' : 'default'} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Ban className="mr-2 h-4 w-4" />
            )}
            Cancel Request
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel your rental request. You can submit a new request later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusUpdate(RentalStatus.cancelledByRenter, 'Cancelled')}>
              Cancel Request
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );

    if (inline) {
      return <div className="flex gap-2">{content}</div>;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage your rental request</CardDescription>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  // Renter actions for approved status
  if (isRenter && currentStatus === RentalStatus.approved) {
    const content = (
      <>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button className={inline ? '' : 'w-full'} size={inline ? 'sm' : 'default'} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Complete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Complete Rental?</AlertDialogTitle>
              <AlertDialogDescription>
                Mark this rental as completed after returning the tool.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate(RentalStatus.completed, 'Completed')}>
                Complete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className={inline ? '' : 'w-full'} size={inline ? 'sm' : 'default'} disabled={updateStatus.isPending}>
              <Ban className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Rental?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel your approved rental. The owner will be notified.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Rental</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusUpdate(RentalStatus.cancelledByRenter, 'Cancelled')}>
                Cancel Rental
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );

    if (inline) {
      return <div className="flex gap-2">{content}</div>;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>Manage your approved rental</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">{content}</CardContent>
      </Card>
    );
  }

  // No actions available for other states
  if (inline) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status</CardTitle>
        <CardDescription>No actions available for this rental</CardDescription>
      </CardHeader>
    </Card>
  );
}
