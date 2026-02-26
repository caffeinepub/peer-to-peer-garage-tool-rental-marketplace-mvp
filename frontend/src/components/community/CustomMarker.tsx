import React from 'react';
import { CommunityMapProfile } from '../../backend';

interface CustomMarkerProps {
  member: CommunityMapProfile;
  x: number;
  y: number;
  isSelected: boolean;
  isCurrentUser: boolean;
  onClick: () => void;
}

export default function CustomMarker({ member, x, y, isSelected, isCurrentUser, onClick }: CustomMarkerProps) {
  const color = isCurrentUser ? '#22c55e' : isSelected ? '#3b82f6' : '#ef4444';
  const size = isSelected ? 44 : 36;
  const halfSize = size / 2;

  const initials = member.displayName
    ? member.displayName.slice(0, 2).toUpperCase()
    : '??';

  return (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        left: x - halfSize,
        top: y - size, // pin tip at (x, y)
        width: size,
        height: size,
        zIndex: isSelected ? 20 : 10,
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      title={member.displayName}
    >
      {/* Pulse ring for selected */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            inset: -6,
            borderRadius: '50%',
            border: `2px solid ${color}`,
            opacity: 0.5,
            animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          }}
        />
      )}

      {/* Pin shape */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        style={{ display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' }}
      >
        {/* Teardrop path */}
        <path
          d="M22 2 C13.16 2 6 9.16 6 18 C6 28 22 42 22 42 C22 42 38 28 38 18 C38 9.16 30.84 2 22 2 Z"
          fill={color}
          stroke="white"
          strokeWidth="2"
        />
        {/* Avatar circle */}
        <clipPath id={`clip-${member.id}`}>
          <circle cx="22" cy="17" r="10" />
        </clipPath>
        {member.profilePicture ? (
          <image
            href={member.profilePicture}
            x="12"
            y="7"
            width="20"
            height="20"
            clipPath={`url(#clip-${member.id})`}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <>
            <circle cx="22" cy="17" r="10" fill="white" fillOpacity="0.25" />
            <text
              x="22"
              y="21"
              textAnchor="middle"
              fontSize="9"
              fontWeight="bold"
              fill="white"
              fontFamily="sans-serif"
            >
              {initials}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
