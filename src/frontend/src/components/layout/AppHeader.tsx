import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Wrench } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import ProfileMenu from '../profile/ProfileMenu';
import AppNavLink from '../navigation/AppNavLink';

export default function AppHeader() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ToolShare</span>
          </Link>

          <nav className="hidden md:flex md:gap-6">
            <AppNavLink to="/browse">Browse</AppNavLink>
            {isAuthenticated && (
              <>
                <AppNavLink to="/my-tools">My Tools</AppNavLink>
                <AppNavLink to="/my-rentals">My Rentals</AppNavLink>
                <AppNavLink to="/requests">Requests</AppNavLink>
                <AppNavLink to="/messages">Messages</AppNavLink>
                <AppNavLink to="/community-map">Community Map</AppNavLink>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <ProfileMenu />
          ) : (
            <Button onClick={login} className="hidden md:inline-flex">
              Login
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <AppNavLink to="/browse" className="text-base">
                  Browse
                </AppNavLink>
                {isAuthenticated ? (
                  <>
                    <AppNavLink to="/my-tools" className="text-base">
                      My Tools
                    </AppNavLink>
                    <AppNavLink to="/my-rentals" className="text-base">
                      My Rentals
                    </AppNavLink>
                    <AppNavLink to="/requests" className="text-base">
                      Requests
                    </AppNavLink>
                    <AppNavLink to="/messages" className="text-base">
                      Messages
                    </AppNavLink>
                    <AppNavLink to="/community-map" className="text-base">
                      Community Map
                    </AppNavLink>
                  </>
                ) : (
                  <Button onClick={login} className="w-full">
                    Login
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
