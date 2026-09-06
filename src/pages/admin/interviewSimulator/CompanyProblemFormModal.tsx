import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import TagsInput from "./TagsInput";
import { logger } from "../../../utils/logger";
import type { CompanyProblem } from "../../../data/interviewData";
import {
  useCreateCompanyProblem,
  useUpdateCompanyProblem,
} from "../../../api/hooks/useAdminInterviewSimulator";
import type { CompanyProblemInput } from "../../../api/services/adminInterviewSimulator.service";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

const emptyValues: CompanyProblemInput = {
  company: "",
  title: "",
  link: "",
  difficulty: "Easy",
  tags: [],
};

type CompanyProblemFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  problemData?: CompanyProblem | null; // if provided → edit mode
};

const CompanyProblemFormModal: React.FC<CompanyProblemFormModalProps> = ({
  open,
  setOpen,
  problemData,
}) => {
  const [disabled, setDisabled] = useState(false);
  const createMutation = useCreateCompanyProblem();
  const updateMutation = useUpdateCompanyProblem();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<CompanyProblemInput>({
    defaultValues: problemData ?? emptyValues,
  });

  useEffect(() => {
    reset(problemData ?? emptyValues);
  }, [open, problemData, reset]);

  const onSubmit = (data: CompanyProblemInput) => {
    setDisabled(true);
    const payload: CompanyProblemInput = {
      company: data.company,
      title: data.title,
      link: data.link,
      difficulty: data.difficulty,
      tags: data.tags ?? [],
    };

    const onSuccess = (label: string) => {
      toast.success(label);
      setOpen(false);
      reset(emptyValues);
    };
    const onError = (err: unknown) => {
      toast.error(errorMessage(err, "Failed to save company problem"));
      logger.error("Error submitting company problem:", err);
    };
    const onSettled = () => setDisabled(false);

    if (problemData) {
      updateMutation.mutate(
        { id: problemData.id, input: payload },
        {
          onSuccess: () => onSuccess("Company problem updated successfully"),
          onError,
          onSettled,
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onSuccess("Company problem added successfully"),
        onError,
        onSettled,
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-md max-h-[600px] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]"
          data-cy="admin-company-problems-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title
              className="text-lg font-semibold"
              data-cy="admin-company-problems-form-title"
            >
              {problemData ? "Edit Company Problem" : "Add Company Problem"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X
                className="text-primary-background cursor-pointer"
                data-cy="admin-company-problems-form-close"
              />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="company" isMandatory>
              Company
            </Label>
            <div>
              <Input
                id="company"
                placeholder="e.g. google"
                {...register("company", { required: "Company is required" })}
                className={errors.company ? "border border-red-600" : ""}
                data-cy="admin-company-problems-form-company"
              />
              {errors.company && (
                <p
                  className="text-red-500 text-sm"
                  data-cy="admin-company-problems-form-company-error"
                >
                  {errors.company.message}
                </p>
              )}
            </div>

            <Label htmlFor="title" isMandatory>
              Title
            </Label>
            <div>
              <Input
                id="title"
                placeholder="Problem title"
                {...register("title", { required: "Title is required" })}
                className={errors.title ? "border border-red-600" : ""}
                data-cy="admin-company-problems-form-title-input"
              />
              {errors.title && (
                <p
                  className="text-red-500 text-sm"
                  data-cy="admin-company-problems-form-title-error"
                >
                  {errors.title.message}
                </p>
              )}
            </div>

            <Label htmlFor="link">Problem Link</Label>
            <Input
              id="link"
              placeholder="https://..."
              {...register("link")}
              data-cy="admin-company-problems-form-link"
            />

            <Label htmlFor="difficulty">Difficulty</Label>
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    data-cy="admin-company-problems-form-difficulty-trigger"
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[9999]"
                    data-cy="admin-company-problems-form-difficulty-content"
                  >
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <Label htmlFor="tags">Tags</Label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <TagsInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="e.g. Array, Hash Table"
                  dataCy="admin-company-problems-form-tags"
                />
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="danger"
                  data-cy="admin-company-problems-form-cancel"
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={disabled}
                className="flex items-center justify-center gap-2 min-w-[70px]"
                data-cy="admin-company-problems-form-save"
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

export default CompanyProblemFormModal;
