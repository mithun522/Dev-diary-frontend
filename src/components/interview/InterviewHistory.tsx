import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import Button from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import {
  Calendar,
  Clock,
  Award,
  Eye,
  TrendingUp,
  BarChart3,
  Target,
} from "lucide-react";
import { type InterviewAttempt } from "../../data/interviewQuestions";

interface InterviewHistoryProps {
  attempts: InterviewAttempt[];
  onViewDetails: (attemptId: string) => void;
}

const InterviewHistory = ({
  attempts,
  onViewDetails,
}: InterviewHistoryProps) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (startTime: number, endTime?: number) => {
    if (!endTime) return "In Progress";
    const duration = Math.floor((endTime - startTime) / 1000);
    const mins = Math.floor(duration / 60);
    const secs = duration % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceTrend = () => {
    if (attempts.length < 2) return null;

    const recentAttempts = attempts
      .slice(-3)
      .map((a) => (a.score / a.totalQuestions) * 100);
    const average =
      recentAttempts.reduce((sum, score) => sum + score, 0) /
      recentAttempts.length;

    return {
      average: Math.round(average),
      isImproving:
        recentAttempts.length > 1 &&
        recentAttempts[recentAttempts.length - 1] > recentAttempts[0],
    };
  };

  const performance = getPerformanceTrend();
  const totalAttempts = attempts.length;
  const averageScore =
    totalAttempts > 0
      ? Math.round(
          (attempts.reduce((sum, a) => sum + a.score, 0) /
            totalAttempts /
            attempts.reduce((sum, a) => sum + a.totalQuestions, 0)) *
            totalAttempts *
            100
        )
      : 0;

  if (attempts.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Interview History</h3>
        <p className="text-muted-foreground">
          Complete your first interview to see your performance history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{totalAttempts}</div>
            <div className="text-sm text-muted-foreground">Total Attempts</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold">{averageScore}%</div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp
              className={`h-8 w-8 mx-auto mb-2 ${
                performance?.isImproving ? "text-green-600" : "text-yellow-600"
              }`}
            />
            <div className="text-2xl font-bold">
              {performance ? `${performance.average}%` : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">Recent Average</div>
          </CardContent>
        </Card>
      </div>

      {/* Interview History List */}
      <Card>
        <CardHeader>
          <CardTitle>Interview History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attempts.map((attempt) => {
              const scorePercentage = Math.round(
                (attempt.score / attempt.totalQuestions) * 100
              );

              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium">{attempt.interviewTitle}</h3>
                      <Badge
                        variant={
                          attempt.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {attempt.status === "completed"
                          ? "Completed"
                          : "In Progress"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(attempt.startTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(attempt.startTime, attempt.endTime)}
                      </div>
                    </div>

                    {attempt.status === "completed" && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Score:</span>
                          <span
                            className={`font-medium ${getScoreColor(
                              attempt.score,
                              attempt.totalQuestions
                            )}`}
                          >
                            {attempt.score}/{attempt.totalQuestions} (
                            {scorePercentage}%)
                          </span>
                        </div>
                        <div className="flex-1 max-w-xs">
                          <Progress value={scorePercentage} className="h-2" />
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outlinePrimary"
                    size="sm"
                    onClick={() => onViewDetails(attempt.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InterviewHistory;
