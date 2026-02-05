import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import BrowseListingsPage from './pages/BrowseListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import ListingFormPage from './pages/ListingFormPage';
import MyToolsPage from './pages/MyToolsPage';
import RequestsPage from './pages/RequestsPage';
import MyRentalsPage from './pages/MyRentalsPage';
import RentalDetailPage from './pages/RentalDetailPage';

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
});

const browseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/browse',
  component: BrowseListingsPage,
});

const listingDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/listing/$listingId',
  component: ListingDetailPage,
});

const addListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-listing',
  component: () => <ListingFormPage mode="create" />,
});

const editListingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-listing/$listingId',
  component: () => <ListingFormPage mode="edit" />,
});

const myToolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tools',
  component: MyToolsPage,
});

const requestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/requests',
  component: RequestsPage,
});

const myRentalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-rentals',
  component: MyRentalsPage,
});

const rentalDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/rental/$rentalId',
  component: RentalDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  browseRoute,
  listingDetailRoute,
  addListingRoute,
  editListingRoute,
  myToolsRoute,
  requestsRoute,
  myRentalsRoute,
  rentalDetailRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
