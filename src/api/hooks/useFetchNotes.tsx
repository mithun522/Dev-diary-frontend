import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNote,
  deleteNote,
  fetchNotes,
  updateNote,
  type NoteInput,
} from "../services/notes.service";

export const useFetchNotes = (search: string) => {
  return useInfiniteQuery({
    queryKey: ["notes", search || ""],
    queryFn: async ({ pageParam = 1 }) => fetchNotes(pageParam, search),
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.flatMap((p) => p.notes).length;
      return totalLoaded < lastPage.totalLength ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NoteInput) => createNote(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: NoteInput }) =>
      updateNote(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notes"] }),
  });
};
