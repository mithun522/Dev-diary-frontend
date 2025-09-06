import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { convertToPascalCaseWithUnderscore } from "../../../utils/convertToPascalCase";
import type { DSAProblem } from "../../../data/dsaProblemsData";

interface OverallProgressProps {
  fetchedProblems: DSAProblem[];
}

type TopicProgress = {
  topic: string;
  count: number;
};

const TopicCoverage: React.FC<OverallProgressProps> = ({ fetchedProblems }) => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  const topicProgress: TopicProgress[] = Object.entries(
    fetchedProblems
      // flatten all topic arrays into one
      .flatMap((p: DSAProblem) => p.topics)
      // count occurrences
      .reduce<Record<string, number>>((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {})
  ).map(([topic, count]) => ({ topic, count }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Topic Coverage</CardTitle>
        <CardDescription>Problems solved by topic</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={topicProgress}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
              label={({ topic, percent, x, y, textAnchor }) => (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fontSize={10}
                  fill="#8884d8"
                >
                  <title>{convertToPascalCaseWithUnderscore(topic)}</title>
                  {`${
                    topic.length > 12
                      ? convertToPascalCaseWithUnderscore(topic).slice(0, 8) +
                        "…"
                      : convertToPascalCaseWithUnderscore(topic)
                  }`}{" "}
                  {`${(percent * 100).toFixed(0)}%`}
                </text>
              )}
            >
              {topicProgress.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TopicCoverage;
