import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import type { CommunityMapProfile } from '../../backend';
import { latLonToVector3 } from '../../utils/globeProjection';

interface GlobeMapProps {
  profiles: CommunityMapProfile[];
  selectedMemberId: string | null;
  onSelectMember: (memberId: string | null) => void;
}

interface PinProps {
  profile: CommunityMapProfile;
  isSelected: boolean;
  onClick: () => void;
}

function Pin({ profile, isSelected, onClick }: PinProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isSelected ? 1.5 : hovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  if (!profile.coordinates) return null;

  const position = latLonToVector3(profile.coordinates.latitude, profile.coordinates.longitude, 1.01);

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[0.015, 16, 16]} />
      <meshStandardMaterial
        color={isSelected ? '#3b82f6' : '#ef4444'}
        emissive={isSelected ? '#3b82f6' : '#ef4444'}
        emissiveIntensity={isSelected ? 0.8 : 0.5}
        metalness={0.8}
        roughness={0.2}
      />
      {isSelected && (
        <mesh>
          <ringGeometry args={[0.02, 0.03, 32]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </mesh>
  );
}

function Globe({ profiles, selectedMemberId, onSelectMember }: GlobeMapProps) {
  const [dayTexture, setDayTexture] = useState<THREE.Texture | null>(null);
  const [nightTexture, setNightTexture] = useState<THREE.Texture | null>(null);
  const globeRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    loader.load(
      '/assets/generated/earth-day-texture.dim_2048x1024.jpg',
      (texture) => {
        setDayTexture(texture);
      },
      undefined,
      (error) => {
        console.error('Failed to load day texture:', error);
      }
    );

    loader.load(
      '/assets/generated/earth-night-texture.dim_2048x1024.jpg',
      (texture) => {
        setNightTexture(texture);
      },
      undefined,
      (error) => {
        console.error('Failed to load night texture:', error);
      }
    );
  }, []);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0005;
    }
  });

  useEffect(() => {
    camera.position.set(0, 0, 2.5);
  }, [camera]);

  const handlePinClick = useCallback(
    (memberId: string) => {
      onSelectMember(selectedMemberId === memberId ? null : memberId);
    },
    [selectedMemberId, onSelectMember]
  );

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 3, 5]} intensity={1.2} />
      <pointLight position={[-5, -3, -5]} intensity={0.4} color="#4a90e2" />

      <Sphere ref={globeRef} args={[1, 64, 64]}>
        {dayTexture ? (
          <meshStandardMaterial
            map={dayTexture}
            metalness={0.1}
            roughness={0.8}
          />
        ) : (
          <meshStandardMaterial color="#1e40af" metalness={0.2} roughness={0.8} />
        )}
      </Sphere>

      {nightTexture && (
        <Sphere args={[1.005, 64, 64]}>
          <meshBasicMaterial
            map={nightTexture}
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </Sphere>
      )}

      {profiles.map((profile) => (
        <Pin
          key={profile.id.toString()}
          profile={profile}
          isSelected={selectedMemberId === profile.id.toString()}
          onClick={() => handlePinClick(profile.id.toString())}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={1.5}
        maxDistance={4}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

export default function GlobeMap({ profiles, selectedMemberId, onSelectMember }: GlobeMapProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <Globe
        profiles={profiles}
        selectedMemberId={selectedMemberId}
        onSelectMember={onSelectMember}
      />
    </Canvas>
  );
}
