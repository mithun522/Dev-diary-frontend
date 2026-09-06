import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
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
import type { MockInterview } from "../../../data/interviewData";
import {
  useCreateMockInterview,
  useUpdateMockInterview,
} from "../../../api/hooks/useAdminInterviewSimulator";
import type { MockInterviewInput } from "../../../api/services/adminInterviewSimulator.service";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

const emptyValues: MockInterviewInput = {
  title: "",
  description: "",
  difficulty: "Easy",
  duration: 30,
  topics: [],
  rating: 0,
};

type MockInterviewFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  interviewData?: MockInterview | null; // if provided → edit mode
};

const MockInterviewFormModal: React.FC<MockInterviewFormModalProps> = ({
  open,
  setOpen,
  interviewData,
}) => {
  const [disabled, setDisabled] = useState(false);
  const createMutation = useCreateMockInterview();
  const updateMutation = useUpdateMockInterview();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<MockInterviewInput>({
    defaultValues: interviewData ?? emptyValues,
  });

  useEffect(() => {
    reset(interviewData ?? emptyValues);
  }, [open, interviewData, reset]);

  const onSubmit = (data: MockInterviewInput) => {
    setDisabled(true);
    const payload: MockInterviewInput = {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      duration: Number(data.duration),
      topics: data.topics ?? [],
      rating: Number(data.rating),
    };

    const onSuccess = (label: string) => {
      toast.success(label);
      setOpen(false);
      reset(emptyValues);
    };
    const onError = (err: unknown) => {
      toast.error(errorMessage(err, "Failed to save mock interview"));
      logger.error("Error submitting mock interview:", err);
    };
    const onSettled = () => setDisabled(false);

    if (interviewData) {
      updateMutation.mutate(
        { id: interviewData.id, input: payload },
        {
          onSuccess: () => onSuccess("Mock interview updated successfully"),
          onError,
          onSettled,
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onSuccess("Mock interview added successfully"),
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
          data-cy="admin-mock-interviews-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title
              className="text-lg font-semibold"
              data-cy="admin-mock-interviews-form-title"
            >
              {interviewData ? "Edit Mock Interview" : "Add Mock Interview"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X
                className="text-primary-background cursor-pointer"
                data-cy="admin-mock-interviews-form-close"
              />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="title" isMandatory>
              Title
            </Label>
            <div>
              <Input
                id="title"
                placeholder="e.g. Google SDE Interview"
                {...register("title", { required: "Title is required" })}
                className={errors.title ? "border border-red-600" : ""}
                data-cy="admin-mock-interviews-form-title-input"
              />
              {errors.title && (
                <p
                  className="text-red-500 text-sm"
                  data-cy="admin-mock-interviews-form-title-error"
                >
                  {errors.title.message}
                </p>
              )}
            </div>

            <Label htmlFor="description" isMandatory>
              Description
            </Label>
            <div>
              <Textarea
                id="description"
                placeholder="Short description shown on the interview card..."
                {...register("description", {
                  required: "Description is required",
                })}
                className={errors.description ? "border border-red-600" : ""}
                data-cy="admin-mock-interviews-form-description"
              />
              {errors.description && (
                <p
                  className="text-red-500 text-sm"
                  data-cy="admin-mock-interviews-form-description-error"
                >
                  {errors.description.message}
                </p>
              )}
            </div>

            <Label htmlFor="difficulty">Difficulty</Label>
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    data-cy="admin-mock-interviews-form-difficulty-trigger"
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[9999]"
                    data-cy="admin-mock-interviews-form-difficulty-content"
                  >
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <Label htmlFor="duration" isMandatory>
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              min={1}
              {...register("duration", {
                required: "Duration is required",
                valueAsNumber: true,
                min: { value: 1, message: "Must be at least 1 minute" },
              })}
              className={errors.duration ? "border border-red-600" : ""}
              data-cy="admin-mock-interviews-form-duration"
            />
            {errors.duration && (
              <p
                className="text-red-500 text-sm"
                data-cy="admin-mock-interviews-form-duration-error"
              >
                {errors.duration.message}
              </p>
            )}

            <Label htmlFor="topics">Topics</Label>
            <Controller
              name="topics"
              control={control}
              render={({ field }) => (
                <TagsInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="e.g. Data Structures, System Design"
                  dataCy="admin-mock-interviews-form-topics"
                />
              )}
            />

            <Label htmlFor="rating">Rating (0-5)</Label>
            <Input
              id="rating"
              type="number"
              min={0}
              max={5}
              step={0.1}
              {...register("rating", {
                valueAsNumber: true,
                min: { value: 0, message: "Must be at least 0" },
                max: { value: 5, message: "Must be at most 5" },
              })}
              className={errors.rating ? "border border-red-600" : ""}
              data-cy="admin-mock-interviews-form-rating"
            />
            {errors.rating && (
              <p
                className="text-red-500 text-sm"
                data-cy="admin-mock-interviews-form-rating-error"
              >
                {errors.rating.message}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="danger"
                  data-cy="admin-mock-interviews-form-cancel"
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={disabled}
                className="flex items-center justify-center gap-2 min-w-[70px]"
                data-cy="admin-mock-interviews-form-save"
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

export default MockInterviewFormModal;
