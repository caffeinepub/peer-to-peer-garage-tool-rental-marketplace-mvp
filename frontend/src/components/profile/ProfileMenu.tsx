import { useGetCallerUserProfile } from '../../hooks/useQueries';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

export default function ProfileMenu() {
  const { data: userProfile } = useGetCallerUserProfile();
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate({ to: '/profile' });
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const initials = userProfile?.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            {userProfile?.profilePicture ? (
              <AvatarImage src={userProfile.profilePicture} alt={userProfile.displayName} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userProfile?.displayName || 'User'}</p>
            {userProfile?.contactInfo && (
              <p className="text-xs leading-none text-muted-foreground">{userProfile.contactInfo}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleViewProfile}>
          <User className="mr-2 h-4 w-4" />
          My Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
