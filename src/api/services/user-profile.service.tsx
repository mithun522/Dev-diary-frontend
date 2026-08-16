import { SINGLE_USER } from "../../constants/Api";
import type { UserProfile } from "../../store/UserStore";
import AxiosInstance from "../../utils/AxiosInstance";
import { loggedInUserId } from "../../utils/auth";

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const userId = loggedInUserId();
  const response = await AxiosInstance.get(`${SINGLE_USER}/${userId}`);
  return response.data;
};
