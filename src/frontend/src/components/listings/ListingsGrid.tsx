import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';
import type { ToolListing } from '../../backend';
import { ToolCategory, ToolCondition } from '../../backend';

interface ListingsGridProps {
  listings: ToolListing[];
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

export default function ListingsGrid({ listings }: ListingsGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-muted-foreground">No tools found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <Link
          key={listing.id.toString()}
          to="/listing/$listingId"
          params={{ listingId: listing.id.toString() }}
          className="group"
        >
          <Card className="h-full transition-shadow hover:shadow-lg">
            <CardHeader className="p-0">
              <div className="relative aspect-video overflow-hidden rounded-t-lg bg-muted">
                {listing.photos.length > 0 ? (
                  <>
                    <img
                      src={listing.photos[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) {
                          fallback.classList.remove('hidden');
                        }
                      }}
                    />
                    <div className="hidden h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {!listing.available && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Badge variant="secondary">Unavailable</Badge>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <CardTitle className="line-clamp-1 text-lg">{listing.title}</CardTitle>
                <Badge variant="outline" className="shrink-0">
                  {categoryLabels[listing.category]}
                </Badge>
              </div>
              <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{listing.location}</span>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
              <div className="flex items-center gap-1 text-lg font-semibold text-primary">
                <DollarSign className="h-5 w-5" />
                {Number(listing.dailyPrice)}/day
              </div>
              <Badge variant="secondary">{conditionLabels[listing.condition]}</Badge>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
