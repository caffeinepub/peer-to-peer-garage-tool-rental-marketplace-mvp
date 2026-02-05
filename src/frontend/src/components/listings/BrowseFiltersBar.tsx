import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { ToolCategory } from '../../backend';

interface BrowseFiltersBarProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;
  category: ToolCategory | undefined;
  onCategoryChange: (value: ToolCategory | undefined) => void;
  minPrice: number | undefined;
  onMinPriceChange: (value: number | undefined) => void;
  maxPrice: number | undefined;
  onMaxPriceChange: (value: number | undefined) => void;
  availableOnly: boolean;
  onAvailableOnlyChange: (value: boolean) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
}

const categoryLabels: Record<ToolCategory, string> = {
  [ToolCategory.powerTools]: 'Power Tools',
  [ToolCategory.handTools]: 'Hand Tools',
  [ToolCategory.gardenTools]: 'Garden Tools',
  [ToolCategory.automotive]: 'Automotive',
  [ToolCategory.specialty]: 'Specialty',
};

export default function BrowseFiltersBar({
  searchText,
  onSearchTextChange,
  category,
  onCategoryChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  availableOnly,
  onAvailableOnlyChange,
  sortBy,
  onSortByChange,
}: BrowseFiltersBarProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search tools..."
                value={searchText}
                onChange={(e) => onSearchTextChange(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={category || 'all'}
              onValueChange={(value) => onCategoryChange(value === 'all' ? undefined : (value as ToolCategory))}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortBy">Sort By</Label>
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger id="sortBy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                <SelectItem value="priceDesc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minPrice">Min Price ($)</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={minPrice ?? ''}
              onChange={(e) => onMinPriceChange(e.target.value ? Number(e.target.value) : undefined)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxPrice">Max Price ($)</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="Any"
              value={maxPrice ?? ''}
              onChange={(e) => onMaxPriceChange(e.target.value ? Number(e.target.value) : undefined)}
              min="0"
            />
          </div>

          <div className="flex items-end space-x-2">
            <Switch id="availableOnly" checked={availableOnly} onCheckedChange={onAvailableOnlyChange} />
            <Label htmlFor="availableOnly" className="cursor-pointer">
              Available only
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
