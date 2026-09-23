jest.mock("../../../src/utils/AxiosInstance");

import axios from "axios";
import AxiosInstance from "../../../src/utils/AxiosInstance";
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
} from "../../../src/api/services/invites.service";
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
} from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;
// acceptInvite uses the bare `axios` default export directly (not AxiosInstance) — see the
// header comment in invites.service.tsx. Spy on just its `post`, rather than jest.mock("axios"),
// so the real axios.create() that AxiosInstance.tsx itself relies on stays intact.
const mockedBareAxiosPost = jest.spyOn(axios, "post");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("inviteAdmin", () => {
  test("POSTs { email, seatLimit } to /admin/invites", async () => {
    mockedAxios.post.mockResolvedValue({ data: { message: "invited" } });
    await inviteAdmin("admin@example.com", 5);
    expect(mockedAxios.post).toHaveBeenCalledWith(INVITE_ADMIN, {
      email: "admin@example.com",
      seatLimit: 5,
    });
  });

  test("returns the response body unchanged", async () => {
    const result = { message: "invited" };
    mockedAxios.post.mockResolvedValue({ data: result });
    await expect(inviteAdmin("a@b.com", 1)).resolves.toBe(result);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Forbidden"));
    await expect(inviteAdmin("a@b.com", 1)).rejects.toThrow("Forbidden");
  });
});

describe("inviteStudents", () => {
  test("POSTs { emails } to /admin/students/invites", async () => {
    mockedAxios.post.mockResolvedValue({ data: { message: "ok", results: [] } });
    await inviteStudents(["a@b.com", "c@d.com"]);
    expect(mockedAxios.post).toHaveBeenCalledWith(INVITE_STUDENTS, {
      emails: ["a@b.com", "c@d.com"],
    });
  });

  test("sends exactly one field in the body — no other keys", async () => {
    mockedAxios.post.mockResolvedValue({ data: { message: "ok", results: [] } });
    await inviteStudents(["a@b.com"]);
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(Object.keys(body as object)).toEqual(["emails"]);
  });

  test("returns the { message, results } envelope unchanged", async () => {
    const result = {
      message: "processed",
      results: [
        { email: "a@b.com", status: "invited" as const },
        { email: "c@d.com", status: "alreadyExists" as const },
      ],
    };
    mockedAxios.post.mockResolvedValue({ data: result });
    await expect(inviteStudents(["a@b.com", "c@d.com"])).resolves.toBe(result);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Seat limit exceeded"));
    await expect(inviteStudents(["a@b.com"])).rejects.toThrow("Seat limit exceeded");
  });
});

describe("acceptInvite", () => {
  test("POSTs { token, firstName, lastName, password } to /invites/accept using bare axios, not AxiosInstance", async () => {
    mockedBareAxiosPost.mockResolvedValue({ data: { message: "ok", token: "jwt" } });
    await acceptInvite("tok-123", "Ada", "Lovelace", "s3cret!");
    expect(mockedBareAxiosPost).toHaveBeenCalledWith(ACCEPT_INVITE, {
      token: "tok-123",
      firstName: "Ada",
      lastName: "Lovelace",
      password: "s3cret!",
    });
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  test("returns the { message, token } envelope unchanged", async () => {
    const result = { message: "Account created", token: "jwt-abc" };
    mockedBareAxiosPost.mockResolvedValue({ data: result });
    await expect(acceptInvite("tok", "A", "B", "pw")).resolves.toBe(result);
  });

  test("propagates a rejected request rather than swallowing it, e.g. an expired/invalid token", async () => {
    mockedBareAxiosPost.mockRejectedValue(new Error("Invite expired"));
    await expect(acceptInvite("tok", "A", "B", "pw")).rejects.toThrow("Invite expired");
  });
});

describe("listInvites", () => {
  test("requests the bare /invites URL", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await listInvites();
    expect(mockedAxios.get).toHaveBeenCalledWith(LIST_INVITES);
  });

  test("returns the invites array unchanged", async () => {
    const invites = [
      {
        id: "i1",
        email: "a@b.com",
        role: "user" as const,
        status: "pending" as const,
        createdAt: "2024-01-01T00:00:00Z",
        expiresAt: "2024-01-08T00:00:00Z",
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: invites });
    await expect(listInvites()).resolves.toBe(invites);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Unauthorized"));
    await expect(listInvites()).rejects.toThrow("Unauthorized");
  });
});

describe("resendInvite", () => {
  test("POSTs to the per-invite /invites/{id}/resend URL with no body", async () => {
    mockedAxios.post.mockResolvedValue({ data: { message: "resent" } });
    await resendInvite("i1");
    expect(mockedAxios.post).toHaveBeenCalledWith(RESEND_INVITE("i1"));
    expect(RESEND_INVITE("i1")).toBe(`${LIST_INVITES}/i1/resend`);
  });

  test("interpolates the id into the URL path", async () => {
    mockedAxios.post.mockResolvedValue({ data: {} });
    await resendInvite("abc-123");
    expect(mockedAxios.post).toHaveBeenCalledWith(`${LIST_INVITES}/abc-123/resend`);
  });

  test("returns the response body unchanged", async () => {
    const result = { message: "resent" };
    mockedAxios.post.mockResolvedValue({ data: result });
    await expect(resendInvite("i1")).resolves.toBe(result);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Not Found"));
    await expect(resendInvite("i1")).rejects.toThrow("Not Found");
  });
});

describe("revokeInvite", () => {
  test("DELETEs the per-invite /invites/{id} URL", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: "revoked" } });
    await revokeInvite("i1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(REVOKE_INVITE("i1"));
    expect(REVOKE_INVITE("i1")).toBe(`${LIST_INVITES}/i1`);
  });

  test("returns the response body unchanged, not undefined (unlike other DELETE endpoints in this codebase)", async () => {
    const result = { message: "revoked" };
    mockedAxios.delete.mockResolvedValue({ data: result });
    await expect(revokeInvite("i1")).resolves.toBe(result);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Forbidden"));
    await expect(revokeInvite("i1")).rejects.toThrow("Forbidden");
  });
});

