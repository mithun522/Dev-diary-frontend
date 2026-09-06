import {
  ADMIN_BLOG_DELETE,
  ADMIN_MATERIALS,
  ADMIN_MATERIAL_DELETE,
} from "../../constants/Api";
import type { QuestionBankFile } from "../../data/questionBankData";
import AxiosInstance from "../../utils/AxiosInstance";

// Admin moderation additions only — the list-fetch sides these pair with already exist elsewhere
// (blogs: fetchAllBlogs/useFetchBlogs in blogs.service.tsx/useFetchBlogs.tsx, reused as-is since
// GET /blogs already spans every user; materials: no existing "every user" list, so it's added
// here alongside the admin-only delete calls).

// Mirrors the existing per-user QuestionBankFile shape (see questionBank.service.tsx /
// data/questionBankData.ts), with optional owner identifiers the admin listing may include since
// it spans every user's materials — the per-user shape has no reason to carry these.
export interface AdminMaterial extends QuestionBankFile {
  userId?: string;
  userEmail?: string;
  ownerEmail?: string;
}

export const fetchAllMaterials = async (): Promise<AdminMaterial[]> => {
  const response = await AxiosInstance.get(ADMIN_MATERIALS);
  return response.data;
};

export const adminDeleteBlog = async (id: string): Promise<void> => {
  await AxiosInstance.delete(ADMIN_BLOG_DELETE(id));
};

export const adminDeleteMaterial = async (id: string): Promise<void> => {
  await AxiosInstance.delete(ADMIN_MATERIAL_DELETE(id));
};
