"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getAdminUsers } from "@/services/adminUserService";
import type { AdminUser, AdminUserListQuery } from "@/types/adminUsers";
import { getErrorMessage } from "@/utils/getErrorMessage";

const DEFAULT_ADMIN_USER_QUERY: AdminUserListQuery = {
  page: 1,
  pageSize: 10,
  sortBy: "created_at",
  sortOrder: "desc",
};

export function useAdminUsers(initialAdminUserQuery?: Partial<AdminUserListQuery>) {
  const [adminUserQuery, setAdminUserQuery] = useState<AdminUserListQuery>({
    ...DEFAULT_ADMIN_USER_QUERY,
    ...initialAdminUserQuery,
  });
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userErrorMessage, setUserErrorMessage] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const queryKey = useMemo(() => JSON.stringify(adminUserQuery), [adminUserQuery]);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadAdminUsers() {
      setIsLoadingUsers(true);
      setUserErrorMessage(null);

      try {
        const adminUserList = await getAdminUsers(adminUserQuery);

        if (shouldUpdateState) {
          setAdminUsers(adminUserList.records);
          setTotalRecords(adminUserList.total);
          setTotalPages(adminUserList.totalPages);
        }
      } catch (error) {
        if (shouldUpdateState) {
          setUserErrorMessage(getErrorMessage(error, "Unable to load users."));
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoadingUsers(false);
        }
      }
    }

    void loadAdminUsers();

    return () => {
      shouldUpdateState = false;
    };
  }, [adminUserQuery, queryKey, refreshCounter]);

  const updateAdminUserQuery = useCallback((nextAdminUserQuery: Partial<AdminUserListQuery>) => {
    setAdminUserQuery((currentAdminUserQuery) => ({
      ...currentAdminUserQuery,
      ...nextAdminUserQuery,
    }));
  }, []);

  const refreshAdminUsers = useCallback(() => {
    setRefreshCounter((currentRefreshCounter) => currentRefreshCounter + 1);
  }, []);

  return {
    adminUserQuery,
    adminUsers,
    isLoadingUsers,
    refreshAdminUsers,
    totalPages,
    totalRecords,
    updateAdminUserQuery,
    userErrorMessage,
  };
}
