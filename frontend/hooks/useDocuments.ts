"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getDocuments } from "@/services/documentService";
import type { DocumentListItem, DocumentListQuery } from "@/types/documents";
import { getErrorMessage } from "@/utils/getErrorMessage";

const DEFAULT_DOCUMENT_QUERY: DocumentListQuery = {
  page: 1,
  pageSize: 10,
  sortBy: "uploaded_at",
  sortOrder: "desc",
};

export function useDocuments(initialDocumentQuery?: Partial<DocumentListQuery>) {
  const [documentQuery, setDocumentQuery] = useState<DocumentListQuery>({
    ...DEFAULT_DOCUMENT_QUERY,
    ...initialDocumentQuery,
  });
  const [documents, setDocuments] = useState<DocumentListItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentErrorMessage, setDocumentErrorMessage] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const queryKey = useMemo(() => JSON.stringify(documentQuery), [documentQuery]);

  useEffect(() => {
    let shouldUpdateState = true;

    async function loadDocuments() {
      await Promise.resolve();
      setIsLoadingDocuments(true);
      setDocumentErrorMessage(null);

      try {
        const documentList = await getDocuments(documentQuery);

        if (shouldUpdateState) {
          setDocuments(documentList.records);
          setTotalRecords(documentList.total);
          setTotalPages(documentList.totalPages);
        }
      } catch (error) {
        if (shouldUpdateState) {
          setDocumentErrorMessage(getErrorMessage(error, "Unable to load documents."));
        }
      } finally {
        if (shouldUpdateState) {
          setIsLoadingDocuments(false);
        }
      }
    }

    void loadDocuments();

    return () => {
      shouldUpdateState = false;
    };
  }, [documentQuery, queryKey, refreshCounter]);

  const updateDocumentQuery = useCallback((nextDocumentQuery: Partial<DocumentListQuery>) => {
    setDocumentQuery((currentDocumentQuery) => ({
      ...currentDocumentQuery,
      ...nextDocumentQuery,
    }));
  }, []);

  const refreshDocuments = useCallback(() => {
    setRefreshCounter((currentRefreshCounter) => currentRefreshCounter + 1);
  }, []);

  return {
    documentErrorMessage,
    documentQuery,
    documents,
    isLoadingDocuments,
    refreshDocuments,
    totalPages,
    totalRecords,
    updateDocumentQuery,
  };
}
