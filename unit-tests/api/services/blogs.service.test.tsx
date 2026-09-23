jest.mock("../../../src/utils/AxiosInstance");

import AxiosInstance from "../../../src/utils/AxiosInstance";
import {
  createBlog,
  publishBlog,
  deleteBlog,
  fetchBlogsByUser,
  fetchBlogsByPublished,
  fetchBlogsByDrafts,
  fetchAllBlogs,
} from "../../../src/api/services/blogs.service";
import {
  BLOGS,
  BLOG_COVER_IMAGE_UPLOAD_URL,
  GET_BLOGS_BY_USER,
  GET_PUBLISHED_BLOGS,
  GET_DRAFTED_BLOGS,
} from "../../../src/constants/Api";

const mockedAxios = AxiosInstance as jest.Mocked<typeof AxiosInstance>;

// The backend returns `imageUrl`; the frontend's KnowledgeBlog renders `coverImage`/`image_url`.
const backendBlog = (imageUrl: string | null) => ({
  id: "b1",
  title: "Binary Trees",
  summary: "A guide",
  content: "# Binary Trees",
  tags: ["algorithms"],
  published: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-02T00:00:00Z",
  readTime: 5,
  imageUrl,
});

const coverFile = () =>
  new File(["binary-image-bytes"], "cover.png", { type: "image/png" });

let fetchMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe("blog list fetchers — URL construction", () => {
  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: { blogs: [], totalLength: 0 } });
  });

  test("fetchBlogsByUser hits /blogs/user with the page param", async () => {
    await fetchBlogsByUser(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${GET_BLOGS_BY_USER}?page=1`);
  });

  test("fetchBlogsByPublished hits /blogs/published", async () => {
    await fetchBlogsByPublished(2);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${GET_PUBLISHED_BLOGS}?page=2`);
  });

  test("fetchBlogsByDrafts hits /blogs/draft", async () => {
    await fetchBlogsByDrafts(3);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${GET_DRAFTED_BLOGS}?page=3`);
  });

  test("fetchAllBlogs hits the bare /blogs collection", async () => {
    await fetchAllBlogs(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${BLOGS}?page=1`);
  });

  test("appends search only when a term is given", async () => {
    await fetchAllBlogs(1, "trees");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${BLOGS}?page=1&search=trees`);
  });

  test("omits search for an empty-string term (falsy)", async () => {
    await fetchAllBlogs(1, "");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${BLOGS}?page=1`);
  });

  test("URL-encodes special characters in the search term", async () => {
    await fetchAllBlogs(2, "a&b c");
    expect(mockedAxios.get).toHaveBeenCalledWith(`${BLOGS}?page=2&search=a%26b+c`);
  });

  test("page 0 is still sent explicitly (String(0) is truthy as a param value)", async () => {
    await fetchAllBlogs(0);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${BLOGS}?page=0`);
  });
});

describe("blog list fetchers — response mapping", () => {
  test("maps backend imageUrl onto both coverImage and image_url", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { blogs: [backendBlog("https://s3/cover.png")], totalLength: 1 },
    });
    const { blogs } = await fetchAllBlogs(1);
    expect(blogs[0].coverImage).toBe("https://s3/cover.png");
    expect(blogs[0].image_url).toBe("https://s3/cover.png");
  });

  test("maps a null imageUrl to undefined on both fields", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { blogs: [backendBlog(null)], totalLength: 1 },
    });
    const { blogs } = await fetchAllBlogs(1);
    expect(blogs[0].coverImage).toBeUndefined();
    expect(blogs[0].image_url).toBeUndefined();
  });

  test("passes totalLength through untouched", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { blogs: [], totalLength: 42 },
    });
    await expect(fetchAllBlogs(1)).resolves.toEqual({ blogs: [], totalLength: 42 });
  });

  test("preserves every other blog field while mapping", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { blogs: [backendBlog("https://s3/x.png")], totalLength: 1 },
    });
    const { blogs } = await fetchAllBlogs(1);
    expect(blogs[0]).toEqual(
      expect.objectContaining({
        id: "b1",
        title: "Binary Trees",
        summary: "A guide",
        published: true,
        readTime: 5,
      })
    );
  });

  test("maps every blog in a multi-item page", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        blogs: [backendBlog("https://s3/a.png"), backendBlog(null)],
        totalLength: 2,
      },
    });
    const { blogs } = await fetchAllBlogs(1);
    expect(blogs.map((b) => b.coverImage)).toEqual(["https://s3/a.png", undefined]);
  });

  test("returns an empty list without error for an empty page", async () => {
    mockedAxios.get.mockResolvedValue({ data: { blogs: [], totalLength: 0 } });
    await expect(fetchAllBlogs(1)).resolves.toEqual({ blogs: [], totalLength: 0 });
  });

  test("propagates a rejected request", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));
    await expect(fetchAllBlogs(1)).rejects.toThrow("Network Error");
  });
});

describe("createBlog without a cover image", () => {
  test("POSTs the blog directly with imageKey undefined and never requests an upload URL", async () => {
    mockedAxios.post.mockResolvedValue({ data: backendBlog(null) });

    await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: ["javascript"],
      published: false,
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(BLOGS, {
      title: "T",
      summary: "S",
      content: "C",
      tags: ["javascript"],
      published: false,
      imageKey: undefined,
    });
  });

  test("never touches S3 when there is no cover image", async () => {
    mockedAxios.post.mockResolvedValue({ data: backendBlog(null) });
    await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: [],
      published: true,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("maps the created blog's imageUrl onto coverImage", async () => {
    mockedAxios.post.mockResolvedValue({ data: backendBlog("https://s3/new.png") });
    const created = await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: [],
      published: true,
    });
    expect(created.coverImage).toBe("https://s3/new.png");
    expect(created.image_url).toBe("https://s3/new.png");
  });
});

describe("createBlog with a cover image (presigned S3 flow)", () => {
  const primeUploadFlow = () => {
    mockedAxios.post
      .mockResolvedValueOnce({
        data: { uploadUrl: "https://s3.example/put?sig=abc", imageKey: "covers/b1.png" },
      })
      .mockResolvedValueOnce({ data: backendBlog("https://s3/cover.png") });
  };

  test("requests a presigned URL with the file's name and content type", async () => {
    primeUploadFlow();
    await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: [],
      published: true,
      coverImage: coverFile(),
    });
    expect(mockedAxios.post).toHaveBeenNthCalledWith(1, BLOG_COVER_IMAGE_UPLOAD_URL, {
      fileName: "cover.png",
      contentType: "image/png",
    });
  });

  test("PUTs the raw file to the presigned URL with the matching Content-Type", async () => {
    primeUploadFlow();
    const file = coverFile();
    await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: [],
      published: true,
      coverImage: file,
    });
    expect(fetchMock).toHaveBeenCalledWith("https://s3.example/put?sig=abc", {
      method: "PUT",
      headers: { "Content-Type": "image/png" },
      body: file,
    });
  });

  test("uploads to S3 with bare fetch, so no Authorization header is attached", async () => {
    primeUploadFlow();
    await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: [],
      published: true,
      coverImage: coverFile(),
    });
    const [, init] = fetchMock.mock.calls[0];
    expect(Object.keys(init.headers)).toEqual(["Content-Type"]);
  });

  test("threads the returned imageKey into the blog-creation payload", async () => {
    primeUploadFlow();
    await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: ["frontend"],
      published: true,
      coverImage: coverFile(),
    });
    expect(mockedAxios.post).toHaveBeenNthCalledWith(2, BLOGS, {
      title: "T",
      summary: "S",
      content: "C",
      tags: ["frontend"],
      published: true,
      imageKey: "covers/b1.png",
    });
  });

  test("runs the three steps in order: presign, upload, create", async () => {
    const order: string[] = [];
    mockedAxios.post
      .mockImplementationOnce(async () => {
        order.push("presign");
        return { data: { uploadUrl: "https://s3.example/put", imageKey: "k" } };
      })
      .mockImplementationOnce(async () => {
        order.push("create");
        return { data: backendBlog(null) };
      });
    fetchMock.mockImplementation(async () => {
      order.push("upload");
      return { ok: true, status: 200 };
    });

    await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: [],
      published: true,
      coverImage: coverFile(),
    });

    expect(order).toEqual(["presign", "upload", "create"]);
  });

  test("does not create the blog if requesting the presigned URL fails", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("presign failed"));
    await expect(
      createBlog({
        title: "T",
        summary: "S",
        content: "C",
        tags: [],
        published: true,
        coverImage: coverFile(),
      })
    ).rejects.toThrow("presign failed");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("does not create the blog if the S3 upload rejects at the network level", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { uploadUrl: "https://s3.example/put", imageKey: "k" },
    });
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      createBlog({
        title: "T",
        summary: "S",
        content: "C",
        tags: [],
        published: true,
        coverImage: coverFile(),
      })
    ).rejects.toThrow("Failed to fetch");
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  // KNOWN DEFECT: the S3 PUT response is awaited but `response.ok` is never checked, so an S3
  // rejection (403 expired signature, 413 too large) is silently treated as success and the blog
  // is created pointing at an object that was never stored.
  test("KNOWN DEFECT: a 403 from S3 is ignored and the blog is still created with the unstored imageKey", async () => {
    primeUploadFlow();
    fetchMock.mockResolvedValue({ ok: false, status: 403, statusText: "Forbidden" });

    const created = await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: [],
      published: true,
      coverImage: coverFile(),
    });

    expect(created).toBeDefined();
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      BLOGS,
      expect.objectContaining({ imageKey: "covers/b1.png" })
    );
  });

  test("KNOWN DEFECT: a 500 from S3 likewise does not abort blog creation", async () => {
    primeUploadFlow();
    fetchMock.mockResolvedValue({ ok: false, status: 500, statusText: "Internal Server Error" });
    await expect(
      createBlog({
        title: "T",
        summary: "S",
        content: "C",
        tags: [],
        published: true,
        coverImage: coverFile(),
      })
    ).resolves.toBeDefined();
    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
  });

  test("sends the file's real content type, not a hardcoded one", async () => {
    primeUploadFlow();
    const jpeg = new File(["x"], "photo.jpeg", { type: "image/jpeg" });
    await createBlog({
      title: "T",
      summary: "S",
      content: "C",
      tags: [],
      published: true,
      coverImage: jpeg,
    });
    expect(mockedAxios.post).toHaveBeenNthCalledWith(1, BLOG_COVER_IMAGE_UPLOAD_URL, {
      fileName: "photo.jpeg",
      contentType: "image/jpeg",
    });
    expect(fetchMock.mock.calls[0][1].headers["Content-Type"]).toBe("image/jpeg");
  });
});

describe("publishBlog", () => {
  test("PUTs { published } to /blogs/{id}/publish", async () => {
    mockedAxios.put.mockResolvedValue({ data: backendBlog(null) });
    await publishBlog("b1", true);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${BLOGS}/b1/publish`, {
      published: true,
    });
  });

  test("supports unpublishing (published: false)", async () => {
    mockedAxios.put.mockResolvedValue({ data: backendBlog(null) });
    await publishBlog("b1", false);
    expect(mockedAxios.put).toHaveBeenCalledWith(`${BLOGS}/b1/publish`, {
      published: false,
    });
  });

  test("maps the returned blog's imageUrl", async () => {
    mockedAxios.put.mockResolvedValue({ data: backendBlog("https://s3/c.png") });
    const blog = await publishBlog("b1", true);
    expect(blog.coverImage).toBe("https://s3/c.png");
  });

  test("propagates a rejection", async () => {
    mockedAxios.put.mockRejectedValue(new Error("404"));
    await expect(publishBlog("missing", true)).rejects.toThrow("404");
  });
});

describe("deleteBlog", () => {
  test("DELETEs /blogs/{id}", async () => {
    mockedAxios.delete.mockResolvedValue({ data: undefined });
    await deleteBlog("b1");
    expect(mockedAxios.delete).toHaveBeenCalledWith(`${BLOGS}/b1`);
  });

  test("resolves with undefined", async () => {
    mockedAxios.delete.mockResolvedValue({ data: { message: "deleted" } });
    await expect(deleteBlog("b1")).resolves.toBeUndefined();
  });

  test("propagates a rejection", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("403"));
    await expect(deleteBlog("b1")).rejects.toThrow("403");
  });
});
