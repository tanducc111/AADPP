import { Badge } from "@/components/ui/badge";

type ClientCompanyStatusBadgeProps = {
  isActive: boolean;
};

export function ClientCompanyStatusBadge({ isActive }: ClientCompanyStatusBadgeProps) {
  return (
    <Badge
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600"
      }
      variant="outline"
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
