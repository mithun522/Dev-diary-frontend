import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLanguage, updateLanguage } from "../services/adminLanguage.service";

// Query key matches useFetchLanguage's ["language"] (singular) key exactly, so invalidating here
// actually refetches the list these mutations affect.
export const useUpdateLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, language }: { id: string; language: string }) =>
      updateLanguage(id, language),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["language"] });
    },
  });
};

export const useDeleteLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["language"] });
    },
  });
};
