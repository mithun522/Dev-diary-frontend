import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import ErrorPage from "../../ErrorPage";
import { useFetchDsaWeeklyActivity } from "../../../api/hooks/useFetchDsa";

const WeeklyActivity: React.FC = () => {
  const { data, isLoading, isError } = useFetchDsaWeeklyActivity();

  if (isError) return <ErrorPage message="Failed to load weekly activity" />;

  return (
    <Card data-cy="dsa-weekly-activity">
      <CardHeader>
        <CardTitle>Weekly Activity</CardTitle>
        <CardDescription>Problems solved in the last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-[240px] w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
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
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Bar dataKey="problemsSolved" fill="#8884d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyActivity;
