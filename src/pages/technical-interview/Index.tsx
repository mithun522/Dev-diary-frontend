import { useState } from "react";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Search, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import AddTechnicalQuestionForm from "./AddTechInterview";
import { Languages } from "../../constants/Languages";
import { TECHNICAL_INTERVIEW } from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import AskForConfirmationModal from "../../components/AskForConfirmationModal";
import { logger } from "../../utils/logger";
import {
  useFetchTechInterview,
  useSearchTechInterview,
} from "../../api/hooks/useFetchTechInterview";
import { useQueryClient } from "@tanstack/react-query";
import QuestionsCard from "./QuestionsCard";
import { useDebounce } from "../../api/hooks/use-debounce";
import {
  ERROR_OCCURRED,
  QUESTION_ADD_SUCCESS,
  QUESTION_DELETE_FAILED,
  QUESTION_DELETE_SUCCESS,
  QUESTION_UPDATED_SUCCESS,
} from "../../constants/ToastMessage";
import QuestionsShimmer from "./QuestionsShimmer";

export interface TechnicalQuestion {
  id: number;
  question: string;
  answer: string;
  notes: string;
  language: string;
  createdAt?: string;
  updatedAt?: string;
}

const TechnicalInterviewPage = () => {
  // const [questions, setQuestions] = useState<TechnicalQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [selectedQuestion, setSelectedQuestion] =
    useState<TechnicalQuestion | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(0);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const queryClient = useQueryClient();

  const {
    data: fetchedQuestions = [],
    isLoading: isLoadingFetch,
    isFetching: isFetchingFetch,
    error: errorFetch,
  } = useFetchTechInterview(selectedLanguage);

  const {
    data: searchedQuestions = [],
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
    error: errorSearch,
  } = useSearchTechInterview(debouncedSearchQuery, selectedLanguage);

  // select data based on searchQuery
  const questions = searchQuery ? searchedQuestions : fetchedQuestions;
  const isLoading = searchQuery ? isLoadingSearch : isLoadingFetch;
  const isFetching = searchQuery ? isFetchingSearch : isFetchingFetch;
  const error = searchQuery ? errorSearch : errorFetch;

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <p className="text-red-500 text-lg font-medium">
          Failed to load questions. Please try again.
        </p>
      </div>
    );
  }

  const handleAddOrEditQuestion = async (newQuestionData: {
    id?: number;
    question: string;
    answer: string;
    notes: string;
    language: string;
  }) => {
    try {
      if (newQuestionData.id) {
        await AxiosInstance.put(
          `${TECHNICAL_INTERVIEW}/${newQuestionData.id}`,
          newQuestionData
        );
        toast.success(QUESTION_UPDATED_SUCCESS);
      } else {
        await AxiosInstance.post(TECHNICAL_INTERVIEW, newQuestionData);
        toast.success(QUESTION_ADD_SUCCESS);
      }

      await queryClient.invalidateQueries({
        queryKey: ["techInterview", selectedLanguage],
      });
    } catch (error) {
      const err = error as AxiosError;
      toast.error(
        (err.response?.data as { message: string }).message || ERROR_OCCURRED
      );
      logger.error("Error adding or updating question:", error);
    }
  };

  const handleDeleteOpen = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setIsOpenDelete(true);
  };

  const handleDeleteQuestion = async () => {
    try {
      const response = await AxiosInstance.delete(
        `${TECHNICAL_INTERVIEW}/${selectedQuestionId}`
      );
      if (response.status === 200) {
        toast.success(QUESTION_DELETE_SUCCESS);
      }
    } catch (error) {
      const err = error as AxiosError;

      toast.error(
        (err.response?.data as { message: string }).message ||
          QUESTION_DELETE_FAILED
      );
    } finally {
      setIsOpenDelete(false);
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-auto ">
      <div className="flex justify-between items-start">
        <div data-cy="tech-interview">
          <h1 className="text-3xl font-bold">Technical Interview Q&A</h1>
          <p className="text-muted-foreground">
            Manage your technical interview questions and answers with
            auto-numbered points.
          </p>
        </div>
        <AddTechnicalQuestionForm
          isEdit={false}
          row={selectedQuestion ? selectedQuestion : undefined}
          onAddOrEdit={handleAddOrEditQuestion}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions, answers, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {Languages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading || isFetching ? (
        <QuestionsShimmer data-cy="questions-shimmer" />
      ) : (
        <div className="grid gap-4">
          {questions.map((question: TechnicalQuestion, index) => (
            <div key={question.id} data-cy="questions-card">
              <QuestionsCard
                index={index}
                key={question.id}
                question={question}
                onEdit={() => setSelectedQuestion(question)}
                onDelete={() => handleDeleteOpen(question.id)}
                handleEdit={handleAddOrEditQuestion}
              />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isFetching && questions.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No questions found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedLanguage !== "all"
              ? "No matching questions found."
              : "No questions added yet."}
          </p>
        </div>
      )}

      <Dialog
        open={!!selectedQuestion}
        onOpenChange={() => setSelectedQuestion(null)}
      >
        <DialogContent
          onClose={() => setSelectedQuestion(null)}
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {selectedQuestion?.question}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {selectedQuestion?.answer && (
              <div>
                <h4 className="font-medium mb-2">Answer:</h4>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {selectedQuestion.answer}
                  </pre>
                </div>
              </div>
            )}

            {selectedQuestion?.notes && (
              <div>
                <h4 className="font-medium mb-2">Notes:</h4>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">
                    {selectedQuestion.notes}
                  </pre>
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground border-t pt-4">
              Created: {selectedQuestion?.createdAt} | Updated:{" "}
              {selectedQuestion?.updatedAt}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {isOpenDelete && (
        <AskForConfirmationModal
          title="Delete Question"
          message="Are you sure you want to delete this question?"
          onCancel={() => setIsOpenDelete(false)}
          onDelete={handleDeleteQuestion}
          showDelete={true}
        />
      )}
    </div>
  );
};

export default TechnicalInterviewPage;
