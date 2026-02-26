export function formatTimeOnApp(joinedAt: bigint): string {
  const joinedAtMs = Number(joinedAt) / 1_000_000;
  const now = Date.now();
  const diffMs = now - joinedAtMs;
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) {
    return years === 1 ? '1 year' : `${years} years`;
  } else if (months > 0) {
    return months === 1 ? '1 month' : `${months} months`;
  } else if (days > 0) {
    return days === 1 ? '1 day' : `${days} days`;
  } else {
    return 'Less than a day';
  }
}

export function formatJoinDate(joinedAt: bigint): string {
  const joinedAtMs = Number(joinedAt) / 1_000_000;
  const date = new Date(joinedAtMs);
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
