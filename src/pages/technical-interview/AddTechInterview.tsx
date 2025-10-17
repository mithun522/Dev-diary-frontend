import { useState } from "react";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Edit, Plus } from "lucide-react";
import Button from "../../components/ui/button";
import NumberedTextarea from "./NumberedTextArea";
import type { TechnicalQuestion } from "./Index";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { logger } from "../../utils/logger";
import AxiosInstance from "../../utils/AxiosInstance";
import { TECHNICAL_INTERVIEW } from "../../constants/Api";
import {
  QUESTION_ADD_SUCCESS,
  QUESTION_UPDATED_SUCCESS,
} from "../../constants/ToastMessage";
import { useQueryClient } from "@tanstack/react-query";
import { TechInterviewStore } from "../../store/TechInterviewStore";
import { useFetchLanguage } from "../../api/hooks/useFetchLanguage";
import ErrorPage from "../ErrorPage";
import { Skeleton } from "../../components/ui/skeleton";

interface AddTechnicalQuestionFormProps {
  row?: TechnicalQuestion;
  isEdit: boolean;
}

const AddTechnicalQuestionForm: React.FC<AddTechnicalQuestionFormProps> = ({
  isEdit,
  row,
}) => {
  const [open, setOpen] = useState(false);
  const { selectedLanguage } = TechInterviewStore();
  const {
    data: Languages = [],
    isLoading: isLoadingLanguages,
    error: languagesError,
  } = useFetchLanguage();
  const [formData, setFormData] = useState({
    id: row?.id || null,
    question: row?.question || "",
    answer: row?.answer || "",
    notes: row?.notes || "",
    language: row?.language || "",
  });
  const [error, setError] = useState({
    question: "",
    answer: "",
    language: "",
  });
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let err = false;

    const newErrors = {
      question: "",
      answer: "",
      language: "",
    };

    if (formData.question.trim() === "") {
      newErrors.question = "Please enter a question";
      err = true;
    }

    if (formData.answer.trim() === "") {
      newErrors.answer = "Please enter an answer";
      err = true;
    }

    if (formData.language.trim() === "") {
      newErrors.language = "Please select a language";
      err = true;
    }

    if (err) {
      setError(newErrors);
      return;
    }

    // Clear errors if valid
    setError({
      question: "",
      answer: "",
      language: "",
    });

    try {
      if (formData.id) {
        const response = await AxiosInstance.put(
          `${TECHNICAL_INTERVIEW}/${formData.id}`,
          formData
        );

        if (response.status === 200) {
          await queryClient.invalidateQueries({
            queryKey: ["techInterview", selectedLanguage],
          });
        }
        toast.success(QUESTION_UPDATED_SUCCESS);
      } else {
        const response = await AxiosInstance.post(
          TECHNICAL_INTERVIEW,
          formData
        );
        if (response.status === 200) {
          await queryClient.invalidateQueries({
            queryKey: ["techInterview", selectedLanguage],
          });
        }
        toast.success(QUESTION_ADD_SUCCESS);
      }

      if (!isEdit) {
        setFormData({
          id: null,
          question: "",
          answer: "",
          notes: "",
          language: "",
        });
      }

      setOpen(false);
    } catch (error) {
      const err = error as AxiosError;

      toast.error(
        (err.response?.data as { message: string }).message ||
          "An error occurred. Please try again."
      );
      logger.error("Error adding or updating question:", error);
    }
  };

  if (isLoadingLanguages) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (languagesError) return <ErrorPage message="Failed to fetch languages" />;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isEdit ? "ghost" : "primary"}
          className={
            isEdit
              ? "flex whitespace-nowrap px-2 py-0"
              : "flex whitespace-nowrap"
          }
          data-cy="add-tech-question-button"
        >
          {isEdit ? (
            <Edit className="w-3 hover:scale-110" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2 mt-1" />
              Add Question
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent
        onClose={() => setOpen(false)}
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle data-cy="add-tech-interview-title">
            {row ? "Edit" : "Add"} Technical Question
          </DialogTitle>
          <DialogDescription>
            Add a new technical interview question with answer and notes.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label isMandatory={true} htmlFor="question">
              Question
            </Label>
            <Textarea
              id="question"
              placeholder="Enter the technical question..."
              value={formData.question}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, question: e.target.value }));
                setError((prev) => ({ ...prev, question: "" }));
              }}
              error={error.question !== ""}
              className="min-h-[80px]"
              data-cy="add-tech-interview-question"
            />
            {error.question && <p className="text-red-500">{error.question}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="language" isMandatory={true}>
                Programming Language
              </Label>
              <Select
                value={formData.language}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, language: value }));
                  setError((prev) => ({ ...prev, language: "" }));
                }}
              >
                <SelectTrigger
                  error={error.language !== ""}
                  data-cy="open-select-tech-question-language"
                >
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {Languages.map((lang) => (
                    <SelectItem
                      data-cy="select-tech-question-language"
                      key={lang.id}
                      value={lang.language}
                    >
                      {lang.language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {error.language && (
                <p className="text-red-500">{error.language}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="answer" isMandatory={true}>
              Answer
            </Label>
            <NumberedTextarea
              value={formData.answer}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, answer: value }));
                setError((prev) => ({ ...prev, answer: "" }));
              }}
              placeholder="Type your answer in numbered points. Press Enter to auto-increment numbers..."
              className="min-h-[150px]"
              error={error.answer !== ""}
              dataCy="add-tech-question-answer"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Type "1. " and press Enter to start numbered points, or just
              press Enter to begin numbering.
            </p>
            {error.answer && <p className="text-red-500">{error.answer}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <NumberedTextarea
              value={formData.notes}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, notes: value }))
              }
              placeholder="Additional notes, key points to remember..."
              className="min-h-[100px]"
              dataCy="add-tech-question-notes"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outlinePrimary"
              onClick={() => setOpen(false)}
              data-cy="add-tech-question-cancel"
            >
              Cancel
            </Button>
            <Button data-cy="add-tech-question-save-button" type="submit">
              {isEdit ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTechnicalQuestionForm;
