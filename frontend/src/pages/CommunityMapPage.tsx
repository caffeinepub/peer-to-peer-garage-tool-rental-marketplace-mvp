import { useState, useEffect } from 'react';
import { useGetCommunityMapProfiles, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Users, Plus, Globe, CheckCircle2 } from 'lucide-react';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import SetCoordinatesDialog from '../components/community/SetCoordinatesDialog';
import CommunityMapPanel from '../components/community/CommunityMapPanel';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import LoadingState from '../components/states/LoadingState';
import ErrorStateCard from '../components/states/ErrorStateCard';
import EmptyStateCard from '../components/states/EmptyStateCard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function CommunityMapPage() {
  const { identity } = useInternetIdentity();
  const { data: profiles, isLoading, error, refetch, isFetching } = useGetCommunityMapProfiles();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showCoordinatesDialog, setShowCoordinatesDialog] = useState(false);

  const isAuthenticated = !!identity;
  const currentUserProfile = profiles?.find((p) => p.isCurrentUser);
  const hasAddress = currentUserProfile?.address !== undefined && currentUserProfile?.address !== null;

  // Auto-select current user's pin after address is saved
  useEffect(() => {
    if (currentUserProfile && hasAddress && currentUserProfile.coordinates) {
      setSelectedMemberId(currentUserProfile.id.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserProfile?.id.toString(), hasAddress]);

  // Refetch profiles when dialog closes
  const handleDialogChange = (open: boolean) => {
    setShowCoordinatesDialog(open);
    if (!open) {
      refetch();
    }
  };

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <EmptyStateCard
            icon={Globe}
            title="Login Required"
            description="Please log in to view the community map and connect with other members."
          />
        </div>
      </PageShell>
    );
  }

  if (isLoading || profileLoading) {
    return (
      <PageShell>
        <LoadingState message="Loading community map..." />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <ErrorStateCard
          title="Failed to Load Community Map"
          description="There was an error loading the community map. Please try again later."
          action={
            <Button onClick={() => refetch()} variant="outline" size="sm" disabled={isFetching}>
              {isFetching ? 'Retrying...' : 'Try Again'}
            </Button>
          }
        />
      </PageShell>
    );
  }

  const profilesWithCoordinates = profiles?.filter((p) => p.coordinates) || [];
  const hasNoMembers = !profiles || profiles.length === 0;
  const hasNoCoordinates = profilesWithCoordinates.length === 0;

  return (
    <PageShell>
      <ProfileSetupDialog />
      <SetCoordinatesDialog
        open={showCoordinatesDialog}
        onOpenChange={handleDialogChange}
      />

      <PageHeader
        title="Community Map"
        subtitle="Discover and connect with tool sharers in your area"
      />

      {/* Add Address Alert */}
      {!hasAddress && (
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <MapPin className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span className="text-sm">
              Add your address to appear on the community map and connect with nearby members.
            </span>
            <Button
              onClick={() => setShowCoordinatesDialog(true)}
              size="sm"
              className="shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {hasNoMembers ? (
        <EmptyStateCard
          icon={Users}
          title="No Community Members Yet"
          description="Be the first to add your location and start building the community!"
          action={
            <Button onClick={() => setShowCoordinatesDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Your Location
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Panel */}
          <div className="lg:col-span-2">
            {hasNoCoordinates ? (
              <Card>
                <CardContent className="p-12">
                  <EmptyStateCard
                    icon={MapPin}
                    title="No Locations Added Yet"
                    description="Community members haven't added their locations yet. Add yours to get started!"
                    action={
                      <Button onClick={() => setShowCoordinatesDialog(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your Location
                      </Button>
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <CommunityMapPanel
                profiles={profiles!}
                selectedMemberId={selectedMemberId}
                onSelectMember={setSelectedMemberId}
              />
            )}
          </div>

          {/* Member Directory */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members
                </CardTitle>
                <CardDescription>
                  {profilesWithCoordinates.length}{' '}
                  {profilesWithCoordinates.length === 1 ? 'member' : 'members'} on the map
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[520px] pr-4">
                  <div className="space-y-3">
                    {profiles!.map((profile) => {
                      const isSelected = selectedMemberId === profile.id.toString();
                      const hasCoords = !!profile.coordinates;

                      return (
                        <button
                          key={profile.id.toString()}
                          onClick={() => {
                            if (hasCoords) {
                              setSelectedMemberId(isSelected ? null : profile.id.toString());
                            }
                          }}
                          disabled={!hasCoords}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/5 shadow-sm'
                              : hasCoords
                              ? 'border-border hover:border-primary/50 hover:bg-muted/50'
                              : 'border-dashed border-muted-foreground/20 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <Avatar className="h-10 w-10">
                                {profile.profilePicture ? (
                                  <AvatarImage src={profile.profilePicture} alt={profile.displayName} />
                                ) : null}
                                <AvatarFallback
                                  className={
                                    profile.isCurrentUser
                                      ? 'bg-green-500 text-white'
                                      : 'bg-primary text-primary-foreground'
                                  }
                                >
                                  {profile.displayName
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              {profile.isCurrentUser && (
                                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                  ✓
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {profile.displayName}
                                {profile.isCurrentUser && (
                                  <span className="text-xs text-green-600 dark:text-green-400 ml-1.5 font-normal">
                                    (You)
                                  </span>
                                )}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{profile.location}</span>
                              </div>
                              {!hasCoords && (
                                <p className="text-xs text-muted-foreground/70 mt-1">No location added</p>
                              )}
                            </div>
                            {hasCoords && isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
