import { UserRole, UserStatus, type AdminUser } from "@appTypes/User";
import { CampaignRoles } from "@appTypes/Campaign";

export const STATUS_META: Record<UserStatus, { label: string; color: string }> = {
  [UserStatus.Active]: { label: "Active", color: "neon" },
  [UserStatus.Inactive]: { label: "Deactivated", color: "yellow" },
  [UserStatus.Banned]: { label: "Banned", color: "red" },
  [UserStatus.LogicDeleted]: { label: "Deleted", color: "gray" },
};

export const isSuperAdmin = (u: AdminUser) => u.roles.includes(UserRole.Admin);
export const dmCampaigns = (u: AdminUser) => u.campaigns.filter((c) => c.roles.includes(CampaignRoles.Dm));

/** The user's global roles with superadmin switched on or off; other roles stay as they are. */
export const withSuperAdmin = (u: AdminUser, on: boolean) =>
  on ? [...new Set([...u.roles, UserRole.Admin])] : u.roles.filter((r) => r !== UserRole.Admin);

export type RoleFilter = "all" | "superadmin" | "dm" | "player" | "none";

export const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Any role" },
  { value: "superadmin", label: "Superadmins" },
  { value: "dm", label: "Dungeon masters" },
  { value: "player", label: "Players only" },
  { value: "none", label: "In no campaign" },
];

export const matchesRole = (u: AdminUser, filter: RoleFilter) => {
  switch (filter) {
    case "superadmin":
      return isSuperAdmin(u);
    case "dm":
      return dmCampaigns(u).length > 0;
    case "player":
      return u.campaigns.length > 0 && dmCampaigns(u).length === 0;
    case "none":
      return u.campaigns.length === 0;
    default:
      return true;
  }
};

const WEEK_MS = 7 * 86_400_000;
export const seenThisWeek = (u: AdminUser) => !!u.lastLogin && Date.now() - Date.parse(u.lastLogin) < WEEK_MS;

/** 14 random characters, no look-alikes (0/O, 1/l/I), from the browser's CSPRNG. */
export function generatePassword(length = 14) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
