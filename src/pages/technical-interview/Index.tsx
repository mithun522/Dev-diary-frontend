import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import Button from "../../components/ui/button";
import { Search, Trash2, BookOpen } from "lucide-react";
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
import type { AxiosError, AxiosResponse } from "axios";
import AskForConfirmationModal from "../../components/AskForConfirmationModal";
import { logger } from "../../utils/logger";

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
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("JAVASCRIPT");
  const [selectedQuestion, setSelectedQuestion] =
    useState<TechnicalQuestion | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(0);
  const [isOpenDelete, setIsOpenDelete] = useState(false);

  // Filter questions based on search and filters
  const filteredQuestions = questions?.filter((question) => {
    const matchesSearch =
      searchQuery === "" ||
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLanguage =
      selectedLanguage === "all" || question.language === selectedLanguage;

    return matchesSearch && matchesLanguage;
  });

  const handleAddOrEditQuestion = async (newQuestionData: {
    id?: number;
    question: string;
    answer: string;
    notes: string;
    language: string;
  }) => {
    try {
      let response: AxiosResponse<TechnicalQuestion>;

      if (newQuestionData.id) {
        // Edit existing question
        response = await AxiosInstance.put(
          `${TECHNICAL_INTERVIEW}/${newQuestionData.id}`,
          newQuestionData
        );
        if (response.status === 200) {
          toast.success("Question updated successfully");
          setQuestions((prev) =>
            prev.map((q) => (q.id === newQuestionData.id ? response.data : q))
          );
        }
      } else {
        // Add new question
        response = await AxiosInstance.post(
          TECHNICAL_INTERVIEW,
          newQuestionData
        );
        if (response.status === 200) {
          toast.success("Question added successfully");
          setQuestions((prev) => [...prev, response.data]);
        }
      }
    } catch (error) {
      logger.error("Error adding or updating question:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      const response = await AxiosInstance.delete(
        `${TECHNICAL_INTERVIEW}/${selectedQuestionId}`
      );
      if (response.status === 200) {
        toast.success("Question deleted successfully");
      }
      setQuestions((prev) => prev.filter((q) => q.id !== selectedQuestionId));
    } catch (error) {
      const err = error as AxiosError;

      toast.error(
        (err.response?.data as { message: string }).message ||
          "Failed to delete"
      );
    } finally {
      setIsOpenDelete(false);
    }
  };

  const handleDeleteOpen = (questionId: number) => {
    setSelectedQuestionId(questionId);
    setIsOpenDelete(true);
  };

  useEffect(() => {
    const handleFetch = async () => {
      try {
        const response = await AxiosInstance.get(
          `${TECHNICAL_INTERVIEW}?language=${selectedLanguage}`
        );
        setQuestions(response.data);
      } catch (error) {
        const err = error as AxiosError;
        toast.error(
          (err.response?.data as { message: string }).message ||
            "Error fetching questions"
        );
        logger.error("Error fetching questions:", error);
      }
    };
    if (selectedLanguage !== "all") {
      handleFetch();
    }
  }, [selectedLanguage]);

  return (
    <div className="space-y-6 max-h-[80vh] overflow-auto ">
      <div className="flex justify-between items-start">
        <div>
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

      {/* Questions Grid */}
      <div className="grid gap-4">
        {filteredQuestions.map((question, index) => (
          <div key={question.id} className="h-fit max-h-[100vh]">
            <div className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium line-clamp-2">
                    {index + 1 + "."} {question.question}
                  </h4>
                  <p className="text-xs ml-6 text-gray-700">
                    {/\d+\.\s/.test(question.answer) ? (
                      question.answer
                        .split(/(\d+\.)\s+/)
                        .reduce<string[]>((acc, val, i, arr) => {
                          if (val.match(/\d+\./)) {
                            acc.push(`${val} ${arr[i + 1]}`);
                          } else {
                            return acc;
                          }
                          return acc;
                        }, [])
                        .map((point, index) => (
                          <div className="flex flex-col" key={index}>
                            {point}
                          </div>
                        ))
                    ) : (
                      <div className="flex flex-col">{question.answer}</div>
                    )}
                  </p>
                </div>
                <div className="flex flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedQuestion(question)}
                  >
                    <BookOpen className="h-3 w-3" />
                  </Button>
                  <AddTechnicalQuestionForm
                    isEdit={true}
                    row={question ? question : undefined}
                    onAddOrEdit={handleAddOrEditQuestion}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteOpen(question.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
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

      {/* Question Detail Dialog */}
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
