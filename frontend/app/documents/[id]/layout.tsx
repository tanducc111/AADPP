import type { ReactNode } from "react";

type DocumentLayoutProps = {
  children: ReactNode;
};

export default function DocumentLayout({ children }: DocumentLayoutProps) {
  return children;
}
