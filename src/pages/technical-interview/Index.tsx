import { useState } from "react";
import { Input } from "../../components/ui/input";
import { Search, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import AddTechnicalQuestionForm from "./AddTechInterview";
import { TECHNICAL_INTERVIEW } from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import AskForConfirmationModal from "../../components/AskForConfirmationModal";
import {
  useFetchTechInterview,
  useSearchTechInterview,
} from "../../api/hooks/useFetchTechInterview";
import QuestionsCard from "./QuestionsCard";
import { useDebounce } from "../../api/hooks/use-debounce";
import {
  QUESTION_DELETE_FAILED,
  QUESTION_DELETE_SUCCESS,
} from "../../constants/ToastMessage";
import QuestionsShimmer from "./QuestionsShimmer";
import ErrorPage from "../ErrorPage";
import { TechInterviewStore } from "../../store/TechInterviewStore";
import { formatDate } from "../../utils/formatDate";
import Button from "../../components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import Languages from "./Languages";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedLanguage, setSelectedLanguage } = TechInterviewStore();
  const [selectedQuestion, setSelectedQuestion] =
    useState<TechnicalQuestion | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(0);
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const queryClient = useQueryClient();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingFetch,
    isFetching: isFetchingFetch,
    error: errorFetch,
  } = useFetchTechInterview(selectedLanguage);

  const questions = data?.pages.flatMap((page) => page.questions) ?? [];

  const {
    data: searchedQuestions = [],
    isLoading: isLoadingSearch,
    isFetching: isFetchingSearch,
    error: errorSearch,
  } = useSearchTechInterview(debouncedSearchQuery, selectedLanguage);

  // select data based on searchQuery
  const isSearching = !!debouncedSearchQuery;

  // Final list of questions
  const displayedQuestions = isSearching ? searchedQuestions : questions;
  const isLoading = searchQuery ? isLoadingSearch : isLoadingFetch;
  const isFetching = searchQuery ? isFetchingSearch : isFetchingFetch;
  const error = searchQuery ? errorSearch : errorFetch;

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
        queryClient.invalidateQueries({ queryKey: ["tech-interview"] });
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

  if (error) {
    return <ErrorPage message="Failed to load questions. Please try again." />;
  }

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
        <Languages
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />
      </div>

      <div className="grid gap-4">
        {displayedQuestions.map((question: TechnicalQuestion, index) => (
          <div key={question.id} data-cy="questions-card">
            <QuestionsCard
              index={index}
              key={question.id}
              question={question}
              onEdit={() => setSelectedQuestion(question)}
              onDelete={() => handleDeleteOpen(question.id)}
            />
          </div>
        ))}
        {isLoading ||
          (isFetching && <QuestionsShimmer data-cy="questions-shimmer" />)}
        {!isSearching && hasNextPage && (
          <div className="flex justify-center mt-4">
            <Button
              variant="outlinePrimary"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="px-4 py-2 text-sm rounded-lg disabled:opacity-50"
            >
              {isFetchingNextPage ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>

      {!isLoading && !isFetching && displayedQuestions.length === 0 && (
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
              {selectedQuestion?.createdAt && (
                <>Created: {formatDate(selectedQuestion.createdAt)} | </>
              )}
              {selectedQuestion?.updatedAt && (
                <>Updated: {formatDate(selectedQuestion.updatedAt)}</>
              )}
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
