import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCommunityMapProfiles, useGetCallerUserProfile } from '../hooks/useQueries';
import CommunityMapPanel from '../components/community/CommunityMapPanel';
import SetCoordinatesDialog from '../components/community/SetCoordinatesDialog';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import LoadingState from '../components/states/LoadingState';
import { Button } from '@/components/ui/button';
import { MapPin, Lock } from 'lucide-react';

export default function CommunityMapPage() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [showSetCoords, setShowSetCoords] = useState(false);

  const {
    data: mapProfiles = [],
    isLoading: profilesLoading,
    error: profilesError,
  } = useGetCommunityMapProfiles();

  const {
    data: myProfile,
    isLoading: myProfileLoading,
  } = useGetCallerUserProfile();

  const isLoading = profilesLoading || myProfileLoading;

  const myProfileHasCoords = !!myProfile?.coordinates;

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="rounded-full bg-muted p-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Sign in to view the community map</h2>
          <p className="text-muted-foreground max-w-sm">
            The community map shows where members in your area are located. Please log in to access it.
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Community Map"
        subtitle="See where your neighbors and fellow tool-sharers are located"
        actions={
          myProfile && !myProfileHasCoords ? (
            <Button onClick={() => setShowSetCoords(true)} size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Add My Location
            </Button>
          ) : myProfile && myProfileHasCoords ? (
            <Button variant="outline" onClick={() => setShowSetCoords(true)} size="sm">
              <MapPin className="h-4 w-4 mr-2" />
              Update Location
            </Button>
          ) : null
        }
      />

      {isLoading ? (
        <LoadingState message="Loading community map…" />
      ) : profilesError ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-center">
          <p className="text-destructive font-medium">Failed to load community map</p>
          <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
        </div>
      ) : (
        <div className="h-[calc(100vh-220px)] min-h-[500px]">
          <CommunityMapPanel
            members={mapProfiles}
            isLoading={false}
          />
        </div>
      )}

      {myProfile && (
        <SetCoordinatesDialog
          open={showSetCoords}
          onOpenChange={setShowSetCoords}
          currentProfile={{
            displayName: myProfile.displayName,
            contactInfo: myProfile.contactInfo ?? undefined,
            location: myProfile.location,
            profilePicture: myProfile.profilePicture,
            address: myProfile.address ?? undefined,
          }}
        />
      )}
    </PageShell>
  );
}
