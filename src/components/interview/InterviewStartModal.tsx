import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import Button from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Clock, FileText, Star, Users } from "lucide-react";
import { type MockInterview } from "../../data/interviewData";
import { interviewQuestions } from "../../data/interviewQuestions";

interface InterviewStartModalProps {
  interview: MockInterview | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
}

const InterviewStartModal = ({
  interview,
  isOpen,
  onClose,
  onStart,
}: InterviewStartModalProps) => {
  if (!interview) return null;

  const questions = interviewQuestions[interview.id] || [];
  const totalQuestions = questions.length;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {interview.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {interview.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Interview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{interview.duration}</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Badge
                className={`${getDifficultyColor(
                  interview.difficulty
                )} text-base px-3 py-1`}
              >
                {interview.difficulty}
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">
                Difficulty
              </div>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= interview.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
          </div>

          {/* Topics */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Topics Covered
            </h3>
            <div className="flex flex-wrap gap-2">
              {interview.topics.map((topic, idx) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Instructions:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Once started, the timer will begin countdown</li>
              <li>• You can navigate between questions freely</li>
              <li>• Your progress is automatically saved</li>
              <li>• Submit early if you finish before time runs out</li>
              <li>• Review your answers before final submission</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outlinePrimary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onStart} className="px-8">
              Start Interview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewStartModal;
