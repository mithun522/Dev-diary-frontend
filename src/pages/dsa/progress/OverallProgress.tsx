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

const OverallProgress: React.FC = () => {
  const { data, isLoading, isError } = useFetchDsaProgress();

  if (isError) return <ErrorPage message="Failed to load user profile" />;

  if (isLoading) {
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
                  name: "Easy",
                  value: data[0].problemsByDifficulty.easy,
                },
                {
                  name: "MEDIUM",
                  value: data[0].problemsByDifficulty.medium,
                },
                {
                  name: "HARD",
                  value: data[0].problemsByDifficulty.hard,
                },
              ]}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent, x, y, textAnchor }) => (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fontSize={13}
                  fill={
                    name === "HARD"
                      ? "#ef4444"
                      : name === "MEDIUM"
                      ? "#fbbf24"
                      : "#4ade80"
                  }
                >
                  {`${pascalizeUnderscore(name)} ${(percent * 100).toFixed(
                    0
                  )}%`}
                </text>
              )}
            >
              <Cell fill="#4ade80" />
              <Cell fill="#fbbf24" />
              <Cell fill="#ef4444" />
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-3 gap-4 text-center mt-4">
          <div>
            <div className="font-bold text-xl">
              {data[0].problemsByDifficulty.easy}
            </div>
            <div className="text-sm text-muted-foreground">Easy</div>
          </div>
          <div>
            <div className="font-bold text-xl">
              {data[0].problemsByDifficulty.medium}
            </div>
            <div className="text-sm text-muted-foreground">Medium</div>
          </div>
          <div>
            <div className="font-bold text-xl">
              {data[0].problemsByDifficulty.hard}
            </div>
            <div className="text-sm text-muted-foreground">Hard</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallProgress;
