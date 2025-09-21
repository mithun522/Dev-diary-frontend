import { SINGLE_USER } from "../../constants/Api";
import type { UserProfile } from "../../store/UserStore";
import AxiosInstance from "../../utils/AxiosInstance";

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const response = await AxiosInstance.get(`${SINGLE_USER}`);
  return response.data;
};
