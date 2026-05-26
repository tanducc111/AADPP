"use client";

import { FileUp, Loader2, UploadCloud, X } from "lucide-react";
import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_DOCUMENT_MIME_TYPES,
  DOCUMENT_TYPE_OPTIONS,
  MAX_DOCUMENT_UPLOAD_SIZE_BYTES,
} from "@/constants/documents";
import { cn } from "@/lib/cn";
import type { ClientCompany } from "@/types/clientCompanies";
import type { DocumentType, DocumentUploadPayload } from "@/types/documents";
import { formatFileSize } from "@/utils/formatFileSize";

type DocumentUploadFormProps = {
  activeClientCompanies: ClientCompany[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (documentUploadPayload: DocumentUploadPayload) => Promise<void>;
};

export function DocumentUploadForm({
  activeClientCompanies,
  isSubmitting,
  onCancel,
  onSubmit,
}: DocumentUploadFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientCompanyId, setClientCompanyId] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("VAT_INVOICE");
  const [documentCategory, setDocumentCategory] = useState("");
  const [note, setNote] = useState("");
  const [fileErrorMessage, setFileErrorMessage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const selectedFileExtension = useMemo(
    () => selectedFile?.name.slice(selectedFile.name.lastIndexOf(".")).toLowerCase() ?? "",
    [selectedFile],
  );

  function handleFileSelection(file: File | undefined) {
    setFileErrorMessage(null);

    if (!file) {
      return;
    }

    const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(fileExtension as typeof ALLOWED_DOCUMENT_EXTENSIONS[number])) {
      setSelectedFile(null);
      setFileErrorMessage("Only PDF, JPG, JPEG, and PNG files are supported.");
      return;
    }

    if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type as typeof ALLOWED_DOCUMENT_MIME_TYPES[number])) {
      setSelectedFile(null);
      setFileErrorMessage("The selected file type is not supported.");
      return;
    }

    if (file.size > MAX_DOCUMENT_UPLOAD_SIZE_BYTES) {
      setSelectedFile(null);
      setFileErrorMessage("The selected file is larger than 10 MB.");
      return;
    }

    setSelectedFile(file);
  }

  async function handleSubmit() {
    if (!selectedFile) {
      setFileErrorMessage("Select a document before uploading.");
      return;
    }

    if (!clientCompanyId) {
      setFileErrorMessage("Select a client company before uploading.");
      return;
    }

    await onSubmit({
      file: selectedFile,
      clientCompanyId,
      documentType,
      documentCategory,
      note,
    });
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFile(false);
    handleFileSelection(event.dataTransfer.files[0]);
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFileSelection(event.target.files?.[0]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="clientCompanyId">
            Client company
          </label>
          <select
            className={inputClassName}
            id="clientCompanyId"
            onChange={(event) => setClientCompanyId(event.target.value)}
            value={clientCompanyId}
          >
            <option value="">Select client company</option>
            {activeClientCompanies.map((clientCompany) => (
              <option key={clientCompany.id} value={clientCompany.id}>
                {clientCompany.companyName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="documentType">
              Document type
            </label>
            <select
              className={inputClassName}
              id="documentType"
              onChange={(event) => setDocumentType(event.target.value as DocumentType)}
              value={documentType}
            >
              {DOCUMENT_TYPE_OPTIONS.map((documentTypeOption) => (
                <option key={documentTypeOption.value} value={documentTypeOption.value}>
                  {documentTypeOption.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="documentCategory">
              Document category
            </label>
            <input
              className={inputClassName}
              id="documentCategory"
              onChange={(event) => setDocumentCategory(event.target.value)}
              placeholder="Monthly, supplier, internal"
              value={documentCategory}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground" htmlFor="note">
            Note
          </label>
          <textarea
            className="input-surface mt-2 min-h-28 w-full rounded-md px-3 py-2 text-sm text-foreground outline-none"
            id="note"
            onChange={(event) => setNote(event.target.value)}
            value={note}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div
          className={cn(
            "flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-primary/20 bg-gradient-to-br from-white via-white to-blue-50/70 p-6 text-center shadow-sm transition-all duration-200",
            isDraggingFile ? "scale-[1.01] border-primary bg-primary/5 shadow-lg shadow-blue-500/10" : "",
          )}
          onClick={() => fileInputRef.current?.click()}
          onDragLeave={() => setIsDraggingFile(false)}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDraggingFile(true);
          }}
          onDrop={handleDrop}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <input
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="hidden"
            onChange={handleFileInputChange}
            ref={fileInputRef}
            type="file"
          />
          <span className="gradient-primary rounded-md p-3 text-primary-foreground shadow-lg shadow-blue-500/20">
            <UploadCloud className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">Drop document here</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            PDF, JPG, JPEG, or PNG up to 10 MB.
          </p>
          <Button className="mt-4" type="button" variant="outline">
            Choose File
          </Button>
        </div>

        {selectedFile ? (
          <div className="premium-card flex items-center justify-between gap-3 rounded-lg p-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="rounded-md bg-muted p-2 text-primary">
                <FileUp className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedFileExtension.toUpperCase()} - {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              aria-label="Remove selected file"
              onClick={() => setSelectedFile(null)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : null}

        {fileErrorMessage ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {fileErrorMessage}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={isSubmitting} onClick={handleSubmit} type="button">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Upload Document
          </Button>
        </div>
      </div>
    </div>
  );
}

const inputClassName =
  "input-surface mt-2 h-10 w-full rounded-md px-3 text-sm text-foreground outline-none";
