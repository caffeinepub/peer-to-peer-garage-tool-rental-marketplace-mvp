import { Link, LinkProps } from '@tanstack/react-router';
import { ReactNode } from 'react';

interface AppNavLinkProps extends Omit<LinkProps, 'children'> {
  children: ReactNode;
  className?: string;
}

export default function AppNavLink({ children, className = '', ...props }: AppNavLinkProps) {
  return (
    <Link
      {...props}
      className={`text-sm font-medium transition-colors hover:text-primary ${className}`}
      activeProps={{
        className: 'text-primary',
      }}
      inactiveProps={{
        className: 'text-muted-foreground',
      }}
    >
      {children}
    </Link>
  );
}
