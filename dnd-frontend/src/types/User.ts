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

export enum UserRole {
  User = "User",
  Guest = "Guest",
  Admin = "Admin",
  DungeonMaster = "DungeonMaster",
}

export enum UserStatus {
  Active = "Active",
  Inactive = "Inactive",
  Banned = "Banned",
  LogicDeleted = "LogicDeleted",
}