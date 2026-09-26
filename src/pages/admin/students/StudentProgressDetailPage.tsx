import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../../components/ui/button";
import { useAdminStudentProgress } from "../../../api/hooks/useAdminProgress";
import {
  CurriculumProgressView,
  CurriculumProgressSkeleton,
} from "../../dsa/progress/CurriculumProgress";
import { PracticeProgressView, PracticeProgressSkeleton } from "../../dsa/progress/PracticeProgress";
import {
  PracticeTopicCoverageView,
  PracticeTopicCoverageSkeleton,
} from "../../dsa/progress/PracticeTopicCoverage";
import ErrorPage from "../../ErrorPage";

// Renders the exact same Progress-tab visual components a student sees for themselves, fed by
// GET /admin/students/{id}/progress instead of the self-service endpoints - see the presentational
// (*View) exports those three components added specifically for this reuse.
const StudentProgressDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useAdminStudentProgress(userId);

  if (isError) return <ErrorPage message="Failed to load this student's progress" />;

  return (
    <div className="space-y-4" data-cy="admin-student-progress-detail-page">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="px-2 py-1 text-sm flex items-center gap-1"
        data-cy="admin-student-progress-detail-back"
      >
        <ArrowLeft size={16} />
        Back
      </Button>

      {data && (
        <div>
          <h1 className="text-2xl font-bold">
            {data.firstName} {data.lastName}
          </h1>
          <p className="text-muted-foreground text-sm">{data.email}</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {isLoading || !data ? (
          <>
            <CurriculumProgressSkeleton />
            <PracticeProgressSkeleton />
            <PracticeTopicCoverageSkeleton />
          </>
        ) : (
          <>
            <CurriculumProgressView data={data.curriculum} />
            <PracticeProgressView data={data.catalog} />
            <PracticeTopicCoverageView data={data.catalog} />
          </>
        )}
      </div>
    </div>
  );
};

export default StudentProgressDetailPage;
