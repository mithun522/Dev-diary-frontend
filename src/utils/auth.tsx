// src/utils/auth.ts
export const setAccessToken = (token: string) => {
  localStorage.setItem("accessToken", token);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

export const removeAccessToken = () => {
  localStorage.removeItem("accessToken");
};
