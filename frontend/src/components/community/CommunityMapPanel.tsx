import React, { useState } from 'react';
import { CommunityMapProfile } from '../../backend';
import CustomMapView from './CustomMapView';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommunityMapPanelProps {
  members: CommunityMapProfile[];
  isLoading: boolean;
}

function formatJoinDate(joinedAt: bigint): string {
  try {
    const ms = Number(joinedAt) / 1_000_000;
    return formatDistanceToNow(new Date(ms), { addSuffix: true });
  } catch {
    return 'recently';
  }
}

export default function CommunityMapPanel({ members, isLoading }: CommunityMapPanelProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | undefined>();

  const membersWithCoords = members.filter(m => m.coordinates);
  const selectedMember = members.find(m => m.id.toString() === selectedMemberId);

  const handleMemberSelect = (id: string) => {
    setSelectedMemberId(prev => (prev === id ? undefined : id));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-[500px]">
      {/* Map */}
      <div className="flex-1 min-h-[400px] lg:min-h-0 relative rounded-lg overflow-hidden border border-border">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-sm">Loading map…</span>
            </div>
          </div>
        ) : (
          <CustomMapView
            members={membersWithCoords}
            selectedMemberId={selectedMemberId}
            onMemberSelect={handleMemberSelect}
          />
        )}

        {/* Selected member info card */}
        {selectedMember && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 bg-background border border-border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 min-w-[220px] max-w-xs">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={selectedMember.profilePicture} />
              <AvatarFallback>{selectedMember.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{selectedMember.displayName}</p>
              {selectedMember.location && (
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {selectedMember.location}
                </p>
              )}
              {selectedMember.isCurrentUser && (
                <Badge variant="secondary" className="text-xs mt-0.5">You</Badge>
              )}
            </div>
            <button
              className="text-muted-foreground hover:text-foreground ml-1 shrink-0"
              onClick={() => setSelectedMemberId(undefined)}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Member list sidebar */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="font-semibold text-sm">
            Members ({membersWithCoords.length} on map)
          </span>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
            Loading members…
          </div>
        ) : members.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
            No community members yet.
          </div>
        ) : (
          <ScrollArea className="flex-1">
            <div className="divide-y divide-border">
              {members.map(member => (
                <button
                  key={member.id.toString()}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors ${
                    selectedMemberId === member.id.toString() ? 'bg-muted' : ''
                  }`}
                  onClick={() => member.coordinates && handleMemberSelect(member.id.toString())}
                  disabled={!member.coordinates}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={member.profilePicture} />
                    <AvatarFallback className="text-xs">
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{member.displayName}</span>
                      {member.isCurrentUser && (
                        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">You</Badge>
                      )}
                    </div>
                    {member.location && (
                      <p className="text-xs text-muted-foreground truncate">{member.location}</p>
                    )}
                    {!member.coordinates && (
                      <p className="text-xs text-muted-foreground/60 italic">No location set</p>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {formatJoinDate(member.joinedAt)}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
