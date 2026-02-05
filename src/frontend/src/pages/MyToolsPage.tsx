import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetToolsByOwner } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Plus, Loader2 } from 'lucide-react';
import RequireAuth from '../components/auth/RequireAuth';
import ListingsGrid from '../components/listings/ListingsGrid';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';

export default function MyToolsPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const ownerPrincipal = identity?.getPrincipal().toString();
  const { data: listings = [], isLoading } = useGetToolsByOwner(ownerPrincipal);

  return (
    <RequireAuth>
      <ProfileSetupDialog />
      <div className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight">My Tools</h1>
            <p className="text-muted-foreground">Manage your tool listings</p>
          </div>
          <Button onClick={() => navigate({ to: '/add-listing' })}>
            <Plus className="mr-2 h-4 w-4" />
            Add Tool
          </Button>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : listings.length === 0 ? (
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>No Tools Listed Yet</CardTitle>
              <CardDescription>Start earning by listing your unused tools</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={() => navigate({ to: '/add-listing' })}>
                <Plus className="mr-2 h-4 w-4" />
                List Your First Tool
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </div>
    </RequireAuth>
  );
}
