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
  zoomLevel: number;
}

interface PinProps {
  profile: CommunityMapProfile;
  isSelected: boolean;
  onClick: () => void;
}

function Pin({ profile, isSelected, onClick }: PinProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const poleRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  useFrame(() => {
    if (meshRef.current && poleRef.current) {
      // Camera-distance-aware scaling to keep pins visible
      const distance = camera.position.distanceTo(meshRef.current.position);
      const baseScale = Math.max(0.8, Math.min(1.5, distance * 0.4));
      const interactionScale = isSelected ? 1.8 : hovered ? 1.4 : 1;
      const targetScale = baseScale * interactionScale;
      
      meshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.15
      );
      poleRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.15
      );
    }

    // Animate halo for selected pin
    if (haloRef.current && isSelected) {
      haloRef.current.rotation.z += 0.02;
      const pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.1;
      haloRef.current.scale.set(pulseScale, pulseScale, 1);
    }
  });

  if (!profile.coordinates) return null;

  // Increased radius offset to prevent z-fighting
  const pinRadius = 1.025;
  const position = latLonToVector3(profile.coordinates.latitude, profile.coordinates.longitude, pinRadius);

  // Calculate normal vector for pin orientation
  const normal = new THREE.Vector3(position[0], position[1], position[2]).normalize();
  
  // Distinguish current user with different color
  const pinColor = profile.isCurrentUser ? '#10b981' : isSelected ? '#3b82f6' : '#ef4444';
  const emissiveColor = profile.isCurrentUser ? '#10b981' : isSelected ? '#3b82f6' : '#ef4444';

  return (
    <group position={position}>
      {/* Pin pole - cylinder pointing outward from globe */}
      <mesh
        ref={poleRef}
        position={[normal.x * 0.025, normal.y * 0.025, normal.z * 0.025]}
        rotation={[
          Math.atan2(normal.y, Math.sqrt(normal.x * normal.x + normal.z * normal.z)),
          Math.atan2(normal.x, normal.z),
          0
        ]}
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
        <cylinderGeometry args={[0.008, 0.008, 0.05, 8]} />
        <meshStandardMaterial
          color={pinColor}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* Pin head - sphere at the top */}
      <mesh
        ref={meshRef}
        position={[normal.x * 0.05, normal.y * 0.05, normal.z * 0.05]}
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
        <sphereGeometry args={[0.022, 16, 16]} />
        <meshStandardMaterial
          color={pinColor}
          emissive={emissiveColor}
          emissiveIntensity={isSelected ? 1.2 : 0.8}
          metalness={0.8}
          roughness={0.2}
          depthTest={true}
          depthWrite={true}
        />
      </mesh>
      
      {/* Enhanced halo for selected pins */}
      {isSelected && (
        <mesh 
          ref={haloRef} 
          renderOrder={1}
          position={[normal.x * 0.05, normal.y * 0.05, normal.z * 0.05]}
        >
          <ringGeometry args={[0.03, 0.045, 32]} />
          <meshBasicMaterial
            color={pinColor}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
      )}
      
      {/* Outer glow ring for current user */}
      {profile.isCurrentUser && (
        <mesh 
          renderOrder={1}
          position={[normal.x * 0.05, normal.y * 0.05, normal.z * 0.05]}
        >
          <ringGeometry args={[0.028, 0.038, 32]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
      )}
    </group>
  );
}

function Globe({ profiles, selectedMemberId, onSelectMember, zoomLevel }: GlobeMapProps) {
  const [dayTexture, setDayTexture] = useState<THREE.Texture | null>(null);
  const [nightTexture, setNightTexture] = useState<THREE.Texture | null>(null);
  const globeRef = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    loader.load(
      '/assets/generated/earth-day-texture.dim_2048x1024.jpg',
      (texture) => {
        // Configure texture for sharp rendering at close zoom
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = gl.capabilities.getMaxAnisotropy();
        texture.generateMipmaps = true;
        texture.colorSpace = THREE.SRGBColorSpace;
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
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = gl.capabilities.getMaxAnisotropy();
        texture.generateMipmaps = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        setNightTexture(texture);
      },
      undefined,
      (error) => {
        console.error('Failed to load night texture:', error);
      }
    );
  }, [gl]);

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0005;
    }
  });

  // Update camera position when zoom level changes
  useEffect(() => {
    if (controlsRef.current) {
      const currentPosition = camera.position.clone();
      const targetPosition = currentPosition.normalize().multiplyScalar(zoomLevel);
      
      // Smooth transition to new zoom level
      const animate = () => {
        camera.position.lerp(targetPosition, 0.1);
        if (camera.position.distanceTo(targetPosition) > 0.01) {
          requestAnimationFrame(animate);
        }
      };
      animate();
    }
  }, [zoomLevel, camera]);

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

      <Sphere ref={globeRef} args={[1, 128, 128]}>
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
        <Sphere args={[1.005, 128, 128]}>
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
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={1.3}
        maxDistance={4.5}
        rotateSpeed={0.5}
        zoomSpeed={1.0}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </>
  );
}

export default function GlobeMap({ profiles, selectedMemberId, onSelectMember, zoomLevel }: GlobeMapProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, zoomLevel], fov: 45 }}
      gl={{ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance',
        // Use device pixel ratio for sharp rendering, capped at 2 for performance
        pixelRatio: Math.min(window.devicePixelRatio, 2)
      }}
      style={{ background: 'transparent' }}
    >
      <Globe
        profiles={profiles}
        selectedMemberId={selectedMemberId}
        onSelectMember={onSelectMember}
        zoomLevel={zoomLevel}
      />
    </Canvas>
  );
}
