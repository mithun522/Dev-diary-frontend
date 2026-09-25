import { useRef, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { Upload } from "lucide-react";
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
import { Input } from "../../../components/ui/input";
import Button from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import type { Invite, InviteStudentsResult } from "../../../api/services/invites.service";
import {
  useInviteStudents,
  useListInvites,
  useResendInvite,
  useRevokeInvite,
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Deliberately tolerant of shape — a single email-per-line file, a one-column export, or a
// multi-column roster (name, email, id, ...) with or without a header row. Rather than requiring
// a specific "email" column, every cell across every row is tested against an email pattern, so
// whichever column holds addresses is picked up and any header row/non-email columns are ignored.
const extractEmailsFromCsvRows = (rows: string[][]): string[] =>
  Array.from(
    new Set(
      rows
        .flat()
        .map((cell) => cell.trim())
        .filter((cell) => EMAIL_PATTERN.test(cell))
    )
  );

const RESULT_STATUS_LABEL: Record<InviteStudentsResult["status"], string> = {
  invited: "Invited",
  alreadyExists: "Already exists",
  emailFailed: "Email failed",
};

const InviteStudentsPage: React.FC = () => {
  const [emailsInput, setEmailsInput] = useState("");
  const [lastResults, setLastResults] = useState<InviteStudentsResult[]>([]);
  const [isParsingCsv, setIsParsingCsv] = useState(false);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const inviteStudentsMutation = useInviteStudents();
  const resendInviteMutation = useResendInvite();
  const revokeInviteMutation = useRevokeInvite();
  const { data: seatUsage, isLoading: isLoadingSeatUsage, error: seatUsageError } = useSeatUsage();
  const { data: invites, isLoading: isLoadingInvites } = useListInvites();
  const [inviteToRevoke, setInviteToRevoke] = useState<Invite | null>(null);

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

  const handleCsvSelect = (file: File) => {
    setIsParsingCsv(true);
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsingCsv(false);
        const emails = extractEmailsFromCsvRows(results.data);
        if (emails.length === 0) {
          toast.error("No email addresses found in that CSV");
          return;
        }
        setEmailsInput((prev) => parseEmails(`${prev}\n${emails.join("\n")}`).join("\n"));
        toast.success(`Added ${emails.length} email${emails.length === 1 ? "" : "s"} from CSV`);
      },
      error: (err) => {
        setIsParsingCsv(false);
        toast.error("Failed to parse CSV file");
        logger.error("Error parsing student CSV:", err);
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

  const handleRevoke = () => {
    if (!inviteToRevoke) return;
    revokeInviteMutation.mutate(inviteToRevoke.id, {
      onSuccess: () => {
        toast.success("Invite revoked");
        setInviteToRevoke(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to revoke invite"));
        logger.error("Error revoking invite:", err);
        setInviteToRevoke(null);
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
            <Skeleton className="h-6 w-40" />
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

            <div className="flex items-center gap-3">
              <Input
                ref={csvInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCsvSelect(file);
                  e.target.value = "";
                }}
                data-cy="invite-students-csv-input"
              />
              <Button
                type="button"
                variant="outlinePrimary"
                size="sm"
                className="flex items-center gap-2"
                disabled={isParsingCsv}
                onClick={() => csvInputRef.current?.click()}
                data-cy="invite-students-csv-button"
              >
                <Upload className="h-3.5 w-3.5" />
                {isParsingCsv ? "Reading CSV..." : "Upload CSV"}
              </Button>
              <p className="text-xs text-muted-foreground">
                Any CSV with student emails — one column or a full roster, header row optional.
              </p>
            </div>

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
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <TableCell key={i}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
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
                      <TableCell className="flex gap-2 justify-end">
                        <Button
                          variant="outlinePrimary"
                          size="sm"
                          disabled={resendInviteMutation.isPending}
                          onClick={() => handleResend(invite.id)}
                          data-cy="resend-invite-button"
                        >
                          Resend
                        </Button>
                        <Button
                          variant="outlineDanger"
                          size="sm"
                          disabled={revokeInviteMutation.isPending}
                          onClick={() => setInviteToRevoke(invite)}
                          data-cy="revoke-invite-button"
                        >
                          Revoke
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

      {inviteToRevoke && (
        <AskForConfirmationModal
          showDelete
          title="Revoke Invite"
          message={`Are you sure you want to revoke the invite sent to "${inviteToRevoke.email}"? Its link will stop working immediately, and this email can be invited again right away.`}
          onCancel={() => setInviteToRevoke(null)}
          onDelete={handleRevoke}
          isDeleting={revokeInviteMutation.isPending}
        />
      )}
    </div>
  );
};

export default InviteStudentsPage;
