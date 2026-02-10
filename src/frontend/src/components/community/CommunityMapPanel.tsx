import { useRef, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ZoomIn, ZoomOut, Maximize2, MapPin, X } from 'lucide-react';
import { useMapTransform } from '../../hooks/useMapTransform';
import { geoToScreen } from '../../utils/geoProjection';
import type { CommunityMapProfile } from '../../backend';

interface CommunityMapPanelProps {
  profiles: CommunityMapProfile[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
}

export default function CommunityMapPanel({ profiles, selectedMemberId, onSelectMember }: CommunityMapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    zoom,
    panX,
    panY,
    zoomIn,
    zoomOut,
    reset,
    handleWheel,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    hasDragged,
  } = useMapTransform({
    initialZoom: 1,
    minZoom: 0.5,
    maxZoom: 4,
    zoomStep: 0.2,
    dragThreshold: 5,
  });

  const handleWheelEvent = (e: ReactWheelEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      handleWheel(e, rect);
    }
  };

  const handleMarkerClick = (memberId: string) => {
    if (!hasDragged) {
      onSelectMember(selectedMemberId === memberId ? null : memberId);
    }
  };

  const selectedProfile = profiles.find((p) => p.id.toString() === selectedMemberId);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative h-[500px] w-full overflow-hidden rounded-lg bg-muted">
          <div
            ref={containerRef}
            className="relative h-full w-full touch-none"
            onWheel={handleWheelEvent}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ cursor: 'grab' }}
          >
            <div
              className="absolute inset-0 origin-center transition-transform"
              style={{
                transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
              }}
            >
              <img
                src="/assets/generated/world-map.dim_1600x900.png"
                alt="World Map"
                className="h-full w-full object-cover pointer-events-none select-none"
                draggable={false}
              />

              {profiles.map((profile) => {
                if (!profile.coordinates) return null;

                const position = geoToScreen(profile.coordinates);
                const isSelected = selectedMemberId === profile.id.toString();

                return (
                  <button
                    key={profile.id.toString()}
                    onClick={() => handleMarkerClick(profile.id.toString())}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${
                      isSelected ? 'z-20 scale-125' : 'z-10 hover:scale-110'
                    }`}
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                    }}
                  >
                    <div
                      className={`rounded-full p-1 shadow-lg ${
                        isSelected ? 'bg-primary ring-4 ring-primary/30' : 'bg-background ring-2 ring-border'
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        {profile.profilePicture ? (
                          <AvatarImage src={profile.profilePicture} alt={profile.displayName} />
                        ) : null}
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {profile.displayName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button size="icon" variant="secondary" onClick={zoomIn} className="shadow-lg">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={zoomOut} className="shadow-lg">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="secondary" onClick={reset} className="shadow-lg">
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>

          {selectedProfile && (
            <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:max-w-sm">
              <Card className="shadow-xl">
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
