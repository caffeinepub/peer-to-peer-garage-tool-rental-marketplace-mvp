export function formatDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString();
}

export function formatLongDate(timestamp: bigint): string {
  return new Date(Number(timestamp) / 1_000_000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatChatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1_000_000);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}

export function calculateRentalDays(startDate: bigint, endDate: bigint): number {
  return Math.ceil(
    (Number(endDate) - Number(startDate)) / (1_000_000 * 1000 * 60 * 60 * 24)
  );
}
