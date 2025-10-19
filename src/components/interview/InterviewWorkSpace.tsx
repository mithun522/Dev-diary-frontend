import { useState, useEffect } from "react";
import Button from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Progress } from "../../components/ui/progress";
import { Badge } from "../../components/ui/badge";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Clock, ChevronLeft, ChevronRight, Flag, Send } from "lucide-react";
import {
  type InterviewSession,
  type Question,
  type MCQQuestion,
  type DescriptiveQuestion,
  type CodingQuestion,
  type FrontendQuestion,
} from "../../data/interviewQuestions";
import CodeEditor from "./CodeEditor";
import FrontendSandbox from "./FrontendSandbox";

interface InterviewWorkspaceProps {
  session: InterviewSession;
  onUpdateAnswer: (questionId: string, answer: any) => void;
  onTimeUpdate: (timeRemaining: number) => void;
  onSubmit: () => void;
  onNavigate: (index: number) => void;
}

const InterviewWorkspace = ({
  session,
  onUpdateAnswer,
  onTimeUpdate,
  onSubmit,
  onNavigate,
}: InterviewWorkspaceProps) => {
  const [timeRemaining, setTimeRemaining] = useState(session.timeRemaining);

  const currentQuestion = session.questions[session.currentQuestionIndex];
  const progress =
    ((session.currentQuestionIndex + 1) / session.questions.length) * 100;

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);
        onTimeUpdate(newTime);

        if (newTime === 0) {
          onSubmit(); // Auto-submit when time runs out
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onTimeUpdate, onSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

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

  const renderQuestionContent = (question: Question) => {
    const currentAnswer = session.answers[question.id];

    switch (question.type) {
      case "mcq": {
        const mcqQuestion = question as MCQQuestion;
        return (
          <div className="space-y-4">
            <RadioGroup
              value={currentAnswer?.toString() || ""}
              onValueChange={(value: string) =>
                onUpdateAnswer(question.id, parseInt(value))
              }
            >
              {mcqQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50"
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      }

      case "descriptive": {
        const descriptiveQuestion = question as DescriptiveQuestion;
        return (
          <div className="space-y-4">
            <Textarea
              placeholder="Type your answer here... Use bullet points for better structure."
              value={currentAnswer || ""}
              onChange={(e) => onUpdateAnswer(question.id, e.target.value)}
              className="min-h-[300px] resize-none"
            />
            {descriptiveQuestion.maxWords && (
              <div className="text-sm text-muted-foreground">
                Word limit: {descriptiveQuestion.maxWords} words
                {currentAnswer && (
                  <span className="ml-2">
                    (
                    {
                      currentAnswer
                        .split(" ")
                        .filter((word: string) => word.length > 0).length
                    }{" "}
                    words used)
                  </span>
                )}
              </div>
            )}
            {descriptiveQuestion.expectedPoints && (
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Consider covering these points:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  {descriptiveQuestion.expectedPoints.map((point, idx) => (
                    <li key={idx}>• {point}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      }

      case "coding": {
        const codingQuestion = question as CodingQuestion;
        return (
          <div className="space-y-4">
            <CodeEditor
              initialCode={currentAnswer || codingQuestion.boilerplate || ""}
              onChange={(code) => onUpdateAnswer(question.id, code)}
              language="javascript"
            />
            {codingQuestion.testCases && (
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                <h4 className="font-medium mb-3">Test Cases:</h4>
                <div className="space-y-2">
                  {codingQuestion.testCases.map((testCase, idx) => (
                    <div
                      key={idx}
                      className="text-sm font-mono bg-white dark:bg-gray-800 p-2 rounded border"
                    >
                      <div>
                        <strong>Input:</strong> {testCase.input}
                      </div>
                      <div>
                        <strong>Expected Output:</strong>{" "}
                        {testCase.expectedOutput}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case "frontend": {
        const frontendQuestion = question as FrontendQuestion;
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Instructions:
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                {frontendQuestion.instructions}
              </p>
              <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Requirements:
              </h5>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                {frontendQuestion.requirements.map((req, idx) => (
                  <li key={idx}>• {req}</li>
                ))}
              </ul>
            </div>
            <FrontendSandbox
              initialCode={currentAnswer || frontendQuestion.boilerplate}
              onChange={(code) => onUpdateAnswer(question.id, code)}
            />
          </div>
        );
      }

      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{session.title}</h1>
              <Badge variant="outline">
                Question {session.currentQuestionIndex + 1} of{" "}
                {session.questions.length}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                <span className={timeRemaining < 300 ? "text-red-600" : ""}>
                  {" "}
                  {/* Red when < 5 mins */}
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                onClick={onSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>

          <Progress value={progress} className="mt-3" />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">
                    {currentQuestion.question}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={getDifficultyColor(currentQuestion.difficulty)}
                    >
                      {currentQuestion.difficulty}
                    </Badge>
                    {currentQuestion.topics.map((topic, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {currentQuestion.timeLimit && (
                      <Badge variant="secondary" className="text-xs">
                        {currentQuestion.timeLimit} min suggested
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="outlinePrimary"
                  size="sm"
                  onClick={() =>
                    onUpdateAnswer(
                      currentQuestion.id,
                      session.answers[currentQuestion.id] || ""
                    )
                  }
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Flag
                </Button>
              </div>
            </CardHeader>

            <CardContent>{renderQuestionContent(currentQuestion)}</CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outlinePrimary"
              onClick={() => onNavigate(session.currentQuestionIndex - 1)}
              disabled={session.currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex gap-2">
              {session.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={
                    index === session.currentQuestionIndex
                      ? "primary"
                      : "outlinePrimary"
                  }
                  size="sm"
                  onClick={() => onNavigate(index)}
                  className={`w-10 h-10 ${
                    session.answers[session.questions[index].id]
                      ? "bg-green-100 border-green-300"
                      : ""
                  }`}
                >
                  {index + 1}
                </Button>
              ))}
            </div>

            <Button
              variant="outlinePrimary"
              onClick={() => onNavigate(session.currentQuestionIndex + 1)}
              disabled={
                session.currentQuestionIndex === session.questions.length - 1
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewWorkspace;
