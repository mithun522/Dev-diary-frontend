import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchUserProfile } from "../services/user-profile.service";
import type { UserProfile } from "../../store/UserStore";

export const useFetchUserProfile = (): UseQueryResult<UserProfile, Error> => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => await fetchUserProfile(),
    staleTime: 10 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
