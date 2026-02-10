import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ToolListing, RentalRequest, ToolCategory, ToolCondition, RentalStatus, ChatMessage, GeoCoordinates, CommunityMapProfile } from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userPrincipal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      const { Principal } = await import('@dfinity/principal');
      try {
        return await actor.getUserProfile(Principal.fromText(userPrincipal));
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
    retry: false,
  });
}

export function useCreateOrUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      displayName, 
      contactInfo, 
      location, 
      profilePicture,
      coordinates,
      streetAddress
    }: { 
      displayName: string; 
      contactInfo?: string; 
      location?: string; 
      profilePicture?: string;
      coordinates?: GeoCoordinates;
      streetAddress?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateProfile(
        displayName, 
        contactInfo || null,
        location || '',
        profilePicture || '',
        coordinates || null,
        streetAddress || null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['communityMapProfiles'] });
    },
  });
}

export function useGetCommunityMapProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<CommunityMapProfile[]>({
    queryKey: ['communityMapProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCommunityMapProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

// Tool Listing Queries
export function useGetTool(toolId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ToolListing | null>({
    queryKey: ['tool', toolId?.toString()],
    queryFn: async () => {
      if (!actor || !toolId) return null;
      return actor.getTool(toolId);
    },
    enabled: !!actor && !isFetching && !!toolId,
  });
}

export function useGetToolsByOwner(ownerPrincipal: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ToolListing[]>({
    queryKey: ['toolsByOwner', ownerPrincipal],
    queryFn: async () => {
      if (!actor || !ownerPrincipal) return [];
      const { Principal } = await import('@dfinity/principal');
      return actor.getToolsByOwner(Principal.fromText(ownerPrincipal));
    },
    enabled: !!actor && !isFetching && !!ownerPrincipal,
  });
}

export function useSearchTools(params: {
  searchText?: string;
  category?: ToolCategory;
  minPrice?: number;
  maxPrice?: number;
  availableOnly: boolean;
  sortBy: string;
}) {
  const { actor, isFetching } = useActor();

  return useQuery<ToolListing[]>({
    queryKey: ['searchTools', params],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchTools(
        params.searchText || null,
        params.category || null,
        params.minPrice !== undefined ? BigInt(params.minPrice) : null,
        params.maxPrice !== undefined ? BigInt(params.maxPrice) : null,
        params.availableOnly,
        params.sortBy
      );
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddToolListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      category: ToolCategory;
      description: string;
      condition: ToolCondition;
      dailyPrice: number;
      securityDeposit?: number;
      location: string;
      photos: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addToolListing(
        data.title,
        data.category,
        data.description,
        data.condition,
        BigInt(data.dailyPrice),
        data.securityDeposit !== undefined ? BigInt(data.securityDeposit) : null,
        data.location,
        data.photos
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toolsByOwner'] });
      queryClient.invalidateQueries({ queryKey: ['searchTools'] });
    },
  });
}

export function useEditToolListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      toolId: bigint;
      title: string;
      category: ToolCategory;
      description: string;
      condition: ToolCondition;
      dailyPrice: number;
      securityDeposit?: number;
      location: string;
      available: boolean;
      photos: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editToolListing(
        data.toolId,
        data.title,
        data.category,
        data.description,
        data.condition,
        BigInt(data.dailyPrice),
        data.securityDeposit !== undefined ? BigInt(data.securityDeposit) : null,
        data.location,
        data.available,
        data.photos
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tool', variables.toolId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['toolsByOwner'] });
      queryClient.invalidateQueries({ queryKey: ['searchTools'] });
    },
  });
}

export function useGetToolAvailability(toolId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['toolAvailability', toolId?.toString()],
    queryFn: async () => {
      if (!actor || !toolId) return false;
      return actor.getToolAvailability(toolId);
    },
    enabled: !!actor && !isFetching && !!toolId,
  });
}

// Rental Queries
export function useRequestRental() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { toolId: bigint; startDate: Date; endDate: Date }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestRental(
        data.toolId,
        BigInt(data.startDate.getTime() * 1_000_000),
        BigInt(data.endDate.getTime() * 1_000_000)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentalsForUser'] });
      queryClient.invalidateQueries({ queryKey: ['toolAvailability'] });
    },
  });
}

export function useUpdateRentalStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rentalId: bigint; newStatus: RentalStatus; comments?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateRentalStatus(data.rentalId, data.newStatus, data.comments || null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentalsForUser'] });
      queryClient.invalidateQueries({ queryKey: ['toolAvailability'] });
      queryClient.invalidateQueries({ queryKey: ['searchTools'] });
    },
  });
}

export function useGetRentalsForUser() {
  const { actor, isFetching } = useActor();

  return useQuery<{ owned: RentalRequest[]; rented: RentalRequest[] }>({
    queryKey: ['rentalsForUser'],
    queryFn: async () => {
      if (!actor) return { owned: [], rented: [] };
      return actor.getRentalsForUser();
    },
    enabled: !!actor && !isFetching,
  });
}

// Rental Chat Queries
export function useGetRentalMessages(rentalId: bigint | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<ChatMessage[]>({
    queryKey: ['rentalMessages', rentalId?.toString()],
    queryFn: async () => {
      if (!actor || !rentalId) return [];
      return actor.getRentalMessages(rentalId);
    },
    enabled: !!actor && !isFetching && !!rentalId,
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

export function useSendRentalMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rentalId: bigint; message: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.sendRentalMessage(data.rentalId, data.message);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rentalMessages', variables.rentalId.toString()] });
    },
  });
}
