import { RentalStatus } from '../../backend';

export const statusColors: Record<RentalStatus, string> = {
  [RentalStatus.requested]: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  [RentalStatus.approved]: 'bg-green-500/10 text-green-700 dark:text-green-400',
  [RentalStatus.declined]: 'bg-red-500/10 text-red-700 dark:text-red-400',
  [RentalStatus.cancelledByOwner]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  [RentalStatus.cancelledByRenter]: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
  [RentalStatus.completed]: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
};

export const statusLabels: Record<RentalStatus, string> = {
  [RentalStatus.requested]: 'Requested',
  [RentalStatus.approved]: 'Approved',
  [RentalStatus.declined]: 'Declined',
  [RentalStatus.cancelledByOwner]: 'Cancelled by Owner',
  [RentalStatus.cancelledByRenter]: 'Cancelled by Renter',
  [RentalStatus.completed]: 'Completed',
};

export function getStatusColor(status: RentalStatus): string {
  return statusColors[status];
}

export function getStatusLabel(status: RentalStatus): string {
  return statusLabels[status];
}
