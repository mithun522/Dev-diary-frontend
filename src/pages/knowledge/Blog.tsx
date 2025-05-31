import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import Button from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Clock, Edit } from "lucide-react";
import { type KnowledgeBlog } from "../../data/knowledgeData";
import AxiosInstance from "../../utils/AxiosInstance";
import { BLOGS } from "../../constants/Api";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/formatDate";
import { getTagColor } from "../../utils/colorTags";

type BlogsProps = {
  searchQuery: string;
};
const Blog: React.FC<BlogsProps> = ({ searchQuery }) => {
  const [selectedBlog, setSelectedBlog] = useState<KnowledgeBlog | null>(null);
  const [blogs, setBlogs] = useState<KnowledgeBlog[]>([]);

  const filteredBlogs = blogs.filter(
    (blog) =>
      searchQuery === "" ||
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteBlog = async (id: number) => {
    try {
      const response = await AxiosInstance.delete(`${BLOGS}?id=${id}`);
      if (response.status === 200) {
        setBlogs((prev) => prev.filter((blog) => Number(blog.id) !== id));
        setSelectedBlog(
          blogs[blogs.findIndex((blog) => Number(blog.id) === id) - 1]
        );
        toast.success(response?.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await AxiosInstance.get(BLOGS);
        setBlogs(response.data); // Assuming the backend returns an array of blogs
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            All
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Published
          </Badge>
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Drafts
          </Badge>
        </div>

        <div className="space-y-4">
          {filteredBlogs.map((blog) => (
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
                {/* <div className="flex flex-wrap gap-1">
              {blog.tags &&
                blog.tags.slice(0, 2).map((tag, index) => (
                  <Badge
                    key={index}
                    className={`text-xs ${getTagColor(tag)}`}
                  >
                    {tag}
                  </Badge>
                ))}
              {blog.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{blog.tags.length - 2}
                </Badge>
              )}
            </div> */}
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

          {filteredBlogs.length === 0 && (
            <div className="text-center py-8 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                No blogs found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="md:col-span-2">
        {selectedBlog ? (
          <Card>
            {selectedBlog?.coverImageUrl && (
              <div className="relative h-48 md:h-64 overflow-hidden rounded-t-lg">
                <img
                  src={"http://localhost:8080" + selectedBlog?.coverImageUrl}
                  alt={selectedBlog?.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>{selectedBlog?.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="md">
                      ⋮
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Edit Blog</DropdownMenuItem>
                    <DropdownMenuItem>
                      {selectedBlog?.published ? "Unpublish" : "Publish"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteBlog(Number(selectedBlog?.id))}
                    >
                      Delete Blog
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="mt-1">
                {selectedBlog?.summary}
              </CardDescription>
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedBlog?.tags.map((tag, index) => (
                  <Badge key={index} className={getTagColor(tag)}>
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{selectedBlog?.readTime} min read</span>
                </div>
                <div>{formatDate(selectedBlog?.updatedAt)}</div>
                {!selectedBlog?.published && (
                  <Badge variant="outline">Draft</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <MarkdownPreview source={selectedBlog?.content} />
              </div>
            </CardContent>
          </Card>
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
