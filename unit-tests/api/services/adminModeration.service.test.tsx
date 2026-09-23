jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchAllMaterials,
  adminDeleteBlog,
  adminDeleteMaterial,
} from "../../../src/api/services/adminModeration.service";
import {
  ADMIN_MATERIALS,
  KNOWLEDGE_API_URL,
  QUESTION_BANK_API_URL,
} from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

beforeEach(() => {
  jest.clearAllMocks();
});

// Moderation spans two different backends. A delete routed at the wrong host/path would either
// 404 or hit an unintended resource, so the exact URLs are pinned here.
describe("admin-scoped endpoint paths", () => {
  test("materials listing is question-bank-service's /admin/materials", () => {
    expect(ADMIN_MATERIALS).toBe(`${QUESTION_BANK_API_URL}/admin/materials`);
  });

  test("blog delete targets knowledge-service, not question-bank-service", () => {
    expect(ADMIN_MATERIALS.startsWith(KNOWLEDGE_API_URL)).toBe(false);
  });
});

describe("fetchAllMaterials", () => {
  test("GETs the admin-wide materials listing", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchAllMaterials();
    expect(mockedAxios.get).toHaveBeenCalledWith(ADMIN_MATERIALS);
  });

  test("issues exactly one request", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchAllMaterials();
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  test("returns the materials array unchanged, including owner fields the admin listing adds", async () => {
    const materials = [
      {
        id: "m1",
        fileName: "notes.pdf",
        fileType: "application/pdf",
        fileSizeBytes: 1024,
        downloadUrl: "https://s3/notes.pdf",
        userId: "u1",
        ownerEmail: "a@b.com",
      },
    ];
    mockedAxios.get.mockResolvedValue({ data: materials });
    await expect(fetchAllMaterials()).resolves.toBe(materials);
  });

  test("returns an empty array when no materials exist", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await expect(fetchAllMaterials()).resolves.toEqual([]);
  });

  test("propagates a rejection rather than swallowing it", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Forbidden"));
    await expect(fetchAllMaterials()).rejects.toThrow("Forbidden");
  });
});

describe("adminDeleteBlog", () => {
  test("DELETEs knowledge-service's admin blog path", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await adminDeleteBlog("b1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${KNOWLEDGE_API_URL}/admin/blogs/b1`
    );
  });

  test("interpolates the blog id into the path", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await adminDeleteBlog("abc-123");
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      `${KNOWLEDGE_API_URL}/admin/blogs/abc-123`
    );
  });

  test("resolves to undefined (void), not the response body", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { deleted: true } });
    await expect(adminDeleteBlog("b1")).resolves.toBeUndefined();
  });

  test("propagates a rejection rather than swallowing it", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Not Found"));
    await expect(adminDeleteBlog("b1")).rejects.toThrow("Not Found");
  });
});

describe("adminDeleteMaterial", () => {
  test("DELETEs question-bank-service's admin material path", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await adminDeleteMaterial("m1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${ADMIN_MATERIALS}/m1`);
  });

  test("uses the admin listing path as its base, not the per-user materials path", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await adminDeleteMaterial("m1");
    const [url] = mockedAxios.delete.mock.calls[0];
    expect(url).toContain("/admin/materials/");
  });

  test("resolves to undefined (void), not the response body", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { deleted: true } });
    await expect(adminDeleteMaterial("m1")).resolves.toBeUndefined();
  });

  test("propagates a rejection rather than swallowing it", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("Forbidden"));
    await expect(adminDeleteMaterial("m1")).rejects.toThrow("Forbidden");
  });
});
