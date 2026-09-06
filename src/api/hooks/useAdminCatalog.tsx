import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createCatalogProblem,
  deleteCatalogProblem,
  updateCatalogProblem,
  type CatalogProblemInputPayload,
} from "../services/adminCatalog.service";

// All three mutations invalidate every "catalog"-prefixed query (partial match, since
// invalidateQueries doesn't require `exact`) — this covers the list (["catalog", search,
// difficulty]), the detail (["catalog", "problem", id]) and submissions (["catalog",
// "submissions", id]) query keys used by useFetchCatalog.tsx.
export const useCreateCatalogProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CatalogProblemInputPayload) =>
      createCatalogProblem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
};

export const useUpdateCatalogProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CatalogProblemInputPayload;
    }) => updateCatalogProblem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
};

export const useDeleteCatalogProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCatalogProblem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["catalog"] });
    },
  });
};
