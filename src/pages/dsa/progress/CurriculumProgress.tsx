import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Progress } from "../../../components/ui/progress";
import { Skeleton } from "../../../components/ui/skeleton";
import { useCurriculumProgress } from "../../../api/hooks/useCurriculum";
import type { CurriculumProgress as CurriculumProgressData } from "../../../data/curriculumData";
import ErrorPage from "../../ErrorPage";

// The presentational half - takes already-fetched data, no hook of its own - so the admin
// Student Progress detail view can render the exact same UI for another user's data.
export const CurriculumProgressView: React.FC<{ data: CurriculumProgressData }> = ({ data }) => (
  <Card data-cy="dsa-curriculum-progress">
    <CardHeader>
      <CardTitle>Basics Progress</CardTitle>
      <CardDescription>
        {data.solvedProblems} of {data.totalProblems} exercises solved
      </CardDescription>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
        {data.byTopic.map((topic) => {
          const pct = topic.total > 0 ? Math.round((topic.solved / topic.total) * 100) : 0;
          return (
            <div key={topic.topicId}>
              <div className="flex justify-between text-sm mb-1">
                <span>{topic.topicTitle}</span>
                <span className="text-muted-foreground">
                  {topic.solved}/{topic.total}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);

export const CurriculumProgressSkeleton: React.FC = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-4 w-56 mt-2" />
    </CardHeader>
    <CardContent className="pt-0 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </CardContent>
  </Card>
);

// The Basics (curriculum) side of the Progress tab - GET /curriculum/progress. byTopic always
// lists every curriculum topic (even 0/0 ones), in curriculum display order, so this doubles as
// a full topic checklist rather than only a chart.
const CurriculumProgress: React.FC = () => {
  const { data, isLoading, isError } = useCurriculumProgress();

  if (isError) return <ErrorPage message="Failed to load basics progress" />;
  if (isLoading || !data) return <CurriculumProgressSkeleton />;

  return <CurriculumProgressView data={data} />;
};

export default CurriculumProgress;