describe("getSeatUsage", () => {
  test("requests the bare /admin/seats URL", async () => {
    mockedAxios.get.mockResolvedValue({ data: { seatLimit: 10, seatUsed: 3 } });
    await getSeatUsage();
    expect(mockedAxios.get).toHaveBeenCalledWith(ADMIN_SEAT_USAGE);
  });

  test("returns the { seatLimit, seatUsed } body unchanged, including a null seatLimit", async () => {
    const usage = { seatLimit: null, seatUsed: 7 };
    mockedAxios.get.mockResolvedValue({ data: usage });
    await expect(getSeatUsage()).resolves.toBe(usage);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Unauthorized"));
    await expect(getSeatUsage()).rejects.toThrow("Unauthorized");
  });
});

describe("listAdmins", () => {
  test("requests the bare /super-admin/admins URL", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await listAdmins();
    expect(mockedAxios.get).toHaveBeenCalledWith(SUPER_ADMIN_ADMINS);
  });

  test("returns the AdminSummary[] body unchanged", async () => {
    const admins = [
      {
        id: "a1",
        email: "admin@example.com",
        firstName: "Ada",
        lastName: null,
        status: "active" as const,
        seatLimit: 10,
        seatUsed: 2,
        createdAt: "2024-01-01T00:00:00Z",
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: admins });
    await expect(listAdmins()).resolves.toBe(admins);
  });

  test("propagates a rejected request rather than swallowing it (e.g. a non-super-admin caller)", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Forbidden"));
    await expect(listAdmins()).rejects.toThrow("Forbidden");
  });
});

describe("updateAdminSeatLimit", () => {
  test("PUTs { seatLimit } to the per-admin /super-admin/admins/{id}/seat-limit URL", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "a1", seatLimit: 20, seatUsed: 3 } });
    await updateAdminSeatLimit("a1", 20);
    expect(mockedAxios.put).toHaveBeenCalledWith(SUPER_ADMIN_ADMIN_SEAT_LIMIT("a1"), {
      seatLimit: 20,
    });
    expect(SUPER_ADMIN_ADMIN_SEAT_LIMIT("a1")).toBe(`${SUPER_ADMIN_ADMINS}/a1/seat-limit`);
  });

  test("sends exactly one field in the body — no other keys", async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });
    await updateAdminSeatLimit("a1", 15);
    const [, body] = mockedAxios.put.mock.calls[0];
    expect(Object.keys(body as object)).toEqual(["seatLimit"]);
  });

  test("threads a null seatLimit through (unlimited seats)", async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: "a1", seatLimit: null, seatUsed: 3 } });
    await updateAdminSeatLimit("a1", null as unknown as number);
    expect(mockedAxios.put).toHaveBeenCalledWith(SUPER_ADMIN_ADMIN_SEAT_LIMIT("a1"), {
      seatLimit: null,
    });
  });

  test("returns the updated { id, seatLimit, seatUsed } body unchanged", async () => {
    const updated = { id: "a1", seatLimit: 20, seatUsed: 3 };
    mockedAxios.put.mockResolvedValue({ data: updated });
    await expect(updateAdminSeatLimit("a1", 20)).resolves.toBe(updated);
  });

  test("propagates a rejected request rather than swallowing it", async () => {
    mockedAxios.put.mockRejectedValue(new Error("Not Found"));
    await expect(updateAdminSeatLimit("missing", 5)).rejects.toThrow("Not Found");
  });
});
