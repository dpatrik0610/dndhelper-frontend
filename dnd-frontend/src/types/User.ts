/** A user as the superadmin's user manager sees it (GET /api/user). No password hash. */
export interface AdminUser {
  id: string
  username: string
  email?: string
  roles: string[]
  status: UserStatus
  dateCreated: string
  lastLogin?: string | null
  characters: { id: string; name?: string; characterClass?: string; level?: number; campaignId?: string | null }[]
  campaigns: { id: string; name: string; roles: string[] }[]
}

/** Create (username + password required) or patch a user; only the sent fields change. A password resets it. */
export interface AdminUserRequest {
  username?: string
  password?: string
  email?: string
  roles?: string[]
  status?: UserStatus
}

/** Global roles. "Admin" is the superadmin; DMs and players are per campaign (Campaign.members). */
export enum UserRole {
  User = "User",
  Admin = "Admin",
}

export enum UserStatus {
  Active = "Active",
  Inactive = "Inactive",
  Banned = "Banned",
  LogicDeleted = "LogicDeleted",
}