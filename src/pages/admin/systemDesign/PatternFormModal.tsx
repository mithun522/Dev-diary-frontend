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
import {
  useCreatePattern,
  useUpdatePattern,
} from "../../../api/hooks/useAdminSystemDesign";
import type { ScalabilityPatternRecord } from "../../../api/services/adminSystemDesign.service";

type PatternFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  patternData?: ScalabilityPatternRecord | null; // if provided → edit mode
};

type PatternFormValues = {
  name: string;
  description: string;
  useCases: string; // comma-separated, split into an array on submit
  benefits: string; // comma-separated
  drawbacks: string; // comma-separated
};

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const emptyValues: PatternFormValues = {
  name: "",
  description: "",
  useCases: "",
  benefits: "",
  drawbacks: "",
};

const toFormValues = (patternData: ScalabilityPatternRecord): PatternFormValues => ({
  name: patternData.name ?? "",
  description: patternData.description ?? "",
  useCases: (patternData.useCases ?? []).join(", "),
  benefits: (patternData.benefits ?? []).join(", "),
  drawbacks: (patternData.drawbacks ?? []).join(", "),
});

const splitTagList = (raw: string): string[] =>
  raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const PatternFormModal: React.FC<PatternFormModalProps> = ({
  open,
  setOpen,
  patternData,
}) => {
  const [disabled, setDisabled] = useState(false);
  const createPatternMutation = useCreatePattern();
  const updatePatternMutation = useUpdatePattern();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatternFormValues>({
    defaultValues: patternData ? toFormValues(patternData) : emptyValues,
  });

  useEffect(() => {
    reset(patternData ? toFormValues(patternData) : emptyValues);
  }, [open, patternData, reset]);

  const onSubmit = async (data: PatternFormValues) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      useCases: splitTagList(data.useCases),
      benefits: splitTagList(data.benefits),
      drawbacks: splitTagList(data.drawbacks),
    };

    setDisabled(true);
    try {
      if (patternData) {
        await updatePatternMutation.mutateAsync({ id: patternData.id, payload });
        toast.success("Pattern updated successfully");
      } else {
        await createPatternMutation.mutateAsync(payload);
        toast.success("Pattern created successfully");
      }
      setOpen(false);
      reset(emptyValues);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save pattern"));
      logger.error("Error submitting scalability pattern:", error);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-md max-h-[85vh] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]"
          data-cy="admin-sd-patterns-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title
              className="text-lg font-semibold"
              data-cy="admin-sd-patterns-form-title"
            >
              {patternData ? "Edit Pattern" : "Add Pattern"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X
                className="text-primary-background cursor-pointer"
                data-cy="admin-sd-patterns-form-close"
              />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="name" isMandatory>
              Name
            </Label>
            <div>
              <Input
                id="name"
                placeholder="Pattern name"
                {...register("name", { required: "Name is required" })}
                className={errors.name ? "border border-red-600" : ""}
                data-cy="admin-sd-patterns-form-name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm" data-cy="admin-sd-patterns-form-name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this pattern?"
              {...register("description")}
              data-cy="admin-sd-patterns-form-description"
            />

            <Label htmlFor="useCases">Use Cases</Label>
            <Textarea
              id="useCases"
              placeholder="e.g. Read-heavy workloads, Reducing database load"
              {...register("useCases")}
              data-cy="admin-sd-patterns-form-use-cases"
            />

            <Label htmlFor="benefits">Benefits</Label>
            <Textarea
              id="benefits"
              placeholder="e.g. Improves read performance, Reduces load"
              {...register("benefits")}
              data-cy="admin-sd-patterns-form-benefits"
            />

            <Label htmlFor="drawbacks">Drawbacks</Label>
            <Textarea
              id="drawbacks"
              placeholder="e.g. Added complexity, Eventual consistency"
              {...register("drawbacks")}
              data-cy="admin-sd-patterns-form-drawbacks"
            />
            <p className="text-xs text-muted-foreground -mt-2">
              Use Cases, Benefits, and Drawbacks are comma-separated lists.
            </p>

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button type="button" variant="danger" data-cy="admin-sd-patterns-form-cancel">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={disabled}
                className="flex items-center justify-center gap-2 min-w-[70px]"
                data-cy="admin-sd-patterns-form-save"
              >
                {disabled ? (
                  <>
                    <span
                      className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                      data-cy="admin-sd-patterns-form-save-spinner"
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

export default PatternFormModal;
