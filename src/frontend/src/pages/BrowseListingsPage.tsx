import { useState } from 'react';
import { useSearchTools } from '../hooks/useQueries';
import { ToolCategory } from '../backend';
import BrowseFiltersBar from '../components/listings/BrowseFiltersBar';
import ListingsGrid from '../components/listings/ListingsGrid';
import { Loader2 } from 'lucide-react';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';

export default function BrowseListingsPage() {
  const [searchText, setSearchText] = useState('');
  const [category, setCategory] = useState<ToolCategory | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  const { data: listings = [], isLoading } = useSearchTools({
    searchText,
    category,
    minPrice,
    maxPrice,
    availableOnly,
    sortBy,
  });

  return (
    <>
      <ProfileSetupDialog />
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Browse Tools</h1>
          <p className="text-muted-foreground">Find the perfect tool for your next project</p>
        </div>

        <BrowseFiltersBar
          searchText={searchText}
          onSearchTextChange={setSearchText}
          category={category}
          onCategoryChange={setCategory}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          availableOnly={availableOnly}
          onAvailableOnlyChange={setAvailableOnly}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </div>
    </>
  );
}
