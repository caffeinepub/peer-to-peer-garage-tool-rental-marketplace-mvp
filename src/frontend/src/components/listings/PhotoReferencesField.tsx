import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus, Image as ImageIcon, Camera } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import CameraCapturePanel from './CameraCapturePanel';

interface PhotoReferencesFieldProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export default function PhotoReferencesField({ photos, onChange }: PhotoReferencesFieldProps) {
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim()) {
      onChange([...photos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const handleCameraCapture = (dataUrl: string) => {
    onChange([...photos, dataUrl]);
  };

  return (
    <div className="space-y-4">
      <Label>Photos</Label>
      <p className="text-sm text-muted-foreground">Add photos via URL or capture with your camera</p>
      
      <div className="flex gap-2">
        <Input
          value={newPhotoUrl}
          onChange={(e) => setNewPhotoUrl(e.target.value)}
          placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddPhoto();
            }
          }}
        />
        <Button type="button" onClick={handleAddPhoto} size="icon" variant="outline" title="Add URL">
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={() => setShowCamera(true)}
          size="icon"
          variant="outline"
          title="Capture photo"
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>

      {photos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {photos.map((photo, index) => (
            <div key={index} className="group relative aspect-video overflow-hidden rounded-lg border bg-muted">
              <img
                src={photo}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.classList.remove('hidden');
                  }
                }}
              />
              <div className="hidden h-full w-full items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => handleRemovePhoto(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCamera} onOpenChange={setShowCamera}>
        <DialogContent className="max-w-2xl">
          <CameraCapturePanel
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
