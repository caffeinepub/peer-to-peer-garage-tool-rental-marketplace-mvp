import { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

export default function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div className={`container py-8 ${className}`}>
      {children}
    </div>
  );
}
