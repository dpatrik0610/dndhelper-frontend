import { IconCloudDownload, IconUsers, IconWorld } from "@tabler/icons-react";
import { AdminShell, type AdminSectionDef } from "./components/AdminShell";
import { UserManager } from "./UserManager/UserManager";
import { AllCampaigns } from "./AllCampaigns/AllCampaigns";
import { BackupManager } from "./BackupManager/BackupManager";

const sections: AdminSectionDef[] = [
  { path: "users", label: "Users", icon: IconUsers, component: UserManager },
  { path: "campaigns", label: "All Campaigns", icon: IconWorld, component: AllCampaigns },
  { path: "backups", label: "Backups", icon: IconCloudDownload, component: BackupManager },
];

/** Site-wide tools, superadmin only (the route itself is gated in App). Needs no current campaign. */
export function SuperAdminConsole() {
  return <AdminShell title="Site Admin" basePath="/admin" sections={sections} />;
}
