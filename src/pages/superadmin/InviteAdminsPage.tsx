import { useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import Button from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import AskForConfirmationModal from "../../components/AskForConfirmationModal";
import {
  useInviteAdmin,
  useListAdmins,
  useListInvites,
  useResendInvite,
  useRevokeInvite,
  useUpdateAdminSeatLimit,
} from "../../api/hooks/useInvites";
import type { Invite } from "../../api/services/invites.service";
import { formatDate } from "../../utils/formatDate";
import { logger } from "../../utils/logger";
import ErrorPage from "../ErrorPage";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const InviteAdminsPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [seatLimit, setSeatLimit] = useState("10");
  const [seatLimitDrafts, setSeatLimitDrafts] = useState<Record<string, string>>({});

  const inviteAdminMutation = useInviteAdmin();
  const updateSeatLimitMutation = useUpdateAdminSeatLimit();
  const resendInviteMutation = useResendInvite();
  const revokeInviteMutation = useRevokeInvite();
  const { data: admins, isLoading: isLoadingAdmins, error: adminsError } = useListAdmins();
  const { data: invites, isLoading: isLoadingInvites } = useListInvites();
  const [inviteToRevoke, setInviteToRevoke] = useState<Invite | null>(null);

  const pendingAdminInvites = (invites ?? []).filter(
    (invite) => invite.role === "admin" && invite.status !== "accepted"
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedSeatLimit = Number(seatLimit);
    if (!email.trim()) {
      toast.error("Enter an email address");
      return;
    }
    if (!Number.isInteger(parsedSeatLimit) || parsedSeatLimit < 1) {
      toast.error("Seat limit must be a whole number of at least 1");
      return;
    }

    inviteAdminMutation.mutate(
      { email: email.trim(), seatLimit: parsedSeatLimit },
      {
        onSuccess: () => {
          toast.success(`Invited ${email.trim()} as an admin`);
          setEmail("");
          setSeatLimit("10");
        },
        onError: (err) => {
          toast.error(errorMessage(err, "Failed to invite admin"));
          logger.error("Error inviting admin:", err);
        },
      }
    );
  };

  const handleSeatLimitSave = (adminId: string) => {
    const draft = seatLimitDrafts[adminId];
    const parsed = Number(draft);
    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error("Seat limit must be a whole number of 0 or more");
      return;
    }

    updateSeatLimitMutation.mutate(
      { adminId, seatLimit: parsed },
      {
        onSuccess: () => toast.success("Seat limit updated"),
        onError: (err) => {
          toast.error(errorMessage(err, "Failed to update seat limit"));
          logger.error("Error updating seat limit:", err);
        },
        onSettled: () => {
          setSeatLimitDrafts((prev) => {
            const next = { ...prev };
            delete next[adminId];
            return next;
          });
        },
      }
    );
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

  if (adminsError) return <ErrorPage message="Failed to fetch admins" />;

  return (
    <div className="space-y-6" data-cy="invite-admins-page">
      <div>
        <h1 className="text-3xl font-bold">Invite Admins</h1>
        <p className="text-muted-foreground">
          Invite someone to be an org admin with a fixed number of student seats.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3">
            <div className="space-y-2 flex-1 min-w-[240px]">
              <label className="text-sm font-medium" htmlFor="invite-admin-email">
                Email
              </label>
              <Input
                id="invite-admin-email"
                type="email"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-cy="invite-admin-email"
              />
            </div>
            <div className="space-y-2 w-32">
              <label className="text-sm font-medium" htmlFor="invite-admin-seat-limit">
                Seat limit
              </label>
              <Input
                id="invite-admin-seat-limit"
                type="number"
                min={1}
                value={seatLimit}
                onChange={(e) => setSeatLimit(e.target.value)}
                data-cy="invite-admin-seat-limit"
              />
            </div>
            <Button
              type="submit"
              disabled={inviteAdminMutation.isPending}
              data-cy="invite-admin-submit"
            >
              {inviteAdminMutation.isPending ? "Inviting..." : "Invite Admin"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table data-cy="admins-table">
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Seat usage</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingAdmins ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <TableCell key={i}>
                        <div className="h-8 w-full bg-gray-300 animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : admins && admins.length > 0 ? (
                admins.map((admin) => (
                  <TableRow key={admin.id} data-cy="admins-row">
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>
                      {admin.firstName ? `${admin.firstName} ${admin.lastName}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={admin.status === "active" ? "default" : "secondary"}>
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>
                          {admin.seatUsed} / {admin.seatLimit ?? "∞"}
                        </span>
                        <Input
                          type="number"
                          min={admin.seatUsed}
                          className="w-20"
                          placeholder={String(admin.seatLimit ?? "")}
                          value={seatLimitDrafts[admin.id] ?? ""}
                          onChange={(e) =>
                            setSeatLimitDrafts((prev) => ({
                              ...prev,
                              [admin.id]: e.target.value,
                            }))
                          }
                          data-cy="admin-seat-limit-input"
                        />
                        <Button
                          variant="outlinePrimary"
                          size="sm"
                          disabled={
                            !seatLimitDrafts[admin.id] || updateSeatLimitMutation.isPending
                          }
                          onClick={() => handleSeatLimitSave(admin.id)}
                          data-cy="admin-seat-limit-save"
                        >
                          Save
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{admin.createdAt ? formatDate(admin.createdAt) : "-"}</TableCell>
                    <TableCell />
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6">
                    No admins yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-2">Pending Admin Invites</h2>
        <Card>
          <CardContent className="p-0">
            <Table data-cy="pending-admin-invites-table">
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
                ) : pendingAdminInvites.length > 0 ? (
                  pendingAdminInvites.map((invite) => (
                    <TableRow key={invite.id} data-cy="pending-admin-invite-row">
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
                      No pending admin invites.
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

export default InviteAdminsPage;
