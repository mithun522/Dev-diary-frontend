jest.mock("../../../src/api/services/notes.service");

import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useFetchNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from "../../../src/api/hooks/useFetchNotes";
import {
  createNote,
  deleteNote,
  fetchNotes,
  updateNote,
  type NoteInput,
} from "../../../src/api/services/notes.service";
import type { KnowledgeNote } from "../../../src/data/knowledgeData";

const mockedFetchNotes = fetchNotes as jest.MockedFunction<typeof fetchNotes>;
const mockedCreateNote = createNote as jest.MockedFunction<typeof createNote>;
const mockedUpdateNote = updateNote as jest.MockedFunction<typeof updateNote>;
const mockedDeleteNote = deleteNote as jest.MockedFunction<typeof deleteNote>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, Wrapper };
};

const note = (id: string): KnowledgeNote => ({
  id,
  title: `Note ${id}`,
  content: "content",
  tags: [],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
});

const input: NoteInput = { title: "New note", content: "body", tags: ["javascript"] };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useFetchNotes", () => {
  test("registers queryKey ['notes', search || \"\"] and calls the service with page+search", async () => {
    mockedFetchNotes.mockResolvedValue({ notes: [note("n1")], totalLength: 1 });
    const { queryClient, Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchNotes("react"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedFetchNotes).toHaveBeenCalledWith(1, "react");
    expect(
      queryClient.getQueryCache().findAll().map((q) => q.queryKey)
    ).toContainEqual(["notes", "react"]);
  });

  test("normalizes an empty search to '' in the queryKey", async () => {
    mockedFetchNotes.mockResolvedValue({ notes: [], totalLength: 0 });
    const { queryClient, Wrapper } = createWrapper();

    renderHook(() => useFetchNotes(""), { wrapper: Wrapper });

    await waitFor(() => {
      expect(
        queryClient.getQueryCache().findAll().map((q) => q.queryKey)
      ).toContainEqual(["notes", ""]);
    });
  });

  test("getNextPageParam returns the next page number while notes remain", async () => {
    mockedFetchNotes.mockResolvedValueOnce({ notes: [note("n1"), note("n2")], totalLength: 3 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchNotes(""), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchNotes.mockResolvedValueOnce({ notes: [note("n3")], totalLength: 3 });
    await act(async () => {
      await result.current.fetchNextPage();
    });
    expect(mockedFetchNotes).toHaveBeenLastCalledWith(2, "");
  });

  test("getNextPageParam returns undefined at the exact boundary where every note is loaded", async () => {
    mockedFetchNotes.mockResolvedValueOnce({ notes: [note("n1"), note("n2")], totalLength: 3 });
    const { Wrapper } = createWrapper();

    const { result } = renderHook(() => useFetchNotes(""), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.hasNextPage).toBe(true);

    mockedFetchNotes.mockResolvedValueOnce({ notes: [note("n3")], totalLength: 3 });
    await act(async () => {
      await result.current.fetchNextPage();
    });

    await waitFor(() => expect(result.current.hasNextPage).toBe(false));
  });
});

describe("note mutations invalidate ['notes']", () => {
  test("useCreateNote calls the service with the input and invalidates ['notes']", async () => {
    mockedCreateNote.mockResolvedValue(note("n1"));
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateNote(), { wrapper: Wrapper });
    act(() => result.current.mutate(input));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedCreateNote).toHaveBeenCalledWith(input);
    expect(invalidateSpy).toHaveBeenCalledTimes(1);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notes"] });
  });

  test("useUpdateNote calls the service with id+input and invalidates ['notes']", async () => {
    mockedUpdateNote.mockResolvedValue(note("n1"));
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdateNote(), { wrapper: Wrapper });
    act(() => result.current.mutate({ id: "n1", input }));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedUpdateNote).toHaveBeenCalledWith("n1", input);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notes"] });
  });

  test("useDeleteNote calls the service with the id and invalidates ['notes']", async () => {
    mockedDeleteNote.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useDeleteNote(), { wrapper: Wrapper });
    act(() => result.current.mutate("n1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedDeleteNote).toHaveBeenCalledWith("n1");
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["notes"] });
  });

  test("invalidating ['notes'] marks every search-scoped notes list stale (partial key match)", async () => {
    mockedDeleteNote.mockResolvedValue(undefined);
    const { queryClient, Wrapper } = createWrapper();
    queryClient.setQueryData(["notes", ""], { notes: [], totalLength: 0 });
    queryClient.setQueryData(["notes", "react"], { notes: [], totalLength: 0 });

    const { result } = renderHook(() => useDeleteNote(), { wrapper: Wrapper });
    act(() => result.current.mutate("n1"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryState(["notes", ""])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(["notes", "react"])?.isInvalidated).toBe(true);
  });
});
