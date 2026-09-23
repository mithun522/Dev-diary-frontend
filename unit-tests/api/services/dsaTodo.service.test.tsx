jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchDsaTodos,
  createDsaTodo,
  updateDsaTodo,
  deleteDsaTodo,
} from "../../../src/api/services/dsaTodo.service";
import { DSA_TODOS, DSA_TODOS_BY_USER } from "../../../src/constants/Api";
import type { DsaTodo } from "../../../src/data/dsaTodoData";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const todo: DsaTodo = {
  problem: "Two Sum",
  link: "https://example.com/two-sum",
  priority: "HIGH",
  notes: "revisit hashing",
  isDone: false,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchDsaTodos", () => {
  test("requests the per-user todos URL, not the collection root", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchDsaTodos();
    expect(mockedAxios.get).toHaveBeenCalledWith(DSA_TODOS_BY_USER);
  });

  test("the per-user URL is the collection root plus /user", async () => {
    expect(DSA_TODOS_BY_USER).toBe(`${DSA_TODOS}/user`);
  });

  test("sends no query parameters (scoping is by token, not by a userId param)", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await fetchDsaTodos();
    const [url] = mockedAxios.get.mock.calls[0];
    expect(url).not.toContain("?");
  });

  test("returns response.data", async () => {
    mockedAxios.get.mockResolvedValue({ data: [todo] });
    await expect(fetchDsaTodos()).resolves.toEqual([todo]);
  });

  test("returns an empty array when the user has no todos", async () => {
    mockedAxios.get.mockResolvedValue({ data: [] });
    await expect(fetchDsaTodos()).resolves.toEqual([]);
  });

  test("propagates a rejected request", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(fetchDsaTodos()).rejects.toThrow("Network Error");
  });
});

describe("createDsaTodo", () => {
  test("POSTs to the collection root (not the per-user URL)", async () => {
    mockedAxios.post.mockResolvedValue({ data: todo });
    await createDsaTodo(todo);
    expect(mockedAxios.post).toHaveBeenCalledWith(DSA_TODOS, todo);
  });

  test("sends the payload through unchanged, with no added or dropped fields", async () => {
    mockedAxios.post.mockResolvedValue({ data: todo });
    await createDsaTodo(todo);
    const [, body] = mockedAxios.post.mock.calls[0];
    expect(body).toBe(todo);
  });

  test("sends a minimal payload (problem only) as-is", async () => {
    const minimal: DsaTodo = { problem: "Reverse a linked list" };
    mockedAxios.post.mockResolvedValue({ data: minimal });
    await createDsaTodo(minimal);
    expect(mockedAxios.post).toHaveBeenCalledWith(DSA_TODOS, minimal);
  });

  test("returns the created todo from response.data", async () => {
    const created = { ...todo, id: "t1" };
    mockedAxios.post.mockResolvedValue({ data: created });
    await expect(createDsaTodo(todo)).resolves.toEqual(created);
  });

  test("propagates a rejected request", async () => {
    mockedAxios.post.mockRejectedValue(new Error("400"));
    await expect(createDsaTodo(todo)).rejects.toThrow("400");
  });
});

describe("updateDsaTodo", () => {
  test("PUTs to /dsa/todos/{id} with the payload", async () => {
    mockedAxios.put.mockResolvedValue({ data: todo });
    await updateDsaTodo("t1", todo);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${DSA_TODOS}/t1`, todo);
  });

  test("interpolates the id into the path rather than sending it as a query param", async () => {
    mockedAxios.put.mockResolvedValue({ data: todo });
    await updateDsaTodo("abc-123", todo);
    const [url] = mockedAxios.put.mock.calls[0];
    expect(url).toBe(`${DSA_TODOS}/abc-123`);
    expect(url).not.toContain("?");
  });

  test("returns the updated todo from response.data", async () => {
    const updated = { ...todo, isDone: true };
    mockedAxios.put.mockResolvedValue({ data: updated });
    await expect(updateDsaTodo("t1", todo)).resolves.toEqual(updated);
  });

  test("propagates a rejected request (e.g. 404 for a deleted todo)", async () => {
    mockedAxios.put.mockRejectedValue(new Error("404"));
    await expect(updateDsaTodo("gone", todo)).rejects.toThrow("404");
  });
});

describe("deleteDsaTodo", () => {
  test("DELETEs /dsa/todos/{id}", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteDsaTodo("t1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${DSA_TODOS}/t1`);
  });

  test("sends no request body", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteDsaTodo("t1");
    expect(mockedAxios.delete.mock.calls[0]).toHaveLength(1);
  });

  test("resolves to undefined (the response body is deliberately discarded)", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { deleted: true } });
    await expect(deleteDsaTodo("t1")).resolves.toBeUndefined();
  });

  test("propagates a rejected request", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("403"));
    await expect(deleteDsaTodo("t1")).rejects.toThrow("403");
  });
});
