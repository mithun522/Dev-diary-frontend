import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import type { DSAProblem } from "../../../data/dsaProblemsData";
import { convertToPascalCaseWithUnderscore } from "../../../utils/convertToPascalCase";

interface OverallProgressProps {
  fetchedProblems: DSAProblem[];
}

const OverallProgress: React.FC<OverallProgressProps> = ({
  fetchedProblems,
}) => {
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
                  value: fetchedProblems.filter(
                    (p: DSAProblem) => p.difficulty === "EASY"
                  ).length,
                },
                {
                  name: "MEDIUM",
                  value: fetchedProblems.filter(
                    (p: DSAProblem) => p.difficulty === "MEDIUM"
                  ).length,
                },
                {
                  name: "HARD",
                  value: fetchedProblems.filter(
                    (p: DSAProblem) => p.difficulty === "HARD"
                  ).length,
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
                  {`${convertToPascalCaseWithUnderscore(name)} ${(
                    percent * 100
                  ).toFixed(0)}%`}
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
              {
                fetchedProblems.filter(
                  (p: DSAProblem) => p.difficulty === "EASY"
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Easy</div>
          </div>
          <div>
            <div className="font-bold text-xl">
              {
                fetchedProblems.filter(
                  (p: DSAProblem) => p.difficulty === "MEDIUM"
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Medium</div>
          </div>
          <div>
            <div className="font-bold text-xl">
              {
                fetchedProblems.filter(
                  (p: DSAProblem) => p.difficulty === "HARD"
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Hard</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallProgress;
