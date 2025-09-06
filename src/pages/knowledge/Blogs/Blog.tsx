import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Clock, Edit } from "lucide-react";
import {
  type KnowledgeBlog,
  type KnowledgeTag,
} from "../../../data/knowledgeData";
import AxiosInstance from "../../../utils/AxiosInstance";
import { BLOGS } from "../../../constants/Api";
import { toast } from "react-toastify";
import { formatDate } from "../../../utils/formatDate";
import { logger } from "../../../utils/logger";
import BlogsCard from "./BlogsCard";
import { getTagColor } from "../../../utils/colorVariations";
import { parseTags } from "../../../utils/parseTags";
import { useFetchBlogs } from "../../../api/hooks/useFetchBlogs";
import Button from "../../../components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import ErrorPage from "../../ErrorPage";
import { BlogsShimmer } from "./BlogsShimmer";
import { useDebounce } from "../../../api/hooks/use-debounce";

type BlogsProps = {
  searchQuery: string;
};
const FILTERS = [
  { key: "all", label: "All" },
  { key: "myBlogs", label: "My Blogs" },
  { key: "published", label: "Published" },
  { key: "drafts", label: "Drafts" },
] as const;

type BlogFilter = (typeof FILTERS)[number]["key"];
const Blog: React.FC<BlogsProps> = ({ searchQuery }) => {
  const [selectedBlog, setSelectedBlog] = useState<KnowledgeBlog | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [filter, setFilter] = useState<BlogFilter>();
  const queryClient = useQueryClient();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isFetching,
  } = useFetchBlogs(filter ? filter : "published", useDebounce(searchQuery));

  const blogs = data?.pages.flatMap((page) => page.blogs) ?? [];

  const handleDeleteBlog = async (id: number) => {
    try {
      const response = await AxiosInstance.delete(`${BLOGS}?id=${id}`);
      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ["blogs"] });
        toast.success(response?.data);
      }
    } catch (e) {
      logger.error(e);
    }
  };

  if (isLoading || isFetching) {
    return Array.from({ length: 3 }).map((_, index) => (
      <div className="mb-2">
        <BlogsShimmer key={index} />
      </div>
    ));
  }

  if (isError) {
    return <ErrorPage message="Failed to load Blogs. Please try again." />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(({ key, label }) => (
            <Badge
              key={key}
              variant="outline"
              className={`cursor-pointer hover:bg-muted ${
                filter === key ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => setFilter(key)}
            >
              {label}
            </Badge>
          ))}
        </div>

        <div className="space-y-4">
          {Array.isArray(blogs) &&
            blogs.map((blog) => (
              <Card
                key={blog.id}
                className={`cursor-pointer hover:ring-1 hover:ring-primary/20 transition-shadow ${
                  selectedBlog?.id === blog.id ? "ring-1 ring-primary" : ""
                }`}
                onClick={() => setSelectedBlog(blog)}
              >
                {blog.coverImage && (
                  <div className="relative h-32 overflow-hidden rounded-t-lg">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className={`p-4 ${blog.coverImage ? "pb-0" : ""}`}>
                  <div className="flex justify-between gap-2">
                    <CardTitle className="text-base line-clamp-1">
                      {blog.title}
                    </CardTitle>
                    {!blog.published && <Badge variant="outline">Draft</Badge>}
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">
                    {blog.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex flex-wrap gap-1">
                    {blog.tags &&
                      parseTags(blog.tags.toString())
                        .slice(0, 2)
                        .map((tag: KnowledgeTag, index: number) => (
                          <Badge
                            key={index}
                            className={`text-xs ${getTagColor(tag)}`}
                          >
                            {tag}
                          </Badge>
                        ))}

                    {blog.tags &&
                      parseTags(blog.tags.toString()).length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{parseTags(blog.tags.toString()).length - 2}
                        </Badge>
                      )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
                    <span>{formatDate(blog.updatedAt)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {blog.readTime} min read
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}

          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outlinePrimary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 text-sm rounded-lg disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}

          {blogs.length === 0 && (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                No blogs found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="md:col-span-2 relative">
        {selectedBlog ? (
          <>
            {isMaximized ? (
              <div className="fixed inset-0 z-50 bg-background/90 p-6 overflow-auto">
                <BlogsCard
                  selectedBlog={selectedBlog}
                  handleDeleteBlog={handleDeleteBlog}
                  isMaximized={isMaximized}
                  setIsMaximized={setIsMaximized}
                />
              </div>
            ) : (
              <BlogsCard
                selectedBlog={selectedBlog}
                handleDeleteBlog={handleDeleteBlog}
                isMaximized={isMaximized}
                setIsMaximized={setIsMaximized}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/50 rounded-lg">
            <Edit className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Select a blog</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Choose a blog from the sidebar or create a new one to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
