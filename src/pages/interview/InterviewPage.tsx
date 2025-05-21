import { useState } from "react";
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
import { Clock, FileText, MicOff, Mic, Play, Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "../../components/ui/table";
import { Search } from "lucide-react";
import {
  behavioralQuestions,
  companyProblems,
  mockInterviews,
  type BehavioralQuestion,
  type CompanyProblem,
  type MockInterview,
} from "../../data/interviewData";

const InterviewPage = () => {
  const [selectedCompany, setSelectedCompany] = useState("google");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [activeInterview, setActiveInterview] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  // Filter problems based on company and search query
  const filteredProblems = companyProblems
    .filter((problem: CompanyProblem) => problem.company === selectedCompany)
    .filter(
      (problem: CompanyProblem) =>
        searchQuery === "" ||
        problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        problem.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const startInterview = (id: string) => {
    setActiveInterview(id);
    setTimer(900); // 15 minutes in seconds
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Interview Prep</h1>
        <p className="text-muted-foreground">
          Practice for technical and behavioral interviews.
        </p>
      </div>

      <Tabs defaultValue="company">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="company">Company Questions</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="mock">Mock Interview</TabsTrigger>
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
                {filteredProblems.map((problem: CompanyProblem) => (
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
                        {problem.tags.map((tag: string, idx: number) => (
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
                          variant={problem.solved ? "outlinePrimary" : "light"}
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
            {behavioralQuestions.map((question: BehavioralQuestion) => (
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
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockInterviews.map((interview: MockInterview) => (
              <Card key={interview.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between">
                    <span>{interview.title}</span>
                    <Badge>{interview.duration} mins</Badge>
                  </CardTitle>
                  <CardDescription>{interview.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Difficulty:</span>
                      <Badge
                        className={getDifficultyColor(interview.difficulty)}
                      >
                        {interview.difficulty}
                      </Badge>
                    </div>

                    <div>
                      <span className="text-sm font-medium">Topics:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
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
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t flex justify-between">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= interview.rating
                            ? "fill-yellow-400"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    variant={
                      activeInterview === interview.id
                        ? "outlinePrimary"
                        : "info"
                    }
                    onClick={() => startInterview(interview.id)}
                  >
                    {activeInterview === interview.id ? (
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTime(timer)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Start
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewPage;
