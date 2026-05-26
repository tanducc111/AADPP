import Link from "next/link";

import { ROUTES } from "@/constants/routes";

type DocumentBreadcrumb = {
  label: string;
  href?: string;
};

type DocumentBreadcrumbsProps = {
  breadcrumbs: DocumentBreadcrumb[];
};

export function DocumentBreadcrumbs({ breadcrumbs }: DocumentBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
      <Link className="text-muted-foreground hover:text-foreground" href={ROUTES.dashboard}>
        Dashboard
      </Link>
      {breadcrumbs.map((breadcrumb) => (
        <span className="flex items-center gap-2" key={breadcrumb.label}>
          <span className="text-muted-foreground">/</span>
          {breadcrumb.href ? (
            <Link className="text-muted-foreground hover:text-foreground" href={breadcrumb.href}>
              {breadcrumb.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{breadcrumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
