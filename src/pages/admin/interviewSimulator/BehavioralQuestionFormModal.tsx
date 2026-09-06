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
import TagsInput from "./TagsInput";
import { logger } from "../../../utils/logger";
import type { BehavioralQuestion } from "../../../data/interviewData";
import {
  useCreateBehavioralQuestion,
  useUpdateBehavioralQuestion,
} from "../../../api/hooks/useAdminInterviewSimulator";
import type { BehavioralQuestionInput } from "../../../api/services/adminInterviewSimulator.service";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

const emptyValues: BehavioralQuestionInput = {
  question: "",
  category: "",
  tips: [],
};

type BehavioralQuestionFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  questionData?: BehavioralQuestion | null; // if provided → edit mode
};

const BehavioralQuestionFormModal: React.FC<
  BehavioralQuestionFormModalProps
> = ({ open, setOpen, questionData }) => {
  const [disabled, setDisabled] = useState(false);
  const createMutation = useCreateBehavioralQuestion();
  const updateMutation = useUpdateBehavioralQuestion();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BehavioralQuestionInput>({
    defaultValues: questionData ?? emptyValues,
  });

  useEffect(() => {
    reset(questionData ?? emptyValues);
  }, [open, questionData, reset]);

  const onSubmit = (data: BehavioralQuestionInput) => {
    setDisabled(true);
    const payload: BehavioralQuestionInput = {
      question: data.question,
      category: data.category,
      tips: data.tips ?? [],
    };

    const onSuccess = (label: string) => {
      toast.success(label);
      setOpen(false);
      reset(emptyValues);
    };
    const onError = (err: unknown) => {
      toast.error(errorMessage(err, "Failed to save behavioral question"));
      logger.error("Error submitting behavioral question:", err);
    };
    const onSettled = () => setDisabled(false);

    if (questionData) {
      updateMutation.mutate(
        { id: questionData.id, input: payload },
        {
          onSuccess: () =>
            onSuccess("Behavioral question updated successfully"),
          onError,
          onSettled,
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onSuccess("Behavioral question added successfully"),
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
          data-cy="admin-behavioral-questions-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title
              className="text-lg font-semibold"
              data-cy="admin-behavioral-questions-form-title"
            >
              {questionData
                ? "Edit Behavioral Question"
                : "Add Behavioral Question"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X
                className="text-primary-background cursor-pointer"
                data-cy="admin-behavioral-questions-form-close"
              />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="question" isMandatory>
              Question
            </Label>
            <div>
              <Textarea
                id="question"
                placeholder="Tell me about a time when..."
                {...register("question", {
                  required: "Question is required",
                })}
                className={errors.question ? "border border-red-600" : ""}
                data-cy="admin-behavioral-questions-form-question"
              />
              {errors.question && (
                <p
                  className="text-red-500 text-sm"
                  data-cy="admin-behavioral-questions-form-question-error"
                >
                  {errors.question.message}
                </p>
              )}
            </div>

            <Label htmlFor="category" isMandatory>
              Category
            </Label>
            <div>
              <Input
                id="category"
                placeholder="e.g. Teamwork, Leadership"
                {...register("category", {
                  required: "Category is required",
                })}
                className={errors.category ? "border border-red-600" : ""}
                data-cy="admin-behavioral-questions-form-category"
              />
              {errors.category && (
                <p
                  className="text-red-500 text-sm"
                  data-cy="admin-behavioral-questions-form-category-error"
                >
                  {errors.category.message}
                </p>
              )}
            </div>

            <Label htmlFor="tips">Tips</Label>
            <Controller
              name="tips"
              control={control}
              render={({ field }) => (
                <TagsInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Add a tip and press Enter..."
                  dataCy="admin-behavioral-questions-form-tips"
                />
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="danger"
                  data-cy="admin-behavioral-questions-form-cancel"
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={disabled}
                className="flex items-center justify-center gap-2 min-w-[70px]"
                data-cy="admin-behavioral-questions-form-save"
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

export default BehavioralQuestionFormModal;
