import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import Button from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Clock,
  FileText,
  MicOff,
  Mic,
  Play,
  Star,
  Search,
  History,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "../../components/ui/table";
import {
  companyProblems,
  behavioralQuestions,
  mockInterviews,
  type MockInterview,
} from "../../data/interviewData";
import {
  interviewQuestions,
  type InterviewSession,
  type InterviewAttempt,
} from "../../data/interviewQuestions";
import InterviewStartModal from "../../components/interview/InterviewStartModal";
import InterviewWorkspace from "../../components/interview/InterviewWorkSpace";
import InterviewSubmission from "../../components/interview/InterviewSubmission";
import InterviewHistory from "../../components/interview/InterviewHistory";
import { useToast } from "../../api/hooks/use-toast";

const InterviewPage = () => {
  const [selectedCompany, setSelectedCompany] = useState("google");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  // Interview flow states
  const [selectedInterview, setSelectedInterview] =
    useState<MockInterview | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(
    null
  );
  const [currentAttempt, setCurrentAttempt] = useState<InterviewAttempt | null>(
    null
  );
  const [viewState, setViewState] = useState<
    "lobby" | "workspace" | "submission" | "history"
  >("lobby");
  const [interviewHistory, setInterviewHistory] = useState<InterviewAttempt[]>(
    []
  );

  const { toast } = useToast();

  // Load interview history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("interview-history");
    if (saved) {
      setInterviewHistory(JSON.parse(saved));
    }
  }, []);

  // Save interview history to localStorage
  const saveHistory = (history: InterviewAttempt[]) => {
    localStorage.setItem("interview-history", JSON.stringify(history));
    setInterviewHistory(history);
  };

  // Filter problems based on company and search query
  const filteredProblems = companyProblems
    .filter((problem) => problem.company === selectedCompany)
    .filter(
      (problem) =>
        searchQuery === "" ||
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

  // Filter mock interviews
  const filteredMockInterviews = mockInterviews.filter((interview) => {
    const matchesSearch =
      searchQuery === "" ||
      interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.topics.some((topic) =>
        topic.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesCategory =
      categoryFilter === "all" ||
      (categoryFilter === "technical" &&
        !interview.title.toLowerCase().includes("behavioral")) ||
      (categoryFilter === "behavioral" &&
        interview.title.toLowerCase().includes("behavioral")) ||
      (categoryFilter === "system-design" &&
        interview.topics.some(
          (topic) =>
            topic.toLowerCase().includes("system") ||
            topic.toLowerCase().includes("design")
        ));

    const matchesDifficulty =
      difficultyFilter === "all" ||
      interview.difficulty.toLowerCase() === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleStartInterview = (interview: MockInterview) => {
    setSelectedInterview(interview);
    setShowStartModal(true);
  };

  const startInterviewSession = () => {
    if (!selectedInterview) return;

    const questions = interviewQuestions[selectedInterview.id] || [];
    const session: InterviewSession = {
      id: Date.now().toString(),
      interviewId: selectedInterview.id,
      title: selectedInterview.title,
      startTime: Date.now(),
      duration: selectedInterview.duration,
      questions,
      currentQuestionIndex: 0,
      answers: {},
      status: "in_progress",
      timeRemaining: selectedInterview.duration * 60, // Convert to seconds
    };

    setCurrentSession(session);
    setShowStartModal(false);
    setViewState("workspace");

    toast({
      title: "Interview Started",
      description: `Good luck with your ${selectedInterview.title}!`,
    });
  };

  const handleUpdateAnswer = (questionId: string, answer: any) => {
    if (!currentSession) return;

    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            answers: { ...prev.answers, [questionId]: answer },
          }
        : null
    );
  };

  const handleTimeUpdate = (timeRemaining: number) => {
    if (!currentSession) return;

    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            timeRemaining,
          }
        : null
    );
  };

  const handleNavigation = (index: number) => {
    if (!currentSession) return;

    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            currentQuestionIndex: index,
          }
        : null
    );
  };

  const calculateScore = (session: InterviewSession): InterviewAttempt => {
    let correctAnswers = 0;
    const topicScores: Record<string, { correct: number; total: number }> = {};

    session.questions.forEach((question) => {
      const answer = session.answers[question.id];
      let isCorrect = false;

      // Initialize topic score
      question.topics.forEach((topic) => {
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 };
        }
        topicScores[topic].total++;
      });

      // Check answer correctness based on question type
      if (question.type === "mcq") {
        const mcq = question as any;
        isCorrect = answer === mcq.correctAnswer;
      } else if (question.type === "coding") {
        // For demo, consider answered as partially correct
        isCorrect = answer && answer.trim().length > 10;
      } else if (question.type === "descriptive") {
        // For demo, consider answered as partially correct
        isCorrect = answer && answer.trim().length > 20;
      } else if (question.type === "frontend") {
        // For demo, consider answered as partially correct
        isCorrect = answer && (answer.html || answer.css || answer.js);
      }

      if (isCorrect) {
        correctAnswers++;
        question.topics.forEach((topic) => {
          topicScores[topic].correct++;
        });
      }
    });

    return {
      id: Date.now().toString(),
      interviewId: session.interviewId,
      interviewTitle: session.title,
      startTime: session.startTime,
      endTime: Date.now(),
      score: correctAnswers,
      totalQuestions: session.questions.length,
      correctAnswers,
      status: "completed",
      topicScores,
    };
  };

  const handleSubmitInterview = () => {
    if (!currentSession) return;

    const attempt = calculateScore(currentSession);
    setCurrentAttempt(attempt);

    // Save to history
    const newHistory = [attempt, ...interviewHistory];
    saveHistory(newHistory);

    setViewState("submission");

    toast({
      title: "Interview Submitted",
      description: "Your answers have been submitted successfully!",
    });
  };

  const handleRetakeInterview = () => {
    setCurrentSession(null);
    setCurrentAttempt(null);
    setViewState("lobby");
    if (selectedInterview) {
      handleStartInterview(selectedInterview);
    }
  };

  const handleBackToHome = () => {
    setCurrentSession(null);
    setCurrentAttempt(null);
    setSelectedInterview(null);
    setViewState("lobby");
  };

  const handleSubmitFeedback = (rating: number, comment: string) => {
    if (!currentSession) return;

    setCurrentSession((prev) =>
      prev
        ? {
            ...prev,
            feedback: { rating, comment },
          }
        : null
    );

    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback!",
    });
  };

  // Early returns for different view states
  if (viewState === "workspace" && currentSession) {
    return (
      <InterviewWorkspace
        session={currentSession}
        onUpdateAnswer={handleUpdateAnswer}
        onTimeUpdate={handleTimeUpdate}
        onSubmit={handleSubmitInterview}
        onNavigate={handleNavigation}
      />
    );
  }

  if (viewState === "submission" && currentAttempt && currentSession) {
    return (
      <InterviewSubmission
        session={currentSession}
        attempt={currentAttempt}
        onRetakeInterview={handleRetakeInterview}
        onBackToHome={handleBackToHome}
        onSubmitFeedback={handleSubmitFeedback}
      />
    );
  }

  if (viewState === "history") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Interview History</h1>
            <p className="text-muted-foreground">
              Track your progress and review past interviews.
            </p>
          </div>
          <Button
            onClick={() => setViewState("lobby")}
            variant="outlinePrimary"
          >
            Back to Interviews
          </Button>
        </div>

        <InterviewHistory
          attempts={interviewHistory}
          onViewDetails={() => {
            // For demo, just show a toast
            toast({
              title: "Feature Coming Soon",
              description: "Detailed review will be available soon!",
            });
          }}
        />
      </div>
    );
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Mock Interview Platform</h1>
          <p className="text-muted-foreground">
            Practice technical and behavioral interviews with our comprehensive
            platform.
          </p>
        </div>
        <Button
          onClick={() => setViewState("history")}
          variant="outlinePrimary"
          className="flex items-center gap-2"
        >
          <History className="h-4 w-4" />
          View History
        </Button>
      </div>

      <Tabs defaultValue="mock">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="mock">Mock Interviews</TabsTrigger>
          <TabsTrigger value="company">Company Questions</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
        </TabsList>

        {/* Company-specific questions tab */}
        <TabsContent value="company" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex w-full md:w-auto gap-2">
              <Select
                value={selectedCompany}
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="amazon">Amazon</SelectItem>
                  <SelectItem value="microsoft">Microsoft</SelectItem>
                  <SelectItem value="meta">Meta</SelectItem>
                  <SelectItem value="netflix">Netflix</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-grow md:max-w-md">
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Title</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Topics</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProblems.map((problem) => (
                  <TableRow key={problem.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <a
                          href={problem.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary hover:underline"
                        >
                          {problem.title}
                        </a>
                        {problem.solved && (
                          <Badge
                            variant="outline"
                            className="bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-300"
                          >
                            Solved
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDifficultyColor(problem.difficulty)}>
                        {problem.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {problem.tags.map((tag, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant={
                            problem.solved ? "outlinePrimary" : "primary"
                          }
                        >
                          {problem.solved ? "Revisit" : "Solve"}
                        </Button>
                        <Button size="sm" variant="outlinePrimary">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Behavioral Questions tab */}
        <TabsContent value="behavioral" className="space-y-4">
          <div className="grid gap-6">
            {behavioralQuestions.map((question) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{question.question}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outlinePrimary"
                        onClick={toggleRecording}
                      >
                        {isRecording ? (
                          <MicOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                        {isRecording ? "Stop Recording" : "Record Answer"}
                      </Button>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        2-3 mins
                      </span>
                    </div>
                  </div>
                  <CardDescription>
                    Category:{" "}
                    <Badge variant="outline">{question.category}</Badge>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Your Response:
                    </label>
                    <Textarea
                      placeholder="Type your answer using the STAR method (Situation, Task, Action, Result)..."
                      className="min-h-[150px]"
                      defaultValue={question.response || ""}
                    />
                  </div>
                </CardContent>

                {question.tips && (
                  <CardFooter className="flex flex-col items-start border-t pt-4">
                    <p className="text-sm font-medium">Tips:</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5 mt-1">
                      {question.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mock Interview tab */}
        <TabsContent value="mock" className="space-y-4">
          {/* Enhanced Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search interviews, topics, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="system-design">System Design</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredMockInterviews.map((interview) => (
              <Card
                key={interview.id}
                className="flex flex-col hover:shadow-lg transition-shadow duration-200"
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
                      <Badge
                        className={getDifficultyColor(interview.difficulty)}
                      >
                        {interview.difficulty}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-sm font-medium mb-2 block">
                        Topics:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {interview.topics.map((topic, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                      <span>
                        {interviewQuestions[interview.id]?.length || 0}{" "}
                        questions
                      </span>
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

                <CardFooter className="pt-4 border-t">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => handleStartInterview(interview)}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Interview
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Interview Start Modal */}
      <InterviewStartModal
        interview={selectedInterview}
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStart={startInterviewSession}
      />
    </div>
  );
};

export default InterviewPage;
