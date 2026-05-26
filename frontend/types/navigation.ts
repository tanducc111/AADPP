import type { LucideIcon } from "lucide-react";

import type { TranslationKey } from "@/constants/i18n";
import type { UserRole } from "@/types/auth";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  allowedRoles?: UserRole[];
  translationKey?: TranslationKey;
};
