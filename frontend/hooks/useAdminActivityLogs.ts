"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getAdminActivityLogs } from "@/services/adminLogService";
import type { ActivityLog, AdminActivityLogQuery } from "@/types/dashboard";
import { getErrorMessage } from "@/utils/getErrorMessage";

const DEFAULT_ADMIN_ACTIVITY_LOG_QUERY: AdminActivityLogQuery = {
  page: 1,
  pageSize: 10,
  sortBy: "created_at",
  sortOrder: "desc",
};

export function useAdminActivityLogs(
  initialActivityLogQuery?: Partial<AdminActivityLogQuery>,
) {
  const [activityLogQuery, setActivityLogQuery] = useState<AdminActivityLogQuery>({
    ...DEFAULT_ADMIN_ACTIVITY_LOG_QUERY,
    ...initialActivityLogQuery,
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingActivityLogs, setIsLoadingActivityLogs] = useState(true);
  const [activityLogErrorMessage, setActivityLogErrorMessage] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const queryKey = useMemo(() => JSON.stringify(activityLogQuery), [activityLogQuery]);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadAdminActivityLogs() {
      setIsLoadingActivityLogs(true);
      setActivityLogErrorMessage(null);

      try {
        const activityLogList = await getAdminActivityLogs(activityLogQuery);

        if (shouldUpdateState) {
          setActivityLogs(activityLogList.records);
          setTotalRecords(activityLogList.total);
          setTotalPages(activityLogList.totalPages);
        }
      } catch (error) {
        if (shouldUpdateState) {
          setActivityLogErrorMessage(getErrorMessage(error, "Unable to load activity logs."));
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoadingActivityLogs(false);
        }
      }
    }

    void loadAdminActivityLogs();

    return () => {
      shouldUpdateState = false;
    };
  }, [activityLogQuery, queryKey, refreshCounter]);

  const updateActivityLogQuery = useCallback(
    (nextActivityLogQuery: Partial<AdminActivityLogQuery>) => {
      setActivityLogQuery((currentActivityLogQuery) => ({
        ...currentActivityLogQuery,
        ...nextActivityLogQuery,
      }));
    },
    [],
  );

  const refreshActivityLogs = useCallback(() => {
    setRefreshCounter((currentRefreshCounter) => currentRefreshCounter + 1);
  }, []);

  return {
    activityLogErrorMessage,
    activityLogQuery,
    activityLogs,
    isLoadingActivityLogs,
    refreshActivityLogs,
    totalPages,
    totalRecords,
    updateActivityLogQuery,
  };
}
