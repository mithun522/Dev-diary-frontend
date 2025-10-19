import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Button from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  Clock,
  Star,
  BarChart3,
  Award,
  Home,
  RotateCcw,
} from "lucide-react";
import {
  type InterviewSession,
  type InterviewAttempt,
} from "../../data/interviewQuestions";

interface InterviewSubmissionProps {
  session: InterviewSession;
  attempt: InterviewAttempt;
  onRetakeInterview: () => void;
  onBackToHome: () => void;
  onSubmitFeedback: (rating: number, comment: string) => void;
}

const InterviewSubmission = ({
  session,
  attempt,
  onRetakeInterview,
  onBackToHome,
  onSubmitFeedback,
}: InterviewSubmissionProps) => {
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: "",
  });

  const timeTaken = attempt.endTime
    ? Math.floor((attempt.endTime - attempt.startTime) / 1000)
    : 0;
  const timeAllocated = session.duration * 60;
  const scorePercentage = Math.round(
    (attempt.score / attempt.totalQuestions) * 100
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90)
      return { message: "Excellent! Outstanding performance!", icon: "🏆" };
    if (percentage >= 80)
      return { message: "Great job! Well done!", icon: "🎉" };
    if (percentage >= 70)
      return { message: "Good work! Keep practicing!", icon: "👍" };
    if (percentage >= 60)
      return { message: "Not bad! Room for improvement.", icon: "💪" };
    return { message: "Keep practicing! You'll get better!", icon: "📚" };
  };

  const performance = getPerformanceMessage(scorePercentage);
  const topicEntries = Object.entries(attempt.topicScores);

  const handleStarClick = (rating: number) => {
    setFeedback((prev) => ({ ...prev, rating }));
  };

  const submitFeedback = () => {
    onSubmitFeedback(feedback.rating, feedback.comment);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <Award className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
            <p className="text-lg text-muted-foreground">{session.title}</p>
          </div>

          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getScoreColor(
                  scorePercentage
                )}`}
              >
                {scorePercentage}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
            </div>
            <div className="text-6xl">{performance.icon}</div>
            <div className="text-center">
              <div className="text-lg font-medium">{performance.message}</div>
              <div className="text-sm text-muted-foreground">
                {attempt.correctAnswers} of {attempt.totalQuestions} correct
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {attempt.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">
                Correct Answers
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-600">
                {attempt.totalQuestions - attempt.correctAnswers}
              </div>
              <div className="text-sm text-muted-foreground">
                Incorrect Answers
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeTaken)}
              </div>
              <div className="text-sm text-muted-foreground">
                Time Taken (of {formatTime(timeAllocated)})
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="performance" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
            <TabsTrigger value="feedback">Leave Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            {/* Topic-wise Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Topic-wise Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topicEntries.map(([topic, score]) => {
                    const percentage = Math.round(
                      (score.correct / score.total) * 100
                    );
                    return (
                      <div key={topic} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{topic}</span>
                          <span className="text-sm text-muted-foreground">
                            {score.correct}/{score.total} ({percentage}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Time Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Time Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Time Utilized</span>
                    <span className="font-medium">
                      {formatTime(timeTaken)} / {formatTime(timeAllocated)}
                    </span>
                  </div>
                  <Progress
                    value={(timeTaken / timeAllocated) * 100}
                    className="h-2"
                  />
                  <div className="text-sm text-muted-foreground">
                    {timeTaken < timeAllocated * 0.5
                      ? "You finished quickly! Consider reviewing your answers more thoroughly next time."
                      : timeTaken > timeAllocated * 0.9
                      ? "You used most of the time. Work on time management for better performance."
                      : "Good time management! You used the allocated time effectively."}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rate This Interview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-8 w-8 cursor-pointer transition-colors ${
                        star <= feedback.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground hover:text-yellow-400"
                      }`}
                      onClick={() => handleStarClick(star)}
                    />
                  ))}
                </div>

                <Textarea
                  placeholder="Share your thoughts about this interview (optional)..."
                  value={feedback.comment}
                  onChange={(e) =>
                    setFeedback((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }))
                  }
                  className="min-h-[100px]"
                />

                <Button
                  onClick={submitFeedback}
                  disabled={feedback.rating === 0}
                  className="w-full"
                >
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onRetakeInterview}
            variant="outlinePrimary"
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Interview
          </Button>
          <Button onClick={onBackToHome} size="lg">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewSubmission;
