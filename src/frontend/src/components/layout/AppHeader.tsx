import { Link, useNavigate } from '@tanstack/react-router';
import { Wrench, Menu, X, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import LoginButton from '../auth/LoginButton';
import ProfileMenu from '../profile/ProfileMenu';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';

export default function AppHeader() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <img src="/assets/generated/toolshare-logo.dim_512x512.png" alt="ToolShare" className="h-9 w-9" />
            <span className="text-xl font-bold tracking-tight">ToolShare</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              to="/browse"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Browse Tools
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/my-tools"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  My Tools
                </Link>
                <Link
                  to="/requests"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Requests
                </Link>
                <Link
                  to="/my-rentals"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  My Rentals
                </Link>
                <Link
                  to="/messages"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Messages
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <>
              <Button
                onClick={() => navigate({ to: '/add-listing' })}
                size="sm"
                className="hidden md:inline-flex"
              >
                <Wrench className="mr-2 h-4 w-4" />
                List a Tool
              </Button>
              <ProfileMenu />
            </>
          )}
          {!isAuthenticated && <LoginButton />}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-4 py-4">
            <Link
              to="/browse"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Tools
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/my-tools"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Tools
                </Link>
                <Link
                  to="/requests"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Requests
                </Link>
                <Link
                  to="/my-rentals"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Rentals
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Messages
                </Link>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate({ to: '/add-listing' });
                  }}
                  size="sm"
                  className="w-full"
                >
                  <Wrench className="mr-2 h-4 w-4" />
                  List a Tool
                </Button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
