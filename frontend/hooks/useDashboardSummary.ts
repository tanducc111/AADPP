"use client";

import { useCallback, useEffect, useState } from "react";

import { getDashboardSummary } from "@/services/dashboardService";
import type { DashboardSummary } from "@/types/dashboard";
import { getErrorMessage } from "@/utils/getErrorMessage";

export function useDashboardSummary() {
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [summaryErrorMessage, setSummaryErrorMessage] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadDashboardSummary() {
      setIsLoadingSummary(true);
      setSummaryErrorMessage(null);

      try {
        const loadedDashboardSummary = await getDashboardSummary();

        if (shouldUpdateState) {
          setDashboardSummary(loadedDashboardSummary);
        }
      } catch (error) {
        if (shouldUpdateState) {
          setSummaryErrorMessage(getErrorMessage(error, "Unable to load dashboard summary."));
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoadingSummary(false);
        }
      }
    }

    void loadDashboardSummary();

    return () => {
      shouldUpdateState = false;
    };
  }, [refreshCounter]);

  const refreshDashboardSummary = useCallback(() => {
    setRefreshCounter((currentRefreshCounter) => currentRefreshCounter + 1);
  }, []);

  return {
    dashboardSummary,
    isLoadingSummary,
    refreshDashboardSummary,
    summaryErrorMessage,
  };
}
