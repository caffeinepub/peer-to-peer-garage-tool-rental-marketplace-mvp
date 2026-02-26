import type { CommunityMapProfile } from '../../backend';

interface CustomMarkerProps {
  profile: CommunityMapProfile;
  screenX: number;
  screenY: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function CustomMarker({ profile, screenX, screenY, isSelected, onClick }: CustomMarkerProps) {
  const initials = profile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const pinColor = profile.isCurrentUser
    ? '#34A853'
    : isSelected
    ? '#1A73E8'
    : '#EA4335';

  const borderColor = isSelected ? '#fff' : '#fff';
  const shadowClass = isSelected ? 'drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)]' : 'drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]';

  return (
    <div
      className="absolute pointer-events-auto"
      style={{
        left: screenX,
        top: screenY,
        transform: 'translate(-50%, -100%)',
        zIndex: isSelected ? 30 : 20,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Pulse ring for selected */}
      {isSelected && (
        <div
          className="absolute rounded-full animate-ping"
          style={{
            width: 48,
            height: 48,
            top: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: pinColor,
            opacity: 0.25,
          }}
        />
      )}

      {/* Pin SVG shape */}
      <div className={`relative cursor-pointer select-none ${shadowClass}`} style={{ width: 40, height: 52 }}>
        <svg
          viewBox="0 0 40 52"
          width="40"
          height="52"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          {/* Teardrop path */}
          <path
            d="M20 0C9 0 0 9 0 20C0 33 20 52 20 52C20 52 40 33 40 20C40 9 31 0 20 0Z"
            fill={pinColor}
          />
          {/* White border circle */}
          <circle cx="20" cy="20" r="13" fill={borderColor} />
          {/* Avatar circle background */}
          <circle cx="20" cy="20" r="11" fill={pinColor} opacity="0.15" />
          {/* Clip path for avatar image */}
          <clipPath id={`clip-${profile.id.toString()}`}>
            <circle cx="20" cy="20" r="11" />
          </clipPath>
        </svg>

        {/* Avatar content positioned over the SVG circle */}
        <div
          className="absolute flex items-center justify-center overflow-hidden rounded-full"
          style={{
            width: 22,
            height: 22,
            top: 9,
            left: 9,
            backgroundColor: pinColor,
          }}
        >
          {profile.profilePicture ? (
            <img
              src={profile.profilePicture}
              alt={profile.displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span
              className="text-white font-bold select-none"
              style={{ fontSize: 8, lineHeight: 1 }}
            >
              {initials}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
