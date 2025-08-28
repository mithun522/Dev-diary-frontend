import {
  GET_BLOGS_BY_USER,
  GET_DRAFTED_BLOGS,
  GET_PUBLISHED_BLOGS,
} from "../../constants/Api";
import type { KnowledgeBlog } from "../../data/knowledgeData";
import AxiosInstance from "../../utils/AxiosInstance";

interface fetchBlogsProps {
  blogs: KnowledgeBlog[];
  totalLength: number;
}

export const fetchBlogsByUser = async (
  pageNumber: number
): Promise<fetchBlogsProps> => {
  const response = await AxiosInstance.get(
    `${GET_BLOGS_BY_USER}?page=${pageNumber}`
  );
  return response.data;
};

export const fetchBlogsByPublished = async (
  pageNumber: number
): Promise<KnowledgeBlog[]> => {
  const response = await AxiosInstance.get(
    `${GET_PUBLISHED_BLOGS}?page=${pageNumber}`
  );
  return response.data;
};

export const fetchBlogsByDrafts = async (
  pageNumber: number
): Promise<KnowledgeBlog[]> => {
  const response = await AxiosInstance.get(
    `${GET_DRAFTED_BLOGS}?page=${pageNumber}`
  );
  return response.data;
};
