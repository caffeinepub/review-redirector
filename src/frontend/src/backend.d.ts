import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGoogleMapsUrl(): Promise<string>;
    getReviews(): Promise<Array<string>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    resetGoogleMapsUrl(): Promise<void>;
    resetReviews(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateGoogleMapsUrl(newUrl: string): Promise<void>;
    updateReviews(newReviews: Array<string>): Promise<void>;
}
