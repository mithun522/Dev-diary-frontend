import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import Button from "../ui/button";
import { Play, Star, Headphones } from "lucide-react";
import { type MockInterview } from "../../data/interviewData";
import { useFetchMockInterviewQuestions } from "../../api/hooks/useAdminInterviewSimulator";

interface MockInterviewCardProps {
  interview: MockInterview;
  onStartInterview: (interview: MockInterview) => void;
}

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

// Fetches its own question count from the real backend (one hook call per card instance, since
// react's rules of hooks disallow calling a hook inside the parent's .map() loop).
const MockInterviewCard = ({
  interview,
  onStartInterview,
}: MockInterviewCardProps) => {
  const navigate = useNavigate();
  const { data: questions } = useFetchMockInterviewQuestions(interview.id);

  return (
    <Card
      className="flex flex-col hover:shadow-lg transition-shadow duration-200"
      data-cy="mock-interview-card"
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <span className="text-lg">{interview.title}</span>
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            {interview.duration} mins
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">
          {interview.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Difficulty:</span>
            <Badge className={getDifficultyColor(interview.difficulty)}>
              {interview.difficulty}
            </Badge>
          </div>

          <div>
            <span className="text-sm font-medium mb-2 block">Topics:</span>
            <div className="flex flex-wrap gap-1">
              {interview.topics.map((topic, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
            <span>{questions?.length ?? 0} questions</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= interview.rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-4 border-t">
        <Button
          className="flex w-full justify-center bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => onStartInterview(interview)}
          data-cy="mock-interview-start-button"
        >
          <Play className="h-4 w-4 mr-2 mt-1" />
          Start Interview
        </Button>
        <Button
          variant="outlinePrimary"
          className="flex w-full justify-center items-center gap-2"
          onClick={() => navigate(`/interview/live/${interview.id}`)}
          data-cy="mock-interview-live-voice-button"
        >
          <Headphones className="h-4 w-4" />
          Live Voice Interview (AI-graded)
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MockInterviewCard;
