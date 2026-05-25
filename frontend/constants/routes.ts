import { Activity, Building2, FileText, LayoutDashboard, Settings, ShieldCheck, Users } from "lucide-react";

import type { NavigationItem } from "@/types/navigation";

export const ROUTES = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  documents: "/documents",
  clientCompanies: "/clients",
  users: "/users",
  activityLogs: "/activity-logs",
  admin: "/admin",
  settings: "/settings",
} as const;

export const DASHBOARD_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    label: "Documents",
    href: ROUTES.documents,
    icon: FileText,
  },
  {
    label: "Client Companies",
    href: ROUTES.clientCompanies,
    icon: Building2,
  },
  {
    label: "Users",
    href: ROUTES.users,
    icon: Users,
  },
  {
    label: "Admin",
    href: ROUTES.admin,
    icon: ShieldCheck,
  },
  {
    label: "Activity Logs",
    href: ROUTES.activityLogs,
    icon: Activity,
  },
  {
    label: "Settings",
    href: ROUTES.settings,
    icon: Settings,
  },
];
