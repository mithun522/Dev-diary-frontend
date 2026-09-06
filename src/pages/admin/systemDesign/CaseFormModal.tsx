import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { logger } from "../../../utils/logger";
import { useCreateCase, useUpdateCase } from "../../../api/hooks/useAdminSystemDesign";
import type { SystemDesignCaseRecord } from "../../../api/services/adminSystemDesign.service";

type CaseFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  caseData?: SystemDesignCaseRecord | null; // if provided → edit mode
};

type CaseFormValues = {
  title: string;
  summary: string;
  problem: string;
  techStack: string; // comma-separated, split into an array on submit
  diagram: string;
  requirements: string; // raw JSON text
  tradeoffs: string; // raw JSON text
  resources: string; // raw JSON text
};

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const emptyValues: CaseFormValues = {
  title: "",
  summary: "",
  problem: "",
  techStack: "",
  diagram: "",
  requirements: "",
  tradeoffs: "",
  resources: "",
};

const jsonFieldToText = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
};

const toFormValues = (caseData: SystemDesignCaseRecord): CaseFormValues => ({
  title: caseData.title ?? "",
  summary: caseData.summary ?? "",
  problem: caseData.problem ?? "",
  techStack: (caseData.techStack ?? []).join(", "),
  diagram: caseData.diagram ?? "",
  requirements: jsonFieldToText(caseData.requirements),
  tradeoffs: jsonFieldToText(caseData.tradeoffs),
  resources: jsonFieldToText(caseData.resources),
});

// Parses a raw JSON textarea's content, toasting and returning `ok: false` on invalid JSON so the
// caller can abort the submit without closing the modal.
const parseJsonField = (
  raw: string,
  label: string
): { ok: true; value: unknown } | { ok: false } => {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, value: undefined };
  try {
    return { ok: true, value: JSON.parse(trimmed) };
  } catch {
    toast.error(`${label} must be valid JSON`);
    return { ok: false };
  }
};

const CaseFormModal: React.FC<CaseFormModalProps> = ({ open, setOpen, caseData }) => {
  const [disabled, setDisabled] = useState(false);
  const createCaseMutation = useCreateCase();
  const updateCaseMutation = useUpdateCase();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CaseFormValues>({
    defaultValues: caseData ? toFormValues(caseData) : emptyValues,
  });

  useEffect(() => {
    reset(caseData ? toFormValues(caseData) : emptyValues);
  }, [open, caseData, reset]);

  const onSubmit = async (data: CaseFormValues) => {
    const requirements = parseJsonField(data.requirements, "Requirements");
    if (!requirements.ok) return;
    const tradeoffs = parseJsonField(data.tradeoffs, "Trade-offs");
    if (!tradeoffs.ok) return;
    const resources = parseJsonField(data.resources, "Resources");
    if (!resources.ok) return;

    const payload = {
      title: data.title,
      summary: data.summary || undefined,
      problem: data.problem || undefined,
      techStack: data.techStack
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      diagram: data.diagram || undefined,
      requirements: requirements.value,
      tradeoffs: tradeoffs.value,
      resources: resources.value,
    };

    setDisabled(true);
    try {
      if (caseData) {
        await updateCaseMutation.mutateAsync({ id: caseData.id, payload });
        toast.success("Case updated successfully");
      } else {
        await createCaseMutation.mutateAsync(payload);
        toast.success("Case created successfully");
      }
      setOpen(false);
      reset(emptyValues);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save case"));
      logger.error("Error submitting system design case:", error);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-lg max-h-[85vh] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]"
          data-cy="admin-sd-cases-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold" data-cy="admin-sd-cases-form-title">
              {caseData ? "Edit Case" : "Add Case"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X className="text-primary-background cursor-pointer" data-cy="admin-sd-cases-form-close" />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="title" isMandatory>
              Title
            </Label>
            <div>
              <Input
                id="title"
                placeholder="Case study title"
                {...register("title", { required: "Title is required" })}
                className={errors.title ? "border border-red-600" : ""}
                data-cy="admin-sd-cases-form-title-input"
              />
              {errors.title && (
                <p className="text-red-500 text-sm" data-cy="admin-sd-cases-form-title-error">
                  {errors.title.message}
                </p>
              )}
            </div>

            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              placeholder="Short summary..."
              {...register("summary")}
              data-cy="admin-sd-cases-form-summary"
            />

            <Label htmlFor="problem">Problem</Label>
            <Textarea
              id="problem"
              placeholder="Problem statement..."
              {...register("problem")}
              data-cy="admin-sd-cases-form-problem"
            />

            <Label htmlFor="techStack">Tech Stack</Label>
            <Input
              id="techStack"
              placeholder="e.g. Node.js, Redis, PostgreSQL"
              {...register("techStack")}
              data-cy="admin-sd-cases-form-tech-stack"
            />
            <p className="text-xs text-muted-foreground -mt-2">
              Comma-separated list of technologies.
            </p>

            <Label htmlFor="diagram">Diagram</Label>
            <Textarea
              id="diagram"
              placeholder="Architecture diagram (e.g. Mermaid source)..."
              className="min-h-[100px] font-mono text-xs"
              {...register("diagram")}
              data-cy="admin-sd-cases-form-diagram"
            />

            <Label htmlFor="requirements">Requirements (JSON)</Label>
            <Textarea
              id="requirements"
              placeholder='e.g. { "functional": [...], "nonFunctional": [...] }'
              className="min-h-[100px] font-mono text-xs"
              {...register("requirements")}
              data-cy="admin-sd-cases-form-requirements"
            />

            <Label htmlFor="tradeoffs">Trade-offs (JSON)</Label>
            <Textarea
              id="tradeoffs"
              placeholder='e.g. [{ "title": "...", "pros": [...], "cons": [...] }]'
              className="min-h-[100px] font-mono text-xs"
              {...register("tradeoffs")}
              data-cy="admin-sd-cases-form-tradeoffs"
            />

            <Label htmlFor="resources">Resources (JSON)</Label>
            <Textarea
              id="resources"
              placeholder='e.g. [{ "title": "...", "url": "..." }]'
              className="min-h-[100px] font-mono text-xs"
              {...register("resources")}
              data-cy="admin-sd-cases-form-resources"
            />

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button type="button" variant="danger" data-cy="admin-sd-cases-form-cancel">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={disabled}
                className="flex items-center justify-center gap-2 min-w-[70px]"
                data-cy="admin-sd-cases-form-save"
              >
                {disabled ? (
                  <>
                    <span
                      className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                      data-cy="admin-sd-cases-form-save-spinner"
                    />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CaseFormModal;
