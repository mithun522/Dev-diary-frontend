import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  adminDeleteBlog,
  adminDeleteMaterial,
  fetchAllMaterials,
} from "../services/adminModeration.service";

export const ADMIN_MATERIALS_QUERY_KEY = ["admin", "materials"];

export const useFetchAdminMaterials = () => {
  return useQuery({
    queryKey: ADMIN_MATERIALS_QUERY_KEY,
    queryFn: fetchAllMaterials,
    staleTime: 5 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// Blog listing for the admin view reuses the existing `useFetchBlogs("all", search)` hook
// directly (GET /blogs already spans every user) — no read hook duplicated here, only the
// admin-only delete mutation.
export const useAdminDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminDeleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
    },
  });
};

export const useAdminDeleteMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminDeleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_MATERIALS_QUERY_KEY });
    },
  });
};
