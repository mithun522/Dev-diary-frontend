import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Skeleton } from "../../../components/ui/skeleton";
import { useAdminStudentsProgress } from "../../../api/hooks/useAdminProgress";
import type { AdminStudentProgress } from "../../../data/adminProgressData";
import ErrorPage from "../../ErrorPage";

const pct = (solved: number, total: number) =>
  total > 0 ? Math.round((solved / total) * 100) : 0;

// GET /admin/students/progress already returns everyone the caller can see - a plain admin's own
// invited students (via auth.users.invited_by, enforced server-side), or every user for a
// super-admin - in one response. So there's no server-side pagination to thread here; this just
// filters the already-fetched list client-side by name/email.
const StudentProgressPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useAdminStudentsProgress();

  if (isError) return <ErrorPage message="Failed to load student progress" />;

  const filtered = (data ?? []).filter((student) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    const name = `${student.firstName} ${student.lastName}`.toLowerCase();
    return name.includes(term) || student.email.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4" data-cy="admin-student-progress-page">
      <div>
        <h1 className="text-2xl font-bold">Student Progress</h1>
        <p className="text-muted-foreground text-sm">
          Curriculum and Practice completion for your students.
        </p>
      </div>

      <Input
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
        data-cy="admin-student-progress-search"
      />

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Basics</TableHead>
                <TableHead>Practice</TableHead>
                <TableHead className="text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    {search ? "No students match your search." : "No students yet."}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((student: AdminStudentProgress) => {
                  const curriculumPct = pct(
                    student.curriculum.solvedProblems,
                    student.curriculum.totalProblems
                  );
                  const catalogPct = pct(
                    student.catalog.solvedProblems,
                    student.catalog.totalProblems
                  );
                  return (
                    <TableRow key={student.userId} data-cy="admin-student-progress-row">
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell>
                        {student.curriculum.solvedProblems}/{student.curriculum.totalProblems} (
                        {curriculumPct}%)
                      </TableCell>
                      <TableCell>
                        {student.catalog.solvedProblems}/{student.catalog.totalProblems} (
                        {catalogPct}%)
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outlinePrimary"
                          className="px-3 py-1 text-sm"
                          onClick={() => navigate(`/admin/students/progress/${student.userId}`)}
                          data-cy="admin-student-progress-view-detail"
                        >
                          View detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProgressPage;
