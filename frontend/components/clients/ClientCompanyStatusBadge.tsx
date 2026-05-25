import { Badge } from "@/components/ui/badge";

type ClientCompanyStatusBadgeProps = {
  isActive: boolean;
};

export function ClientCompanyStatusBadge({ isActive }: ClientCompanyStatusBadgeProps) {
  return (
    <Badge
      className={
        isActive
          ? "border-transparent bg-accent text-accent-foreground"
          : "border-transparent bg-muted text-muted-foreground"
      }
      variant="outline"
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
