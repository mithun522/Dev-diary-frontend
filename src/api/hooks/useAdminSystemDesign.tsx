import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCase,
  createPattern,
  deleteCase,
  deletePattern,
  fetchScalabilityPatterns,
  fetchSystemDesignCases,
  updateCase,
  updatePattern,
  type CaseInput,
  type PatternInput,
  type ScalabilityPatternRecord,
  type SystemDesignCaseRecord,
} from "../services/adminSystemDesign.service";

// Shared with (a future refetch on) the regular system-design page too, once it moves off its
// static mock data — kept as plain, stable query keys rather than nesting search/pagination params
// since these lists are small and the admin page filters client-side.
export const SYSTEM_DESIGN_CASES_QUERY_KEY = ["system-design-cases"];
export const SCALABILITY_PATTERNS_QUERY_KEY = ["system-design-patterns"];

export const useFetchSystemDesignCases = () => {
  return useQuery<SystemDesignCaseRecord[], Error>({
    queryKey: SYSTEM_DESIGN_CASES_QUERY_KEY,
    queryFn: fetchSystemDesignCases,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCreateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CaseInput) => createCase(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_DESIGN_CASES_QUERY_KEY });
    },
  });
};

export const useUpdateCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CaseInput }) =>
      updateCase(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_DESIGN_CASES_QUERY_KEY });
    },
  });
};

export const useDeleteCase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_DESIGN_CASES_QUERY_KEY });
    },
  });
};

export const useFetchScalabilityPatterns = () => {
  return useQuery<ScalabilityPatternRecord[], Error>({
    queryKey: SCALABILITY_PATTERNS_QUERY_KEY,
    queryFn: fetchScalabilityPatterns,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useCreatePattern = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PatternInput) => createPattern(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SCALABILITY_PATTERNS_QUERY_KEY,
      });
    },
  });
};

export const useUpdatePattern = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PatternInput }) =>
      updatePattern(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SCALABILITY_PATTERNS_QUERY_KEY,
      });
    },
  });
};

export const useDeletePattern = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePattern(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SCALABILITY_PATTERNS_QUERY_KEY,
      });
    },
  });
};
