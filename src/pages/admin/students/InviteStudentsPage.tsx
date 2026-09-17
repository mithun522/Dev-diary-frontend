import { useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Textarea } from "../../../components/ui/textarea";
import Button from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import type { InviteStudentsResult } from "../../../api/services/invites.service";
import {
  useInviteStudents,
  useListInvites,
  useResendInvite,
  useSeatUsage,
} from "../../../api/hooks/useInvites";
import { formatDate } from "../../../utils/formatDate";
import { logger } from "../../../utils/logger";
import ErrorPage from "../../ErrorPage";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

// Splits on commas/whitespace/newlines so a pasted CSV column, a comma-separated line, or one
// email per line all work the same way.
const parseEmails = (raw: string): string[] =>
  Array.from(new Set(raw.split(/[\s,]+/).map((e) => e.trim()).filter(Boolean)));

const RESULT_STATUS_LABEL: Record<InviteStudentsResult["status"], string> = {
  invited: "Invited",
  alreadyExists: "Already exists",
  emailFailed: "Email failed",
};

const InviteStudentsPage: React.FC = () => {
  const [emailsInput, setEmailsInput] = useState("");
  const [lastResults, setLastResults] = useState<InviteStudentsResult[]>([]);

  const inviteStudentsMutation = useInviteStudents();
  const resendInviteMutation = useResendInvite();
  const { data: seatUsage, isLoading: isLoadingSeatUsage, error: seatUsageError } = useSeatUsage();
  const { data: invites, isLoading: isLoadingInvites } = useListInvites();

  const pendingStudentInvites = (invites ?? []).filter(
    (invite) => invite.role === "user" && invite.status !== "accepted"
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = parseEmails(emailsInput);
    if (emails.length === 0) {
      toast.error("Enter at least one email address");
      return;
    }

    inviteStudentsMutation.mutate(emails, {
      onSuccess: (result) => {
        setLastResults(result.results);
        toast.success(result.message);
        setEmailsInput("");
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to invite students"));
        logger.error("Error inviting students:", err);
      },
    });
  };

  const handleResend = (inviteId: string) => {
    resendInviteMutation.mutate(inviteId, {
      onSuccess: () => toast.success("Invite resent"),
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to resend invite"));
        logger.error("Error resending invite:", err);
      },
    });
  };

  if (seatUsageError) return <ErrorPage message="Failed to fetch seat usage" />;

  return (
    <div className="space-y-6" data-cy="invite-students-page">
      <div>
        <h1 className="text-3xl font-bold">Invite Students</h1>
        <p className="text-muted-foreground">
          Invite students by email. You can invite more than your seat limit — whoever accepts
          first fills the available seats.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoadingSeatUsage ? (
            <div className="h-6 w-40 bg-gray-300 animate-pulse rounded" />
          ) : (
            <p className="text-sm" data-cy="seat-usage-banner">
              Seat usage:{" "}
              <span className="font-semibold">
                {seatUsage?.seatUsed ?? 0} / {seatUsage?.seatLimit ?? "∞"}
              </span>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <form onSubmit={handleInvite} className="space-y-3">
            <Textarea
              placeholder="student1@college.edu, student2@college.edu&#10;or one per line"
              value={emailsInput}
              onChange={(e) => setEmailsInput(e.target.value)}
              className="min-h-[120px]"
              data-cy="invite-students-emails"
            />
            <Button
              type="submit"
              disabled={inviteStudentsMutation.isPending}
              data-cy="invite-students-submit"
            >
              {inviteStudentsMutation.isPending ? "Inviting..." : "Invite Students"}
            </Button>
          </form>

          {lastResults.length > 0 && (
            <Table data-cy="invite-students-results-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lastResults.map((result) => (
                  <TableRow key={result.email}>
                    <TableCell>{result.email}</TableCell>
                    <TableCell>
                      <Badge variant={result.status === "invited" ? "default" : "secondary"}>
                        {RESULT_STATUS_LABEL[result.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-2">Pending Student Invites</h2>
        <Card>
          <CardContent className="p-0">
            <Table data-cy="pending-student-invites-table">
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingInvites ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <div className="h-8 w-full bg-gray-300 animate-pulse rounded" />
                    </TableCell>
                  </TableRow>
                ) : pendingStudentInvites.length > 0 ? (
                  pendingStudentInvites.map((invite) => (
                    <TableRow key={invite.id} data-cy="pending-student-invite-row">
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>
                        <Badge variant={invite.status === "pending" ? "default" : "secondary"}>
                          {invite.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invite.expiresAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlinePrimary"
                          size="sm"
                          disabled={resendInviteMutation.isPending}
                          onClick={() => handleResend(invite.id)}
                          data-cy="resend-invite-button"
                        >
                          Resend
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6">
                      No pending student invites.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InviteStudentsPage;
