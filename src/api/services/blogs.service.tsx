import {
  BLOGS,
  BLOG_COVER_IMAGE_UPLOAD_URL,
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

// Backend returns `imageUrl` (a presigned, ready-to-use S3 URL); the frontend's KnowledgeBlog
// type/components render `coverImage` and `image_url` — map onto both so neither call site needs
// changing.
interface BackendBlog extends Omit<KnowledgeBlog, "coverImage" | "image_url"> {
  imageUrl: string | null;
}

const mapBlog = (blog: BackendBlog): KnowledgeBlog => ({
  ...blog,
  coverImage: blog.imageUrl ?? undefined,
  image_url: blog.imageUrl ?? undefined,
});

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
  return {
    blogs: (response.data.blogs as BackendBlog[]).map(mapBlog),
    totalLength: response.data.totalLength,
  };
};

interface CreateBlogInput {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  published: boolean;
  coverImage?: File;
}

/**
 * Creates a blog. If a cover image is provided, first requests a presigned S3 upload URL,
 * uploads the file directly to S3 (bypassing our API entirely, per the backend's design — see
 * dev-diary-backend/services/knowledge-service/openapi.yaml), then creates the blog referencing
 * the resulting imageKey.
 */
export const createBlog = async (
  input: CreateBlogInput
): Promise<KnowledgeBlog> => {
  let imageKey: string | undefined;

  if (input.coverImage) {
    const uploadUrlResponse = await AxiosInstance.post(
      BLOG_COVER_IMAGE_UPLOAD_URL,
      {
        fileName: input.coverImage.name,
        contentType: input.coverImage.type,
      }
    );
    const { uploadUrl, imageKey: key } = uploadUrlResponse.data;

    // Plain fetch, not AxiosInstance — this goes straight to S3, not our API, so it must not
    // carry our Authorization header or any of our interceptors.
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": input.coverImage.type },
      body: input.coverImage,
    });

    imageKey = key;
  }

  const response = await AxiosInstance.post(BLOGS, {
    title: input.title,
    summary: input.summary,
    content: input.content,
    tags: input.tags,
    published: input.published,
    imageKey,
  });

  return mapBlog(response.data);
};

export const publishBlog = async (
  id: string,
  published: boolean
): Promise<KnowledgeBlog> => {
  const response = await AxiosInstance.put(`${BLOGS}/${id}/publish`, {
    published,
  });
  return mapBlog(response.data);
};

export const deleteBlog = async (id: string): Promise<void> => {
  await AxiosInstance.delete(`${BLOGS}/${id}`);
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
