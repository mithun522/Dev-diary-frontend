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
import type { QuestionType } from "../../../data/interviewQuestions";
import {
  useCreateMockInterviewQuestion,
  useUpdateMockInterviewQuestion,
} from "../../../api/hooks/useAdminInterviewSimulator";
import type { MockInterviewQuestion } from "../../../api/services/adminInterviewSimulator.service";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

// `data` is a free-form JSONB blob whose shape depends on `type` (mcq options/correctAnswer,
// coding boilerplate/testCases, frontend requirements, etc.) — per the plan's convention for
// polymorphic fields, it's edited as raw JSON text (JSON.parse-validated before submit) rather
// than a bespoke structured editor per question type.
type QuestionFormValues = {
  type: QuestionType;
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  timeLimit: number;
  dataText: string;
};

const emptyValues: QuestionFormValues = {
  type: "mcq",
  question: "",
  difficulty: "Easy",
  topics: [],
  timeLimit: 5,
  dataText: "{}",
};

const toFormValues = (
  question?: MockInterviewQuestion | null
): QuestionFormValues =>
  question
    ? {
        type: question.type,
        question: question.question,
        difficulty: question.difficulty,
        topics: question.topics ?? [],
        timeLimit: question.timeLimit ?? 5,
        dataText: JSON.stringify(question.data ?? {}, null, 2),
      }
    : emptyValues;

type QuestionFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  interviewId: string;
  questionData?: MockInterviewQuestion | null; // if provided → edit mode
};

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  open,
  setOpen,
  interviewId,
  questionData,
}) => {
  const [disabled, setDisabled] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const createMutation = useCreateMockInterviewQuestion(interviewId);
  const updateMutation = useUpdateMockInterviewQuestion(interviewId);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<QuestionFormValues>({
    defaultValues: toFormValues(questionData),
  });

  useEffect(() => {
    reset(toFormValues(questionData));
    setDataError(null);
  }, [open, questionData, reset]);

  const onSubmit = (data: QuestionFormValues) => {
    let parsedData: Record<string, unknown>;
    try {
      const parsed = JSON.parse(data.dataText || "{}");
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("must be a JSON object");
      }
      parsedData = parsed as Record<string, unknown>;
    } catch {
      setDataError("Data must be valid JSON (an object), e.g. {}");
      return;
    }
    setDataError(null);
    setDisabled(true);

    const payload = {
      type: data.type,
      question: data.question,
      difficulty: data.difficulty,
      topics: data.topics ?? [],
      timeLimit: Number(data.timeLimit),
      data: parsedData,
    };

    const onSuccess = (label: string) => {
      toast.success(label);
      setOpen(false);
      reset(emptyValues);
    };
    const onError = (err: unknown) => {
      toast.error(errorMessage(err, "Failed to save question"));
      logger.error("Error submitting question:", err);
    };
    const onSettled = () => setDisabled(false);

    if (questionData) {
      updateMutation.mutate(
        { questionId: questionData.id, input: payload },
        {
          onSuccess: () => onSuccess("Question updated successfully"),
          onError,
          onSettled,
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onSuccess("Question added successfully"),
        onError,
        onSettled,
      });
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[110]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-lg max-h-[700px] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[111]"
          data-cy="admin-mock-interview-question-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title
              className="text-lg font-semibold"
              data-cy="admin-mock-interview-question-form-title"
            >
              {questionData ? "Edit Question" : "Add Question"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X
                className="text-primary-background cursor-pointer"
                data-cy="admin-mock-interview-question-form-close"
              />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="type">Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className="w-full"
                    data-cy="admin-mock-interview-question-form-type-trigger"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[9999]"
                    data-cy="admin-mock-interview-question-form-type-content"
                  >
                    <SelectItem value="mcq">MCQ</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="frontend">Frontend</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <Label htmlFor="question" isMandatory>
              Question
            </Label>
            <div>
              <Textarea
                id="question"
                placeholder="Question text..."
                {...register("question", {
                  required: "Question is required",
                })}
                className={errors.question ? "border border-red-600" : ""}
                data-cy="admin-mock-interview-question-form-question"
              />
              {errors.question && (
                <p
                  className="text-red-500 text-sm"
                  data-cy="admin-mock-interview-question-form-question-error"
                >
                  {errors.question.message}
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
                    data-cy="admin-mock-interview-question-form-difficulty-trigger"
                  >
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[9999]"
                    data-cy="admin-mock-interview-question-form-difficulty-content"
                  >
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />

            <Label htmlFor="topics">Topics</Label>
            <Controller
              name="topics"
              control={control}
              render={({ field }) => (
                <TagsInput
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="e.g. Arrays, Hash Map"
                  dataCy="admin-mock-interview-question-form-topics"
                />
              )}
            />

            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <Input
              id="timeLimit"
              type="number"
              min={1}
              {...register("timeLimit", {
                required: "Time limit is required",
                valueAsNumber: true,
                min: { value: 1, message: "Must be at least 1 minute" },
              })}
              className={errors.timeLimit ? "border border-red-600" : ""}
              data-cy="admin-mock-interview-question-form-time-limit"
            />
            {errors.timeLimit && (
              <p
                className="text-red-500 text-sm"
                data-cy="admin-mock-interview-question-form-time-limit-error"
              >
                {errors.timeLimit.message}
              </p>
            )}

            <Label htmlFor="dataText" isMandatory>
              Data (JSON)
            </Label>
            <p className="text-xs text-muted-foreground -mt-2">
              Type-specific fields (mcq options/correctAnswer, coding
              boilerplate/testCases, frontend requirements, etc.) as a raw
              JSON object.
            </p>
            <div>
              <Textarea
                id="dataText"
                placeholder='{"options": ["A", "B"], "correctAnswer": 0}'
                {...register("dataText")}
                className={`font-mono text-xs min-h-[150px] ${
                  dataError ? "border border-red-600" : ""
                }`}
                data-cy="admin-mock-interview-question-form-data"
              />
              {dataError && (
                <p
                  className="text-red-500 text-sm"
                  data-cy="admin-mock-interview-question-form-data-error"
                >
                  {dataError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="danger"
                  data-cy="admin-mock-interview-question-form-cancel"
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={disabled}
                className="flex items-center justify-center gap-2 min-w-[70px]"
                data-cy="admin-mock-interview-question-form-save"
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

export default QuestionFormModal;
