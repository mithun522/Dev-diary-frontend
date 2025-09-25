import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import { useFetchDsaProgress } from "../../../api/hooks/useFetchDsa";
import { Skeleton } from "../../../components/ui/skeleton";
import ErrorPage from "../../ErrorPage";

const TopicCoverage: React.FC = () => {
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  const { data, isLoading, isError } = useFetchDsaProgress();

  if (isError)
    return <ErrorPage message="Failed to load Topic Coverage page" />;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60 mt-1" />
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 flex justify-center items-center">
          <Skeleton className="h-60 w-60 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  const topicProgress = Object.entries(data[0]?.problemsByTopic ?? {}).map(
    ([topic, count]) => ({ topic, count })
  );

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
                  <title>{pascalizeUnderscore(topic)}</title>
                  {`${
                    topic.length > 12
                      ? pascalizeUnderscore(topic).slice(0, 8) + "…"
                      : pascalizeUnderscore(topic)
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
