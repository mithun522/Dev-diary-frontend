import axios from "axios";
import {
  INVITE_ADMIN,
  INVITE_STUDENTS,
  ACCEPT_INVITE,
  LIST_INVITES,
  RESEND_INVITE,
  REVOKE_INVITE,
  ADMIN_SEAT_USAGE,
  SUPER_ADMIN_ADMINS,
  SUPER_ADMIN_ADMIN_SEAT_LIMIT,
} from "../../constants/Api";
import AxiosInstance from "../../utils/AxiosInstance";

export type InviteRole = "admin" | "user";
export type InviteStatus = "pending" | "accepted" | "expired";
export type InviteResultStatus = "invited" | "alreadyExists" | "emailFailed";

export interface Invite {
  id: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  createdAt: string;
  expiresAt: string;
}

export interface InviteStudentsResult {
  email: string;
  status: InviteResultStatus;
}

export interface SeatUsage {
  seatLimit: number | null;
  seatUsed: number;
}

export interface AdminSummary {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: "pending" | "active";
  seatLimit: number | null;
  seatUsed: number;
  createdAt: string;
}

// Super admin invites someone to be an org admin with a fixed number of student seats.
export const inviteAdmin = async (
  email: string,
  seatLimit: number
): Promise<{ message: string }> => {
  const response = await AxiosInstance.post(INVITE_ADMIN, { email, seatLimit });
  return response.data;
};

// Org admin bulk-invites students by email — an admin may invite more than their seat limit;
// whoever accepts first fills the seats (see auth-service's inviteService.js).
export const inviteStudents = async (
  emails: string[]
): Promise<{ message: string; results: InviteStudentsResult[] }> => {
  const response = await AxiosInstance.post(INVITE_STUDENTS, { emails });
  return response.data;
};

// Public, no auth — the invitee has no account yet. Mirrors LoginPage's plain-axios pattern
// (not AxiosInstance) so a 401/403 here never clears an unrelated logged-in session.
export const acceptInvite = async (
  token: string,
  firstName: string,
  lastName: string,
  password: string
): Promise<{ message: string; token: string }> => {
  const response = await axios.post(ACCEPT_INVITE, { token, firstName, lastName, password });
  return response.data;
};

// Every invite the caller (an admin or the super admin) has sent themselves.
export const listInvites = async (): Promise<Invite[]> => {
  const response = await AxiosInstance.get(LIST_INVITES);
  return response.data;
};

export const resendInvite = async (id: string): Promise<{ message: string }> => {
  const response = await AxiosInstance.post(RESEND_INVITE(id));
  return response.data;
};

// Deletes the pending placeholder user row outright (not just the invite), so the email becomes
// immediately re-invitable — see auth-service's inviteService.js::revokeInvite.
export const revokeInvite = async (id: string): Promise<{ message: string }> => {
  const response = await AxiosInstance.delete(REVOKE_INVITE(id));
  return response.data;
};

// The calling admin's own seat usage.
export const getSeatUsage = async (): Promise<SeatUsage> => {
  const response = await AxiosInstance.get(ADMIN_SEAT_USAGE);
  return response.data;
};

// Super-admin-only: every admin (not the super admin) with their seat usage.
export const listAdmins = async (): Promise<AdminSummary[]> => {
  const response = await AxiosInstance.get(SUPER_ADMIN_ADMINS);
  return response.data;
};

export const updateAdminSeatLimit = async (
  adminId: string,
  seatLimit: number
): Promise<{ id: string; seatLimit: number | null; seatUsed: number }> => {
  const response = await AxiosInstance.put(SUPER_ADMIN_ADMIN_SEAT_LIMIT(adminId), { seatLimit });
  return response.data;
};
