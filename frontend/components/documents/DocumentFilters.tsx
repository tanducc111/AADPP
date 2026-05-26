"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DOCUMENT_STATUS_OPTIONS, DOCUMENT_TYPE_OPTIONS } from "@/constants/documents";
import type { ClientCompany } from "@/types/clientCompanies";
import type { DocumentListQuery, DocumentStatus, DocumentType } from "@/types/documents";

type DocumentFiltersProps = {
  activeClientCompanies: ClientCompany[];
  documentQuery: DocumentListQuery;
  isLoading: boolean;
  onQueryChange: (documentQuery: Partial<DocumentListQuery>) => void;
};

export function DocumentFilters({
  activeClientCompanies,
  documentQuery,
  isLoading,
  onQueryChange,
}: DocumentFiltersProps) {
  const [documentSearchQuery, setDocumentSearchQuery] = useState(documentQuery.search ?? "");

  function applySearch() {
    onQueryChange({ search: documentSearchQuery, page: 1 });
  }

  return (
    <div className="grid gap-2 xl:grid-cols-[minmax(220px,1.4fr)_minmax(180px,1fr)_170px_150px_145px_145px_120px]">
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3">
        <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <input
          className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
          onChange={(event) => setDocumentSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              applySearch();
            }
          }}
          placeholder="Search documents"
          value={documentSearchQuery}
        />
      </div>

      <select
        className={selectClassName}
        disabled={isLoading}
        onChange={(event) =>
          onQueryChange({
            clientCompanyId: event.target.value || undefined,
            page: 1,
          })
        }
        value={documentQuery.clientCompanyId ?? ""}
      >
        <option value="">All companies</option>
        {activeClientCompanies.map((clientCompany) => (
          <option key={clientCompany.id} value={clientCompany.id}>
            {clientCompany.companyName}
          </option>
        ))}
      </select>

      <select
        className={selectClassName}
        disabled={isLoading}
        onChange={(event) =>
          onQueryChange({
            documentType: (event.target.value || undefined) as DocumentType | undefined,
            page: 1,
          })
        }
        value={documentQuery.documentType ?? ""}
      >
        <option value="">All types</option>
        {DOCUMENT_TYPE_OPTIONS.map((documentTypeOption) => (
          <option key={documentTypeOption.value} value={documentTypeOption.value}>
            {documentTypeOption.label}
          </option>
        ))}
      </select>

      <select
        className={selectClassName}
        disabled={isLoading}
        onChange={(event) =>
          onQueryChange({
            status: (event.target.value || undefined) as DocumentStatus | undefined,
            page: 1,
          })
        }
        value={documentQuery.status ?? ""}
      >
        <option value="">All statuses</option>
        {DOCUMENT_STATUS_OPTIONS.map((documentStatusOption) => (
          <option key={documentStatusOption.value} value={documentStatusOption.value}>
            {documentStatusOption.label}
          </option>
        ))}
      </select>

      <input
        className={selectClassName}
        disabled={isLoading}
        onChange={(event) =>
          onQueryChange({
            uploadedFrom: event.target.value || undefined,
            page: 1,
          })
        }
        type="date"
        value={documentQuery.uploadedFrom ?? ""}
      />

      <input
        className={selectClassName}
        disabled={isLoading}
        onChange={(event) =>
          onQueryChange({
            uploadedTo: event.target.value || undefined,
            page: 1,
          })
        }
        type="date"
        value={documentQuery.uploadedTo ?? ""}
      />

      <Button disabled={isLoading} onClick={applySearch} type="button" variant="outline">
        Search
      </Button>
    </div>
  );
}

const selectClassName =
  "h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/20";
