import { useState, useEffect } from 'react';

export interface WebGLSupportResult {
  isSupported: boolean;
  isChecking: boolean;
  error: string | null;
}

export function useWebGLSupport(): WebGLSupportResult {
  const [isSupported, setIsSupported] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        setIsSupported(false);
        setError('WebGL is not supported on this device or browser');
      } else {
        setIsSupported(true);
        setError(null);
      }
    } catch (e) {
      setIsSupported(false);
      setError('Failed to initialize WebGL');
      console.error('WebGL support check failed:', e);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { isSupported, isChecking, error };
}
