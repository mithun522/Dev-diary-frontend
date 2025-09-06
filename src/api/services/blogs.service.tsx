import {
  BLOGS,
  GET_BLOGS_BY_USER,
  GET_DRAFTED_BLOGS,
  GET_PUBLISHED_BLOGS,
} from "../../constants/Api";
import type { KnowledgeBlog } from "../../data/knowledgeData";
import AxiosInstance from "../../utils/AxiosInstance";

interface FetchBlogsResponse {
  blogs: KnowledgeBlog[];
  totalLength: number;
}

/**
 * Generic fetcher helper to keep query construction clean
 */
const getBlogs = async (
  baseUrl: string,
  pageNumber: number,
  search?: string
): Promise<FetchBlogsResponse> => {
  const query = new URLSearchParams({ page: String(pageNumber) });
  if (search) query.append("search", search);

  const response = await AxiosInstance.get(`${baseUrl}?${query.toString()}`);
  return response.data;
};

export const fetchBlogsByUser = (
  pageNumber: number,
  search?: string
): Promise<FetchBlogsResponse> =>
  getBlogs(GET_BLOGS_BY_USER, pageNumber, search);

export const fetchBlogsByPublished = (
  pageNumber: number,
  search?: string
): Promise<FetchBlogsResponse> =>
  getBlogs(GET_PUBLISHED_BLOGS, pageNumber, search);

export const fetchBlogsByDrafts = (
  pageNumber: number,
  search?: string
): Promise<FetchBlogsResponse> =>
  getBlogs(GET_DRAFTED_BLOGS, pageNumber, search);

export const fetchAllBlogs = (
  pageNumber: number,
  search?: string
): Promise<FetchBlogsResponse> => getBlogs(BLOGS, pageNumber, search);
