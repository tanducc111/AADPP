import {
  Activity,
  Building2,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  UploadCloud,
  Users,
} from "lucide-react";

import type { NavigationItem } from "@/types/navigation";

export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  documents: "/documents",
  uploadDocument: "/documents/upload",
  clientCompanies: "/clients",
  admin: "/admin",
  adminUsers: "/admin/users",
  adminActivityLogs: "/admin/logs",
} as const;

export const DASHBOARD_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: "Client Companies",
    href: ROUTES.clientCompanies,
    icon: Building2,
  },
  {
    label: "Documents",
    href: ROUTES.documents,
    icon: FileText,
  },
  {
    label: "Upload Document",
    href: ROUTES.uploadDocument,
    icon: UploadCloud,
  },
  {
    label: "Admin",
    href: ROUTES.admin,
    icon: ShieldCheck,
    allowedRoles: ["ADMIN"],
  },
  {
    label: "Users",
    href: ROUTES.adminUsers,
    icon: Users,
    allowedRoles: ["ADMIN"],
  },
  {
    label: "Activity Logs",
    href: ROUTES.adminActivityLogs,
    icon: Activity,
    allowedRoles: ["ADMIN"],
  },
];
