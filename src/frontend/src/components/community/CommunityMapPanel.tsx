import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, X, AlertCircle } from 'lucide-react';
import { useWebGLSupport } from '../../hooks/useWebGLSupport';
import GlobeMap from './GlobeMap';
import type { CommunityMapProfile } from '../../backend';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CommunityMapPanelProps {
  profiles: CommunityMapProfile[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
}

export default function CommunityMapPanel({ profiles, selectedMemberId, onSelectMember }: CommunityMapPanelProps) {
  const { isSupported, isChecking } = useWebGLSupport();
  const selectedProfile = profiles.find((p) => p.id.toString() === selectedMemberId);

  const profilesWithCoordinates = profiles.filter((p) => p.coordinates);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative h-[500px] w-full overflow-hidden rounded-lg bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
          {isChecking ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Loading globe...</p>
              </div>
            </div>
          ) : !isSupported ? (
            <div className="flex items-center justify-center h-full p-8">
              <Alert variant="destructive" className="max-w-md">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>3D Globe Unavailable</AlertTitle>
                <AlertDescription>
                  Your browser or device does not support WebGL, which is required for the interactive 3D globe.
                  Please try using a modern browser like Chrome, Firefox, Safari, or Edge.
                </AlertDescription>
              </Alert>
            </div>
          ) : (
            <GlobeMap
              profiles={profilesWithCoordinates}
              selectedMemberId={selectedMemberId}
              onSelectMember={onSelectMember}
            />
          )}

          {selectedProfile && isSupported && !isChecking && (
            <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:max-w-sm z-10">
              <Card className="shadow-xl backdrop-blur-sm bg-background/95">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      {selectedProfile.profilePicture ? (
                        <AvatarImage src={selectedProfile.profilePicture} alt={selectedProfile.displayName} />
                      ) : null}
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {selectedProfile.displayName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{selectedProfile.displayName}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{selectedProfile.location}</span>
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={() => onSelectMember(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
