import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import { useCatalogProgress } from "../../../api/hooks/useFetchCatalog";
import { Skeleton } from "../../../components/ui/skeleton";
import ErrorPage from "../../ErrorPage";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

// byTopic only lists topics that at least one catalog problem actually has - not a fixed enum,
// so this only ever shows topics with real content (see CatalogProgress's own doc comment).
const PracticeTopicCoverage: React.FC = () => {
  const { data, isLoading, isError } = useCatalogProgress();

  if (isError) return <ErrorPage message="Failed to load topic coverage" />;

  if (isLoading || !data) {
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

  const solvedByTopic = data.byTopic.filter((t) => t.solved > 0);

  return (
    <Card data-cy="dsa-practice-topic-coverage">
      <CardHeader>
        <CardTitle>Topic Coverage</CardTitle>
        <CardDescription>Practice problems solved by topic</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {solvedByTopic.length === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
            No problems solved yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={solvedByTopic}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="solved"
                nameKey="topic"
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
                {solvedByTopic.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                formatter={(value: number, _name, item) => [
                  `${value}/${item.payload.total} solved`,
                  pascalizeUnderscore(item.payload.topic),
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PracticeTopicCoverage;
