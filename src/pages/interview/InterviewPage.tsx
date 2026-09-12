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
import { Clock, FileText, MicOff, Mic, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHead,
  TableRow,
} from "../../components/ui/table";
import MockInterviewCard from "../../components/interview/MockInterviewCard";
import {
  useFetchMockInterviews,
  useFetchCompanyProblems,
  useFetchBehavioralQuestions,
} from "../../api/hooks/useAdminInterviewSimulator";

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

const InterviewPage = () => {
  const [selectedCompany, setSelectedCompany] = useState("google");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const { data: mockInterviews = [], isLoading: isLoadingMockInterviews } =
    useFetchMockInterviews();
  const { data: companyProblems = [], isLoading: isLoadingCompanyProblems } =
    useFetchCompanyProblems();
  const {
    data: behavioralQuestions = [],
    isLoading: isLoadingBehavioralQuestions,
  } = useFetchBehavioralQuestions();

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

  return (
    <div className="space-y-6" data-cy="interview-page">
      <div>
        <h1 className="text-3xl font-bold">Mock Interview Platform</h1>
        <p className="text-muted-foreground">
          Practice technical and behavioral interviews with our comprehensive
          platform.
        </p>
      </div>

      <Tabs defaultValue="mock">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="mock" data-cy="interview-tab-mock">
            Mock Interviews
          </TabsTrigger>
          <TabsTrigger value="company" data-cy="interview-tab-company">
            Company Questions
          </TabsTrigger>
          <TabsTrigger value="behavioral" data-cy="interview-tab-behavioral">
            Behavioral
          </TabsTrigger>
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

          {isLoadingCompanyProblems ? (
            <p className="text-center text-muted-foreground py-12">
              Loading company questions...
            </p>
          ) : filteredProblems.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No company questions yet.
            </p>
          ) : (
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
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant={problem.solved ? "outlinePrimary" : "primary"}
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
          )}
        </TabsContent>

        {/* Behavioral Questions tab */}
        <TabsContent value="behavioral" className="space-y-4">
          {isLoadingBehavioralQuestions ? (
            <p className="text-center text-muted-foreground py-12">
              Loading behavioral questions...
            </p>
          ) : behavioralQuestions.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No behavioral questions yet.
            </p>
          ) : (
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
          )}
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
                data-cy="interview-search"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger
                className="w-full md:w-48"
                data-cy="interview-category-filter-trigger"
              >
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="system-design">System Design</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger
                className="w-full md:w-48"
                data-cy="interview-difficulty-filter-trigger"
              >
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent data-cy="interview-difficulty-filter-content">
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoadingMockInterviews ? (
            <p className="text-center text-muted-foreground py-12">
              Loading mock interviews...
            </p>
          ) : filteredMockInterviews.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              No mock interviews yet.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMockInterviews.map((interview) => (
                <MockInterviewCard key={interview.id} interview={interview} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InterviewPage;
