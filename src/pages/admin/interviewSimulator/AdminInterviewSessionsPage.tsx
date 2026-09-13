import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Video, VideoOff } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import Button from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useDebounce } from "../../../api/hooks/use-debounce";
import { useFetchAdminInterviewSessions } from "../../../api/hooks/useAdminInterviewSessions";
import type { AdminSessionStatus } from "../../../api/services/adminInterviewSessions.service";
import { formatDate } from "../../../utils/formatDate";
import ErrorPage from "../../ErrorPage";

const STATUS_BADGE: Record<AdminSessionStatus, string> = {
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  abandoned: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

const candidateLabel = (
  candidate: { email: string | null; firstName: string | null; lastName: string | null }
) => {
  const name = [candidate.firstName, candidate.lastName].filter(Boolean).join(" ");
  return name || candidate.email || "Unknown candidate";
};

const AdminInterviewSessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminSessionStatus | "all">("all");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFetchAdminInterviewSessions({
    search: debouncedSearch,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const sessions = data?.pages.flatMap((page) => page.sessions) ?? [];

  if (error) return <ErrorPage message="Failed to fetch interview sessions" />;

  return (
    <div className="space-y-6" data-cy="admin-interview-sessions-page">
      <div>
        <h1 className="text-3xl font-bold">Interview Sessions</h1>
        <p className="text-muted-foreground">
          Review candidates' live interview sessions — answers, scoring, and recordings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by candidate name, email, or interview title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-cy="admin-interview-sessions-search"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as AdminSessionStatus | "all")}
        >
          <SelectTrigger
            className="w-full md:w-48"
            data-cy="admin-interview-sessions-status-trigger"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent data-cy="admin-interview-sessions-status-content">
            <SelectGroup>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table data-cy="admin-interview-sessions-table">
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Interview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Recording</TableHead>
                <TableHead>Started</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 7 }).map((_, i) => (
                      <TableCell key={i}>
                        <div className="h-8 w-full bg-gray-300 animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sessions.length > 0 ? (
                sessions.map((session) => (
                  <TableRow
                    key={session.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/admin/interview-sessions/${session.id}`)}
                    data-cy="admin-interview-sessions-row"
                  >
                    <TableCell
                      className="font-medium"
                      data-cy="admin-interview-sessions-row-candidate"
                    >
                      {candidateLabel(session.candidate)}
                    </TableCell>
                    <TableCell>{session.interview.title}</TableCell>
                    <TableCell>
                      <Badge className={STATUS_BADGE[session.status]}>
                        {session.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {session.status === "in_progress"
                        ? "—"
                        : `${session.scorePercent}% (${session.correctQuestions}/${session.totalQuestions})`}
                    </TableCell>
                    <TableCell>
                      {session.hasCameraRecording || session.hasScreenRecording ? (
                        <span
                          className="flex items-center gap-1 text-sm text-muted-foreground"
                          title={`Video ${session.videoStatus}`}
                        >
                          <Video className="h-4 w-4" />
                          {session.videoStatus}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <VideoOff className="h-4 w-4" />
                          none
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(session.startedAt)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlinePrimary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/interview-sessions/${session.id}`);
                        }}
                        data-cy="admin-interview-sessions-row-review"
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    No interview sessions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {hasNextPage && (
            <div className="flex justify-center mt-4 mb-4">
              <Button
                variant="outlinePrimary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 text-sm rounded-lg disabled:opacity-50"
                data-cy="admin-interview-sessions-load-more"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInterviewSessionsPage;
