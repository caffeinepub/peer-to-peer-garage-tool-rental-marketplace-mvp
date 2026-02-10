import { useState } from 'react';
import { useGetCommunityMapProfiles } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Users, Globe } from 'lucide-react';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import CommunityMapPanel from '../components/community/CommunityMapPanel';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import LoadingState from '../components/states/LoadingState';
import ErrorStateCard from '../components/states/ErrorStateCard';
import EmptyStateCard from '../components/states/EmptyStateCard';

export default function CommunityMapPage() {
  const { identity } = useInternetIdentity();
  const { data: profiles, isLoading, error } = useGetCommunityMapProfiles();
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const isAuthenticated = !!identity;

  if (!isAuthenticated) {
    return (
      <PageShell>
        <EmptyStateCard
          icon={Globe}
          title="Access Denied"
          description="Please log in to view the community map"
        />
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <>
        <ProfileSetupDialog />
        <PageShell>
          <PageHeader
            title="Community Map"
            subtitle="Connect with ToolShare members in your area"
          />
          <LoadingState />
        </PageShell>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ProfileSetupDialog />
        <PageShell>
          <ErrorStateCard
            title="Error Loading Community"
            description="Failed to load community data. Please try again later."
          />
        </PageShell>
      </>
    );
  }

  const allProfiles = profiles || [];

  const handleMemberSelect = (memberId: string | null) => {
    setSelectedMemberId(memberId);
  };

  const handleDirectoryCardClick = (memberId: string) => {
    setSelectedMemberId(memberId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <ProfileSetupDialog />
      <PageShell>
        <PageHeader
          title="Community Map"
          subtitle="Connect with ToolShare members in your area"
        />

        <div className="space-y-6">
          <CommunityMapPanel
            profiles={allProfiles}
            selectedMemberId={selectedMemberId}
            onSelectMember={handleMemberSelect}
          />

          <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Community Members
                </CardTitle>
                <CardDescription>Browse all ToolShare members</CardDescription>
              </CardHeader>
              <CardContent>
                {allProfiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <Users className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Members Yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Be the first to join the community!
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {allProfiles.map((profile) => {
                      const initials = profile.displayName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      const isSelected = selectedMemberId === profile.id.toString();

                      return (
                        <Card
                          key={profile.id.toString()}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'ring-2 ring-primary shadow-lg'
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleDirectoryCardClick(profile.id.toString())}
                        >
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <Avatar className="h-16 w-16">
                                {profile.profilePicture ? (
                                  <AvatarImage src={profile.profilePicture} alt={profile.displayName} />
                                ) : null}
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <p className="font-semibold">{profile.displayName}</p>
                                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {profile.location}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Members</p>
                    <p className="text-2xl font-bold">{allProfiles.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageShell>
    </>
  );
}
