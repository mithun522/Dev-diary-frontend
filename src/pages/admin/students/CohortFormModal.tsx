import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useForm } from "react-hook-form";
import { logger } from "../../../utils/logger";
import { useCreateCohort, useRenameCohort } from "../../../api/hooks/useCohorts";
import type { Cohort } from "../../../data/cohortData";

type CohortFormValues = {
  name: string;
};

type CohortFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  cohort?: Cohort | null; // if provided -> rename mode
};

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const CohortFormModal: React.FC<CohortFormModalProps> = ({ open, setOpen, cohort }) => {
  const [disabled, setDisabled] = useState(false);
  const createCohortMutation = useCreateCohort();
  const renameCohortMutation = useRenameCohort();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CohortFormValues>({ defaultValues: { name: cohort?.name ?? "" } });

  useEffect(() => {
    reset({ name: cohort?.name ?? "" });
  }, [open, cohort, reset]);

  const onSubmit = async (data: CohortFormValues) => {
    setDisabled(true);
    try {
      if (cohort) {
        await renameCohortMutation.mutateAsync({ id: cohort.id, name: data.name });
        toast.success("Cohort renamed");
      } else {
        await createCohortMutation.mutateAsync(data.name);
        toast.success("Cohort created");
      }
      setOpen(false);
      reset();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save cohort"));
      logger.error("Error submitting cohort:", error);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]"
          data-cy="cohort-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold" data-cy="cohort-form-title">
              {cohort ? "Rename Cohort" : "New Cohort"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X className="text-primary-background cursor-pointer" data-cy="cohort-form-close" />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="cohort-name" isMandatory>
              Cohort name
            </Label>
            <div>
              <Input
                id="cohort-name"
                placeholder="e.g. 2026 Batch A"
                {...register("name", { required: "Cohort name is required" })}
                className={errors.name ? "border border-red-600" : ""}
                data-cy="cohort-form-name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm" data-cy="cohort-form-name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button type="button" variant="danger" data-cy="cohort-form-cancel">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={disabled}
                className="flex items-center justify-center gap-2 min-w-[70px]"
                data-cy="cohort-form-save"
              >
                {disabled ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CohortFormModal;
