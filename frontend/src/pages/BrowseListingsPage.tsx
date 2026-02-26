import { useState } from 'react';
import { useSearchTools } from '../hooks/useQueries';
import { ToolCategory } from '../backend';
import BrowseFiltersBar from '../components/listings/BrowseFiltersBar';
import ListingsGrid from '../components/listings/ListingsGrid';
import ProfileSetupDialog from '../components/profile/ProfileSetupDialog';
import PageShell from '../components/layout/PageShell';
import PageHeader from '../components/layout/PageHeader';
import LoadingState from '../components/states/LoadingState';

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
      <PageShell>
        <PageHeader
          title="Browse Tools"
          subtitle="Find the perfect tool for your next project"
        />

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
          <LoadingState />
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </PageShell>
    </>
  );
}
