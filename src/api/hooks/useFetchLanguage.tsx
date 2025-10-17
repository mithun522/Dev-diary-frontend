import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { addLanguage, fetchLanguage } from "../services/language.service";

export type LanguageType = {
  id: number;
  language: string;
};

export const useFetchLanguage = (): UseQueryResult<LanguageType[], Error> => {
  return useQuery({
    queryKey: ["language"],
    queryFn: async () => await fetchLanguage(),
    staleTime: 10 * 60 * 60,
    gcTime: 10 * 60 * 60,
  });
};

export const useAddLanguage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addLanguage,
    onSuccess: () => {
      // Invalidate and refetch the languages query
      queryClient.invalidateQueries({
        queryKey: ["languages"],
      });
    },
  });
};
