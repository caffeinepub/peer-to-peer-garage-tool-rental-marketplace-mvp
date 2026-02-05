import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ToolListing {
    id: bigint;
    title: string;
    created: Time;
    owner: Principal;
    description: string;
    available: boolean;
    category: ToolCategory;
    dailyPrice: bigint;
    securityDeposit?: bigint;
    location: string;
    photos: Array<string>;
    condition: ToolCondition;
}
export type Time = bigint;
export interface RentalRequest {
    id: bigint;
    renter: Principal;
    status: RentalStatus;
    created: Time;
    endDate: Time;
    owner: Principal;
    lastUpdated: Time;
    toolId: bigint;
    startDate: Time;
}
export interface UserProfile {
    id: Principal;
    contactInfo?: string;
    displayName: string;
}
export enum RentalStatus {
    requested = "requested",
    completed = "completed",
    approved = "approved",
    declined = "declined",
    cancelledByRenter = "cancelledByRenter",
    cancelledByOwner = "cancelledByOwner"
}
export enum ToolCategory {
    automotive = "automotive",
    gardenTools = "gardenTools",
    specialty = "specialty",
    powerTools = "powerTools",
    handTools = "handTools"
}
export enum ToolCondition {
    new_ = "new",
    gentlyUsed = "gentlyUsed",
    wellUsed = "wellUsed",
    needsRepair = "needsRepair"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addToolListing(title: string, category: ToolCategory, description: string, condition: ToolCondition, dailyPrice: bigint, securityDeposit: bigint | null, location: string, photos: Array<string>): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(displayName: string, contactInfo: string | null): Promise<void>;
    editToolListing(toolId: bigint, title: string, category: ToolCategory, description: string, condition: ToolCondition, dailyPrice: bigint, securityDeposit: bigint | null, location: string, available: boolean, photos: Array<string>): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRentalsForUser(): Promise<{
        rented: Array<RentalRequest>;
        owned: Array<RentalRequest>;
    }>;
    getTool(toolId: bigint): Promise<ToolListing | null>;
    getToolAvailability(toolId: bigint): Promise<boolean>;
    getToolsByOwner(owner: Principal): Promise<Array<ToolListing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    requestRental(toolId: bigint, startDate: Time, endDate: Time): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchTools(searchText: string | null, category: ToolCategory | null, minPrice: bigint | null, maxPrice: bigint | null, availableOnly: boolean, sortBy: string): Promise<Array<ToolListing>>;
    updateRentalStatus(rentalId: bigint, newStatus: RentalStatus, _comments: string | null): Promise<void>;
}
