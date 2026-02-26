import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetTool, useAddToolListing, useEditToolListing } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { ToolCategory, ToolCondition } from '../backend';
import { toast } from 'sonner';
import RequireAuth from '../components/auth/RequireAuth';
import PhotoReferencesField from '../components/listings/PhotoReferencesField';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';

interface ListingFormPageProps {
  mode: 'create' | 'edit';
}

const categoryLabels: Record<ToolCategory, string> = {
  [ToolCategory.powerTools]: 'Power Tools',
  [ToolCategory.handTools]: 'Hand Tools',
  [ToolCategory.gardenTools]: 'Garden Tools',
  [ToolCategory.automotive]: 'Automotive',
  [ToolCategory.specialty]: 'Specialty',
};

const conditionLabels: Record<ToolCondition, string> = {
  [ToolCondition.new_]: 'New',
  [ToolCondition.gentlyUsed]: 'Gently Used',
  [ToolCondition.wellUsed]: 'Well Used',
  [ToolCondition.needsRepair]: 'Needs Repair',
};

export default function ListingFormPage({ mode }: ListingFormPageProps) {
  const navigate = useNavigate();
  // Always call useParams unconditionally
  const params = useParams({ strict: false });
  const listingId = mode === 'edit' && params.listingId ? BigInt(params.listingId) : undefined;

  const { data: existingListing, isLoading: loadingListing } = useGetTool(listingId);
  const addToolListing = useAddToolListing();
  const editToolListing = useEditToolListing();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ToolCategory>(ToolCategory.powerTools);
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<ToolCondition>(ToolCondition.gentlyUsed);
  const [dailyPrice, setDailyPrice] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [location, setLocation] = useState('');
  const [available, setAvailable] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'edit' && existingListing) {
      setTitle(existingListing.title);
      setCategory(existingListing.category);
      setDescription(existingListing.description);
      setCondition(existingListing.condition);
      setDailyPrice(existingListing.dailyPrice.toString());
      setSecurityDeposit(existingListing.securityDeposit?.toString() || '');
      setLocation(existingListing.location);
      setAvailable(existingListing.available);
      setPhotos(existingListing.photos);
    }
  }, [mode, existingListing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim() || !dailyPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    const priceNum = Number(dailyPrice);
    const depositNum = securityDeposit ? Number(securityDeposit) : undefined;

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid daily price');
      return;
    }

    if (depositNum !== undefined && (isNaN(depositNum) || depositNum < 0)) {
      toast.error('Please enter a valid security deposit');
      return;
    }

    try {
      if (mode === 'create') {
        const newId = await addToolListing.mutateAsync({
          title: title.trim(),
          category,
          description: description.trim(),
          condition,
          dailyPrice: priceNum,
          securityDeposit: depositNum,
          location: location.trim(),
          photos,
        });
        toast.success('Tool listed successfully!');
        navigate({ to: '/listing/$listingId', params: { listingId: newId.toString() } });
      } else if (listingId) {
        await editToolListing.mutateAsync({
          toolId: listingId,
          title: title.trim(),
          category,
          description: description.trim(),
          condition,
          dailyPrice: priceNum,
          securityDeposit: depositNum,
          location: location.trim(),
          available,
          photos,
        });
        toast.success('Tool updated successfully!');
        navigate({ to: '/listing/$listingId', params: { listingId: listingId.toString() } });
      }
    } catch (error: any) {
      console.error('Save listing error:', error);
      toast.error(error.message || 'Failed to save listing');
    }
  };

  if (mode === 'edit' && loadingListing) {
    return (
      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <RequireAuth>
      <ProfileSetupDialog />
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate({ to: mode === 'edit' && listingId ? `/listing/${listingId}` : '/my-tools' })} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>{mode === 'create' ? 'List a Tool' : 'Edit Tool Listing'}</CardTitle>
            <CardDescription>
              {mode === 'create' ? 'Share your unused tools with the community' : 'Update your tool listing details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tool Name *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Cordless Drill, Lawn Mower"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(value) => setCategory(value as ToolCategory)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={condition} onValueChange={(value) => setCondition(value as ToolCondition)}>
                    <SelectTrigger id="condition">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(conditionLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the tool, its features, and any important details..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dailyPrice">Daily Price ($) *</Label>
                  <Input
                    id="dailyPrice"
                    type="number"
                    value={dailyPrice}
                    onChange={(e) => setDailyPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="securityDeposit">Security Deposit ($)</Label>
                  <Input
                    id="securityDeposit"
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    placeholder="Optional"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, neighborhood, or area"
                  required
                />
              </div>

              <PhotoReferencesField photos={photos} onChange={setPhotos} />

              {mode === 'edit' && (
                <div className="flex items-center space-x-2">
                  <Switch id="available" checked={available} onCheckedChange={setAvailable} />
                  <Label htmlFor="available" className="cursor-pointer">
                    Available for rent
                  </Label>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: mode === 'edit' && listingId ? `/listing/${listingId}` : '/my-tools' })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addToolListing.isPending || editToolListing.isPending}
                  className="flex-1"
                >
                  {addToolListing.isPending || editToolListing.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {mode === 'create' ? 'List Tool' : 'Save Changes'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}
