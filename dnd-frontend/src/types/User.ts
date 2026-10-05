export interface User {
  id: string
  username: string
  passwordHash: string
  email?: string
  roles: UserRole[]
  profilePictureUrl?: string
  dateCreated: string
  lastLogin?: string
  characterIds?: string[]
  campaignIds?: string[]
  isActive: UserStatus
  settings?: Record<string, string>
  createdAt?: string
  updatedAt?: string
  isDeleted: boolean
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