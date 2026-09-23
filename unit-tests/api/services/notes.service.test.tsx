jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  type NoteInput,
} from "../../../src/api/services/notes.service";
import { NOTES } from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

const noteInput = (overrides: Partial<NoteInput> = {}): NoteInput => ({
  title: "Binary Search",
  content: "# Binary Search",
  tags: ["algorithms"],
  ...overrides,
});

const noteRow = {
  id: "n1",
  title: "Binary Search",
  content: "# Binary Search",
  tags: ["algorithms"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("fetchNotes", () => {
  test("requests /notes with the page param", async () => {
    mockedAxios.get.mockResolvedValue({ data: { notes: [], totalLength: 0 } });
    await fetchNotes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${NOTES}?page=1`);
  });

  test("appends search when a term is given", async () => {
    mockedAxios.get.mockResolvedValue({ data: { notes: [], totalLength: 0 } });
    await fetchNotes(2, "binary");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${NOTES}?page=2&search=binary`);
  });

  test("omits search for an empty-string term", async () => {
    mockedAxios.get.mockResolvedValue({ data: { notes: [], totalLength: 0 } });
    await fetchNotes(1, "");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${NOTES}?page=1`);
  });

  test("omits search when the argument is undefined", async () => {
    mockedAxios.get.mockResolvedValue({ data: { notes: [], totalLength: 0 } });
    await fetchNotes(1, undefined);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${NOTES}?page=1`);
  });

  test("URL-encodes special characters in the search term", async () => {
    mockedAxios.get.mockResolvedValue({ data: { notes: [], totalLength: 0 } });
    await fetchNotes(1, "a&b c");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${NOTES}?page=1&search=a%26b+c`);
  });

  test("returns the response body unchanged (no client-side mapping)", async () => {
    const body = { notes: [noteRow], totalLength: 1 };
    mockedAxios.get.mockResolvedValue({ data: body });
    await expect(fetchNotes(1)).resolves.toBe(body);
  });

  test("propagates a rejected request", async () => {
    mockedAxios.get.mockRejectedValue(new Error("500"));
    await expect(fetchNotes(1)).rejects.toThrow("500");
  });
});

describe("createNote", () => {
  test("POSTs the input verbatim to /notes", async () => {
    mockedAxios.post.mockResolvedValue({ data: noteRow });
    const input = noteInput();
    await createNote(input);
    expect(mockedAxios.post).toHaveBeenCalledWith(NOTES, input);
  });

  test("passes optional isPinned/isFavorite flags through", async () => {
    mockedAxios.post.mockResolvedValue({ data: noteRow });
    await createNote(noteInput({ isPinned: true, isFavorite: true }));
    expect(mockedAxios.post).toHaveBeenCalledWith(
      NOTES,
      expect.objectContaining({ isPinned: true, isFavorite: true })
    );
  });

  test("returns the created note body", async () => {
    mockedAxios.post.mockResolvedValue({ data: noteRow });
    await expect(createNote(noteInput())).resolves.toEqual(noteRow);
  });

  test("supports an empty tags array", async () => {
    mockedAxios.post.mockResolvedValue({ data: noteRow });
    await createNote(noteInput({ tags: [] }));
    expect(mockedAxios.post).toHaveBeenCalledWith(
      NOTES,
      expect.objectContaining({ tags: [] })
    );
  });

  test("propagates a validation rejection", async () => {
    mockedAxios.post.mockRejectedValue(new Error("400 Bad Request"));
    await expect(createNote(noteInput())).rejects.toThrow("400 Bad Request");
  });
});

describe("updateNote", () => {
  test("PUTs the input to /notes/{id}", async () => {
    mockedAxios.put.mockResolvedValue({ data: noteRow });
    const input = noteInput({ title: "Updated" });
    await updateNote("n1", input);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${NOTES}/n1`, input);
  });

  test("returns the updated note body", async () => {
    mockedAxios.put.mockResolvedValue({ data: { ...noteRow, title: "Updated" } });
    await expect(updateNote("n1", noteInput())).resolves.toEqual(
      expect.objectContaining({ title: "Updated" })
    );
  });

  test("propagates a 404 for a missing note", async () => {
    mockedAxios.put.mockRejectedValue(new Error("404"));
    await expect(updateNote("missing", noteInput())).rejects.toThrow("404");
  });
});

describe("deleteNote", () => {
  test("DELETEs /notes/{id}", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteNote("n1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${NOTES}/n1`);
  });

  test("resolves with undefined even when the server returns a body", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: "deleted" } });
    await expect(deleteNote("n1")).resolves.toBeUndefined();
  });

  test("propagates a rejection", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("403"));
    await expect(deleteNote("n1")).rejects.toThrow("403");
  });
});
