"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import type { ClientCompany, ClientCompanyFormValues } from "@/types/clientCompanies";
import { cn } from "@/lib/cn";

const clientCompanyFormSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required.").max(255),
  taxCode: z.string().trim().max(100),
  address: z.string().trim(),
  contactPerson: z.string().trim().max(255),
  phoneNumber: z.string().trim().max(50),
  email: z
    .string()
    .trim()
    .refine((emailValue) => emailValue === "" || z.email().safeParse(emailValue).success, {
      message: "Enter a valid email address.",
    }),
  description: z.string().trim(),
});

type ClientCompanyFormProps = {
  initialClientCompany?: ClientCompany;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (clientCompanyFormValues: ClientCompanyFormValues) => Promise<void>;
};

function getDefaultFormValues(initialClientCompany?: ClientCompany): ClientCompanyFormValues {
  return {
    companyName: initialClientCompany?.companyName ?? "",
    taxCode: initialClientCompany?.taxCode ?? "",
    address: initialClientCompany?.address ?? "",
    contactPerson: initialClientCompany?.contactPerson ?? "",
    phoneNumber: initialClientCompany?.phoneNumber ?? "",
    email: initialClientCompany?.email ?? "",
    description: initialClientCompany?.description ?? "",
  };
}

export function ClientCompanyForm({
  initialClientCompany,
  isSubmitting,
  submitLabel,
  onCancel,
  onSubmit,
}: ClientCompanyFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ClientCompanyFormValues>({
    resolver: zodResolver(clientCompanyFormSchema),
    defaultValues: getDefaultFormValues(initialClientCompany),
  });

  useEffect(() => {
    reset(getDefaultFormValues(initialClientCompany));
  }, [initialClientCompany, reset]);

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField errorMessage={errors.companyName?.message} label="Company Name">
          <input
            className={inputClassName}
            disabled={isSubmitting}
            {...register("companyName")}
          />
        </FormField>
        <FormField errorMessage={errors.taxCode?.message} label="Tax Code">
          <input className={inputClassName} disabled={isSubmitting} {...register("taxCode")} />
        </FormField>
        <FormField errorMessage={errors.contactPerson?.message} label="Contact Person">
          <input
            className={inputClassName}
            disabled={isSubmitting}
            {...register("contactPerson")}
          />
        </FormField>
        <FormField errorMessage={errors.phoneNumber?.message} label="Phone Number">
          <input
            className={inputClassName}
            disabled={isSubmitting}
            {...register("phoneNumber")}
          />
        </FormField>
        <FormField errorMessage={errors.email?.message} label="Email">
          <input className={inputClassName} disabled={isSubmitting} {...register("email")} />
        </FormField>
        <FormField errorMessage={errors.address?.message} label="Address">
          <input className={inputClassName} disabled={isSubmitting} {...register("address")} />
        </FormField>
      </div>
      <FormField errorMessage={errors.description?.message} label="Description">
        <textarea
          className={cn(inputClassName, "min-h-28 resize-y py-2")}
          disabled={isSubmitting}
          {...register("description")}
        />
      </FormField>
      <div className="flex justify-end gap-2 border-t border-border pt-5">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="outline">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

const inputClassName =
  "input-surface h-10 w-full rounded-md px-3 text-sm text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-60";

type FormFieldProps = {
  children: ReactNode;
  errorMessage?: string;
  label: string;
};

function FormField({ children, errorMessage, label }: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="mt-1 block">{children}</span>
      {errorMessage ? <span className="mt-1 block text-sm text-destructive">{errorMessage}</span> : null}
    </label>
  );
}
