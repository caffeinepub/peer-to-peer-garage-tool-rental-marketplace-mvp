import { useEffect } from 'react';
import { useCamera } from '../../camera/useCamera';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, X, Loader2, RotateCw, AlertCircle } from 'lucide-react';
import { fileToDataUrl } from '../../utils/fileToDataUrl';

interface CameraCapturePanelProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export default function CameraCapturePanel({ onCapture, onClose }: CameraCapturePanelProps) {
  const {
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: 'environment',
    quality: 0.9,
    format: 'image/jpeg',
  });

  useEffect(() => {
    // Start camera when component mounts
    startCamera();

    // Stop camera when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        onCapture(dataUrl);
        await stopCamera();
        onClose();
      } catch (err) {
        console.error('Failed to convert photo to data URL:', err);
      }
    }
  };

  const handleClose = async () => {
    await stopCamera();
    onClose();
  };

  const getErrorMessage = () => {
    if (!error) return null;

    switch (error.type) {
      case 'permission':
        return 'Camera access was denied. Please allow camera permissions in your browser settings and try again.';
      case 'not-supported':
        return 'Camera is not supported on this device or browser. You can still add photos via URL.';
      case 'not-found':
        return 'No camera was found on this device. You can still add photos via URL.';
      case 'unknown':
        return 'An error occurred while accessing the camera. Please try again.';
      default:
        return 'An error occurred while accessing the camera. Please try again.';
    }
  };

  if (isSupported === false) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Camera Not Supported</CardTitle>
          <CardDescription>Your device or browser does not support camera access</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Camera functionality is not available on this device. You can still add photos by entering image URLs.
            </AlertDescription>
          </Alert>
          <Button onClick={handleClose} className="mt-4 w-full">
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Capture Photo</CardTitle>
            <CardDescription>Take a photo of your tool</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{getErrorMessage()}</AlertDescription>
          </Alert>
        )}

        <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ minHeight: '300px', aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
            style={{ display: isActive ? 'block' : 'none' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                <p className="text-sm">Initializing camera...</p>
              </div>
            </div>
          )}

          {!isActive && !isLoading && error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center text-white">
                <AlertCircle className="mx-auto mb-2 h-8 w-8" />
                <p className="text-sm">Camera unavailable</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {error ? (
            <Button onClick={retry} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RotateCw className="mr-2 h-4 w-4" />
                  Retry
                </>
              )}
            </Button>
          ) : (
            <>
              <Button onClick={handleCapture} disabled={!isActive || isLoading} className="flex-1">
                <Camera className="mr-2 h-4 w-4" />
                Capture Photo
              </Button>
              {currentFacingMode && (
                <Button
                  onClick={() => switchCamera()}
                  disabled={!isActive || isLoading}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>

        <Button onClick={handleClose} variant="outline" className="w-full">
          Cancel
        </Button>
      </CardContent>
    </Card>
  );
}
