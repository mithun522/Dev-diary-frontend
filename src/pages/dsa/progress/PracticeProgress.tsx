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

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "#4ade80",
  MEDIUM: "#fbbf24",
  HARD: "#ef4444",
};

// The Practice (catalog) side of the Progress tab - GET /catalog/progress, byDifficulty is
// always exactly the 3 EASY/MEDIUM/HARD entries, even at 0/0.
const PracticeProgress: React.FC = () => {
  const { data, isLoading, isError } = useCatalogProgress();

  if (isError) return <ErrorPage message="Failed to load practice progress" />;

  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex justify-center">
            <Skeleton className="h-40 w-40 rounded-full" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-6 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-cy="dsa-practice-progress">
      <CardHeader>
        <CardTitle>Practice Progress</CardTitle>
        <CardDescription>
          {data.solvedProblems} of {data.totalProblems} problems solved
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {data.solvedProblems === 0 ? (
          <div className="h-[240px] flex items-center justify-center text-sm text-muted-foreground">
            No problems solved yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={data.byDifficulty.map((d) => ({
                  name: d.difficulty,
                  value: d.solved,
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                dataKey="value"
                label={({ name, percent, x, y, textAnchor }) => (
                  <text
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    fontSize={13}
                    fill={DIFFICULTY_COLORS[name] ?? "#8884d8"}
                  >
                    {`${pascalizeUnderscore(name)} ${(percent * 100).toFixed(0)}%`}
                  </text>
                )}
              >
                {data.byDifficulty.map((d) => (
                  <Cell key={d.difficulty} fill={DIFFICULTY_COLORS[d.difficulty] ?? "#8884d8"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}

        <div className="grid grid-cols-3 gap-4 text-center mt-4">
          {data.byDifficulty.map((d) => (
            <div key={d.difficulty}>
              <div className="font-bold text-xl">
                {d.solved}/{d.total}
              </div>
              <div className="text-sm text-muted-foreground">
                {pascalizeUnderscore(d.difficulty)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeProgress;
