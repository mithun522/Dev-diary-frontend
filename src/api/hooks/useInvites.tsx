import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  inviteAdmin,
  inviteStudents,
  acceptInvite,
  listInvites,
  resendInvite,
  revokeInvite,
  getSeatUsage,
  listAdmins,
  updateAdminSeatLimit,
} from "../services/invites.service";

export const useInviteAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, seatLimit }: { email: string; seatLimit: number }) =>
      inviteAdmin(email, seatLimit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      queryClient.invalidateQueries({ queryKey: ["super-admin-admins"] });
    },
  });
};

export const useInviteStudents = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emails: string[]) => inviteStudents(emails),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
};

export const useAcceptInvite = () => {
  return useMutation({
    mutationFn: ({
      token,
      firstName,
      lastName,
      password,
    }: {
      token: string;
      firstName: string;
      lastName: string;
      password: string;
    }) => acceptInvite(token, firstName, lastName, password),
  });
};

export const useListInvites = () => {
  return useQuery({
    queryKey: ["invites"],
    queryFn: listInvites,
  });
};

export const useResendInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resendInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
};

export const useRevokeInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeInvite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
      // Revoking deletes the pending placeholder user row outright (not just the invite), so an
      // admin invite's row in the super admin's admins table needs to disappear too, not just its
      // entry in the pending-invites list.
      queryClient.invalidateQueries({ queryKey: ["super-admin-admins"] });
    },
  });
};

export const useSeatUsage = () => {
  return useQuery({
    queryKey: ["admin-seat-usage"],
    queryFn: getSeatUsage,
  });
};

export const useListAdmins = () => {
  return useQuery({
    queryKey: ["super-admin-admins"],
    queryFn: listAdmins,
  });
};

export const useUpdateAdminSeatLimit = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ adminId, seatLimit }: { adminId: string; seatLimit: number }) =>
      updateAdminSeatLimit(adminId, seatLimit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["super-admin-admins"] });
    },
  });
};
