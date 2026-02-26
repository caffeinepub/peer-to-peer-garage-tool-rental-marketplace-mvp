import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, X, Mail } from 'lucide-react';
import CustomMapView from './CustomMapView';
import type { CommunityMapProfile } from '../../backend';

interface CommunityMapPanelProps {
  profiles: CommunityMapProfile[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
}

export default function CommunityMapPanel({ profiles, selectedMemberId, onSelectMember }: CommunityMapPanelProps) {
  const selectedProfile = profiles.find((p) => p.id.toString() === selectedMemberId);
  const profilesWithCoordinates = profiles.filter((p) => p.coordinates);

  if (profilesWithCoordinates.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No member locations available to display on the map.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative h-[600px] w-full overflow-hidden rounded-lg">
          <CustomMapView
            members={profilesWithCoordinates}
            selectedMemberId={selectedMemberId}
            onMemberSelect={onSelectMember}
          />

          {selectedProfile && (
            <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:max-w-sm z-30 pointer-events-auto">
              <Card className="shadow-xl bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                        {selectedProfile.profilePicture ? (
                          <AvatarImage src={selectedProfile.profilePicture} alt={selectedProfile.displayName} />
                        ) : null}
                        <AvatarFallback
                          className={selectedProfile.isCurrentUser ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'}
                        >
                          {selectedProfile.displayName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedProfile.isCurrentUser && (
                        <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                          ✓
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate text-base text-gray-900">
                        {selectedProfile.displayName}
                        {selectedProfile.isCurrentUser && (
                          <span className="text-xs text-green-600 ml-2 font-normal">(You)</span>
                        )}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{selectedProfile.location}</span>
                      </div>
                      {selectedProfile.address && (
                        <p className="text-xs text-gray-400 mt-1.5 line-clamp-2">
                          {selectedProfile.address}
                        </p>
                      )}
                      {selectedProfile.contactInfo && !selectedProfile.isCurrentUser && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{selectedProfile.contactInfo}</span>
                        </div>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => onSelectMember(null)}
                      className="h-8 w-8 shrink-0 hover:bg-gray-100 text-gray-500"
                      aria-label="Close member details"
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
