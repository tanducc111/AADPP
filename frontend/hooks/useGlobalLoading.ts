"use client";

import { useContext } from "react";

import { GlobalLoadingContext } from "@/components/providers/GlobalLoadingProvider";

export function useGlobalLoading() {
  const globalLoadingContext = useContext(GlobalLoadingContext);

  if (!globalLoadingContext) {
    throw new Error("useGlobalLoading must be used within GlobalLoadingProvider.");
  }

  return globalLoadingContext;
}
