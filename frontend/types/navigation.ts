import type { LucideIcon } from "lucide-react";

import type { UserRole } from "@/types/auth";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  allowedRoles?: UserRole[];
};
