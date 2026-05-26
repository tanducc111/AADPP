"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getDocumentsByStatus,
  getDocumentsByType,
  getRecentActivities,
  getTopClientCompanies,
  getUploadsOverTime,
} from "@/services/dashboardService";
import type {
  ActivityLog,
  DocumentStatusAnalytics,
  DocumentTypeAnalytics,
  TopClientCompany,
  UploadsOverTime,
  UploadsOverTimeQuery,
} from "@/types/dashboard";
import { getErrorMessage } from "@/utils/getErrorMessage";

const DEFAULT_UPLOADS_QUERY: UploadsOverTimeQuery = {
  groupBy: "day",
};

export function useDashboardAnalytics(uploadsOverTimeQuery = DEFAULT_UPLOADS_QUERY) {
  const [documentsByType, setDocumentsByType] = useState<DocumentTypeAnalytics[]>([]);
  const [documentsByStatus, setDocumentsByStatus] = useState<DocumentStatusAnalytics[]>([]);
  const [uploadsOverTime, setUploadsOverTime] = useState<UploadsOverTime[]>([]);
  const [topClientCompanies, setTopClientCompanies] = useState<TopClientCompany[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);
  const [analyticsErrorMessage, setAnalyticsErrorMessage] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadDashboardAnalytics() {
      setIsLoadingAnalytics(true);
      setAnalyticsErrorMessage(null);

      try {
        const [
          loadedDocumentsByType,
          loadedDocumentsByStatus,
          loadedUploadsOverTime,
          loadedTopClientCompanies,
          loadedRecentActivities,
        ] = await Promise.all([
          getDocumentsByType(),
          getDocumentsByStatus(),
          getUploadsOverTime(uploadsOverTimeQuery),
          getTopClientCompanies(),
          getRecentActivities(10),
        ]);

        if (shouldUpdateState) {
          setDocumentsByType(loadedDocumentsByType);
          setDocumentsByStatus(loadedDocumentsByStatus);
          setUploadsOverTime(loadedUploadsOverTime);
          setTopClientCompanies(loadedTopClientCompanies);
          setRecentActivities(loadedRecentActivities);
        }
      } catch (error) {
        if (shouldUpdateState) {
          setAnalyticsErrorMessage(getErrorMessage(error, "Unable to load dashboard analytics."));
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoadingAnalytics(false);
        }
      }
    }

    void loadDashboardAnalytics();

    return () => {
      shouldUpdateState = false;
    };
  }, [refreshCounter, uploadsOverTimeQuery]);

  const refreshDashboardAnalytics = useCallback(() => {
    setRefreshCounter((currentRefreshCounter) => currentRefreshCounter + 1);
  }, []);

  return {
    analyticsErrorMessage,
    documentsByStatus,
    documentsByType,
    isLoadingAnalytics,
    recentActivities,
    refreshDashboardAnalytics,
    topClientCompanies,
    uploadsOverTime,
  };
}
