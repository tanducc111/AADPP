"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getClientCompanies } from "@/services/clientCompanyService";
import type {
  ClientCompany,
  ClientCompanyListQuery,
  ClientCompanyListResponse,
} from "@/types/clientCompanies";

const DEFAULT_CLIENT_COMPANY_QUERY: ClientCompanyListQuery = {
  search: "",
  isActive: undefined,
  page: 1,
  pageSize: 10,
  sortBy: "company_name",
  sortOrder: "asc",
};

export function useClientCompanies() {
  const [clientCompanyQuery, setClientCompanyQuery] = useState<ClientCompanyListQuery>(
    DEFAULT_CLIENT_COMPANY_QUERY,
  );
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [isLoadingClientCompanies, setIsLoadingClientCompanies] = useState(true);
  const [clientCompanyErrorMessage, setClientCompanyErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadClientCompanies() {
      await Promise.resolve();

      if (!shouldUpdateState) {
        return;
      }

      setIsLoadingClientCompanies(true);
      setClientCompanyErrorMessage(null);

      try {
        const clientCompanyListResponse: ClientCompanyListResponse =
          await getClientCompanies(clientCompanyQuery);

        if (shouldUpdateState) {
          setClientCompanies(clientCompanyListResponse.records);
          setTotalRecords(clientCompanyListResponse.total);
          setTotalPages(clientCompanyListResponse.totalPages);
        }
      } catch {
        if (shouldUpdateState) {
          setClientCompanyErrorMessage("Unable to load client companies.");
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoadingClientCompanies(false);
        }
      }
    }

    void loadClientCompanies();

    return () => {
      shouldUpdateState = false;
    };
  }, [clientCompanyQuery, reloadCounter]);

  const updateClientCompanyQuery = useCallback(
    (nextQuery: Partial<ClientCompanyListQuery>) => {
      setClientCompanyQuery((currentClientCompanyQuery) => ({
        ...currentClientCompanyQuery,
        ...nextQuery,
        page: nextQuery.page ?? 1,
      }));
    },
    [],
  );

  const refreshClientCompanies = useCallback(() => {
    setReloadCounter((currentReloadCounter) => currentReloadCounter + 1);
  }, []);

  return useMemo(
    () => ({
      clientCompanies,
      clientCompanyQuery,
      totalRecords,
      totalPages,
      isLoadingClientCompanies,
      clientCompanyErrorMessage,
      refreshClientCompanies,
      updateClientCompanyQuery,
    }),
    [
      clientCompanies,
      clientCompanyErrorMessage,
      clientCompanyQuery,
      isLoadingClientCompanies,
      refreshClientCompanies,
      totalPages,
      totalRecords,
      updateClientCompanyQuery,
    ],
  );
}
