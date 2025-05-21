import { useState } from "react";
import MainLayout from "../../components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import Button from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  dsaProblems,
  weeklyProgress,
  topicProgress,
  DifficultyLevel,
  type DSAProblem,
} from "../../data/dsaProblemsData";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { EllipsisVertical } from "lucide-react";
import AddDsaModel from "./AddDsaModel";

const DSAPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProblem, setSelectedProblem] = useState<DSAProblem | null>(
    null
  );
  const [isAddModelOpen, setIsAddModelOpen] = useState<boolean>(false);

  // Filter problems based on search query and selected filters
  const filteredProblems = dsaProblems.filter((problem: DSAProblem) => {
    const matchesSearch =
      searchQuery === "" ||
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesDifficulty =
      difficultyFilter === "all" ||
      problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      problem.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Medium":
        return "bg-amber-500";
      case "Hard":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Solved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Attempted":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      case "Unsolved":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "";
    }
  };

  // Format date to be more readable
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  // Chart colors
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">DSA Tracker</h1>
        <p className="text-muted-foreground">
          Track and manage your DSA practice problems.
        </p>
      </div>

      <Tabs defaultValue="problems">
        <TabsList className="grid grid-cols-2 md:w-[400px]">
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="problems" className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex-1">
              <Input
                placeholder="Search problems by title or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <Select
                value={difficultyFilter}
                onValueChange={setDifficultyFilter}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="solved">Solved</SelectItem>
                    <SelectItem value="attempted">Attempted</SelectItem>
                    <SelectItem value="unsolved">Unsolved</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Button variant="primary" onClick={() => setIsAddModelOpen(true)}>
                Add DSAProblem
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Solved</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((problem: DSAProblem) => (
                      <TableRow
                        key={problem.id}
                        onClick={() => setSelectedProblem(problem)}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          <a
                            href={problem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {problem.title}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getDifficultyColor(
                              problem.difficulty
                            )} text-white`}
                          >
                            {problem.difficulty}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {problem.tags.map((tag: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusVariant(problem.status)}>
                            {problem.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(problem.lastSolved)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="ghost" size="sm">
                                <EllipsisVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Mark as Solved
                              </DropdownMenuItem>
                              <DropdownMenuItem>Add Solution</DropdownMenuItem>
                              <DropdownMenuItem>Add Notes</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No problems found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {selectedProblem && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedProblem.title}
                    <Badge
                      variant="outline"
                      className={`${getDifficultyColor(
                        selectedProblem.difficulty
                      )} text-white`}
                    >
                      {selectedProblem.difficulty}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProblem(null)}
                  >
                    ×
                  </Button>
                </CardTitle>
                <CardDescription>
                  <div className="flex flex-wrap gap-1">
                    {selectedProblem.tags.map((tag: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="solution">
                  <TabsList>
                    <TabsTrigger value="solution">Solution</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="solution"
                    className="pt-4 prose prose-pre:bg-muted prose-pre:text-muted-foreground dark:prose-pre:bg-muted/80 max-w-none"
                  >
                    {selectedProblem.solution ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedProblem.solution
                            .replace(/```[a-z]*\n/g, "<pre><code>")
                            .replace(/```/g, "</code></pre>"),
                        }}
                      />
                    ) : (
                      <p>No solution added yet for this problem.</p>
                    )}
                  </TabsContent>

                  <TabsContent value="notes" className="pt-4">
                    {selectedProblem.notes ? (
                      <p>{selectedProblem.notes}</p>
                    ) : (
                      <p>No notes added yet for this problem.</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="pt-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Your problem-solving status</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Solved",
                          value: dsaProblems.filter(
                            (p: DSAProblem) => p.status === "Solved"
                          ).length,
                        },
                        {
                          name: "Attempted",
                          value: dsaProblems.filter(
                            (p: DSAProblem) => p.status === "Attempted"
                          ).length,
                        },
                        {
                          name: "Unsolved",
                          value: dsaProblems.filter(
                            (p: DSAProblem) => p.status === "Unsolved"
                          ).length,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      <Cell fill="#4ade80" />
                      <Cell fill="#fbbf24" />
                      <Cell fill="#94a3b8" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-3 gap-4 text-center mt-4">
                  <div>
                    <div className="font-bold text-xl">
                      {
                        dsaProblems.filter(
                          (p: DSAProblem) => p.status === "Solved"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Solved</div>
                  </div>
                  <div>
                    <div className="font-bold text-xl">
                      {
                        dsaProblems.filter(
                          (p: DSAProblem) => p.status === "Attempted"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Attempted
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-xl">
                      {
                        dsaProblems.filter(
                          (p: DSAProblem) => p.status === "Unsolved"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Unsolved
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>
                  Problems solved in the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={weeklyProgress}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString(undefined, {
                          weekday: "short",
                        })
                      }
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      formatter={(value) => [`${value} problems`, "Solved"]}
                      labelFormatter={(date) =>
                        new Date(date).toLocaleDateString()
                      }
                    />
                    <Bar
                      dataKey="problemsSolved"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Topic Coverage</CardTitle>
                <CardDescription>Problems solved by topic</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={topicProgress.slice(0, 5)} // Show top 5 topics
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ topic, percent }) =>
                        `${topic} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {topicProgress
                        .slice(0, 5)
                        .map(
                          (
                            _entry: { topic: string; count: number },
                            index: number
                          ) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {isAddModelOpen && (
        <AddDsaModel open={isAddModelOpen} setOpen={setIsAddModelOpen} />
      )}
    </div>
  );
};

export default DSAPage;
