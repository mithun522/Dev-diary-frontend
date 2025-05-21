import { useState, type JSX } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Calendar } from "../../components/ui/calendar";
import {
  Clock,
  Calendar as CalendarIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  analyticsData,
  skillsData,
  practiceLog,
  type SkillCategory,
} from "../../data/analyticsData";

const AnalyticsPage = () => {
  const [timeframe, setTimeframe] = useState("week");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedCategory, setSelectedCategory] =
    useState<SkillCategory>("all");

  // Colors for charts
  const COLORS = [
    "#8B5CF6",
    "#D946EF",
    "#F97316",
    "#0EA5E9",
    "#22C55E",
    "#EAB308",
  ];

  // Filter data based on selected timeframe
  const filteredData = analyticsData.filter((data) => {
    if (timeframe === "week") return true;
    if (timeframe === "month") return data.day > new Date().getDate() - 30;
    return data.day > new Date().getDate() - 90;
  });

  // Filter skills data based on selected category
  const filteredSkills =
    selectedCategory === "all"
      ? skillsData
      : skillsData.filter((skill) => skill.category === selectedCategory);

  // Calculate streak data
  const currentStreak = 12; // Days in a row with activity
  const longestStreak = 23; // Longest consecutive days with activity
  const totalPracticeHours = practiceLog.reduce(
    (sum, log) => sum + log.timeSpent,
    0
  );
  const averagePerDay =
    Math.round((totalPracticeHours / practiceLog.length) * 10) / 10;

  // Format total time spent into readable format
  const formatTimeSpent = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  // Calculate time allocation by category
  const timeByCategory = practiceLog.reduce((acc, log) => {
    acc[log.category] = (acc[log.category] || 0) + log.timeSpent;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.keys(timeByCategory).map((category) => ({
    name: category,
    value: timeByCategory[category],
  }));

  // Suggestion logic based on skills data
  const getWeakestSkills = () => {
    const sortedSkills = [...skillsData].sort(
      (a, b) => a.proficiency - b.proficiency
    );
    return sortedSkills.slice(0, 3);
  };

  const weakestSkills = getWeakestSkills();

  // Date formatting helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const CategoryIcon = ({ category }: { category: string }): JSX.Element => {
    const iconMap: Record<string, LucideIcon> = {
      DSA: BarChartIcon,
      "System Design": PieChartIcon,
      Frontend: CalendarIcon,
      Backend: Clock,
      Interview: Target,
    };

    const Icon = iconMap[category] || BarChartIcon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your progress and identify areas for improvement.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Streak
            </CardTitle>
            <div className="h-4 w-4 text-orange-500">🔥</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak} days</div>
            <p className="text-xs text-muted-foreground">
              Longest: {longestStreak} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Problems Solved
            </CardTitle>
            <BarChartIcon className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">152</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+6</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTimeSpent(totalPracticeHours)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {averagePerDay}h per day
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mock Interviews
            </CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">+2</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Activity Charts */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Overview</CardTitle>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="dsa"
                  stroke="#8B5CF6"
                  name="DSA"
                />
                <Line
                  type="monotone"
                  dataKey="system"
                  stroke="#F97316"
                  name="System Design"
                />
                <Line
                  type="monotone"
                  dataKey="interview"
                  stroke="#0EA5E9"
                  name="Interview"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#8B5CF6] mr-2"></div>
                <span className="text-sm">DSA</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#F97316] mr-2"></div>
                <span className="text-sm">System Design</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#0EA5E9] mr-2"></div>
                <span className="text-sm">Interview</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Practice Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Practice Calendar</CardTitle>
            <CardDescription>Track your daily coding habit</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow"
            />
            <div className="mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Activity Level</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="flex gap-1">
                  <div className="w-4 h-4 bg-muted rounded"></div>
                  <div className="w-4 h-4 bg-primary/30 rounded"></div>
                  <div className="w-4 h-4 bg-primary/50 rounded"></div>
                  <div className="w-4 h-4 bg-primary/70 rounded"></div>
                  <div className="w-4 h-4 bg-primary rounded"></div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Less → More
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Heatmap */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Skills Proficiency Heatmap</CardTitle>
              <Select
                value={selectedCategory}
                onValueChange={(value) =>
                  setSelectedCategory(value as SkillCategory)
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="algorithms">Algorithms</SelectItem>
                  <SelectItem value="data-structures">
                    Data Structures
                  </SelectItem>
                  <SelectItem value="system-design">System Design</SelectItem>
                  <SelectItem value="languages">Languages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {filteredSkills.map((skill) => {
                let bgColor;
                if (skill.proficiency < 30)
                  bgColor = "bg-red-100 dark:bg-red-900/40";
                else if (skill.proficiency < 60)
                  bgColor = "bg-yellow-100 dark:bg-yellow-900/40";
                else bgColor = "bg-green-100 dark:bg-green-900/40";

                let textColor;
                if (skill.proficiency < 30)
                  textColor = "text-red-800 dark:text-red-300";
                else if (skill.proficiency < 60)
                  textColor = "text-yellow-800 dark:text-yellow-300";
                else textColor = "text-green-800 dark:text-green-300";

                return (
                  <div
                    key={skill.name}
                    className={`p-3 rounded-md ${bgColor} relative`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${textColor}`}>
                        {skill.name}
                      </span>
                      <Badge variant="outline" className={textColor}>
                        {skill.proficiency}%
                      </Badge>
                    </div>
                    <div className="mt-1 bg-background/80 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${
                          skill.proficiency < 30
                            ? "bg-red-600"
                            : skill.proficiency < 60
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${skill.proficiency}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Time Allocation */}
        <Card>
          <CardHeader>
            <CardTitle>Time Allocation</CardTitle>
            <CardDescription>How you distribute your practice</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
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
                  {categoryData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Practice Log */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {practiceLog.slice(0, 5).map((log) => (
                <div key={log.id} className="flex">
                  <div className="mr-4 flex items-center justify-center rounded-full bg-muted p-1">
                    <CategoryIcon category={log.category} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{log.activity}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.date)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeSpent(log.timeSpent)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Focus Areas */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Suggested Focus Areas</CardTitle>
            <CardDescription>
              Based on your activity and proficiency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Current Level</TableHead>
                  <TableHead>Recommended Practice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weakestSkills.map((skill) => (
                  <TableRow key={skill.name}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{skill.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-16 bg-muted rounded-full h-1.5 mr-2">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{skill.proficiency}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{skill.recommendedPractice}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Stats</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Stats</TabsTrigger>
          <TabsTrigger value="topics">Topic Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Problem Solving Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: "Mon", easy: 2, medium: 1, hard: 0 },
                    { name: "Tue", easy: 1, medium: 2, hard: 0 },
                    { name: "Wed", easy: 3, medium: 0, hard: 0 },
                    { name: "Thu", easy: 0, medium: 2, hard: 1 },
                    { name: "Fri", easy: 2, medium: 1, hard: 1 },
                    { name: "Sat", easy: 4, medium: 2, hard: 0 },
                    { name: "Sun", easy: 1, medium: 3, hard: 2 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="easy" name="Easy" fill="#22C55E" />
                  <Bar dataKey="medium" name="Medium" fill="#EAB308" />
                  <Bar dataKey="hard" name="Hard" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    { name: "Week 1", problems: 12, hours: 8 },
                    { name: "Week 2", problems: 19, hours: 12 },
                    { name: "Week 3", problems: 15, hours: 10 },
                    { name: "Week 4", problems: 21, hours: 14 },
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar
                    yAxisId="left"
                    dataKey="problems"
                    name="Problems Solved"
                    fill="#8B5CF6"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="hours"
                    name="Hours Practiced"
                    fill="#0EA5E9"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Topic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={[
                    { name: "Arrays", value: 28 },
                    { name: "Strings", value: 22 },
                    { name: "Trees", value: 16 },
                    { name: "Dynamic Programming", value: 12 },
                    { name: "Graphs", value: 9 },
                    { name: "Hash Tables", value: 24 },
                    { name: "Linked Lists", value: 18 },
                    { name: "Heaps", value: 6 },
                    { name: "Recursion", value: 14 },
                  ]}
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Bar dataKey="value" name="Problems Solved" fill="#D946EF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
