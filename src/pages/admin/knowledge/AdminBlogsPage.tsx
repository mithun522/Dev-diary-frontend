import { useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import Button from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import ErrorPage from "../../ErrorPage";
import { useDebounce } from "../../../api/hooks/use-debounce";
import { useFetchBlogs } from "../../../api/hooks/useFetchBlogs";
import { useAdminDeleteBlog } from "../../../api/hooks/useAdminModeration";
import type { KnowledgeBlog } from "../../../data/knowledgeData";
import { formatDate } from "../../../utils/formatDate";
import { logger } from "../../../utils/logger";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (
    (axiosError.response?.data as { message?: string })?.message || fallback
  );
};

// The frontend's blog row is typed as KnowledgeBlog (see blogs.service.tsx) which has no
// owner/author field — it's never needed for a user's own blog list. Since this admin view spans
// every user, the backend row may carry an owner identifier the shared type doesn't declare; read
// it defensively instead of widening the shared type for one admin-only column.
const getBlogOwner = (blog: KnowledgeBlog): string | undefined => {
  const raw = blog as unknown as Record<string, unknown>;
  const candidate =
    raw.authorEmail ?? raw.ownerEmail ?? raw.userEmail ?? raw.author ?? raw.userId;
  return typeof candidate === "string" ? candidate : undefined;
};

const AdminBlogsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const [selectedBlog, setSelectedBlog] = useState<KnowledgeBlog | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFetchBlogs("all", debouncedSearch);

  const deleteMutation = useAdminDeleteBlog();
  const blogs = data?.pages?.flatMap((page) => page.blogs) ?? [];

  const onDelete = (blog: KnowledgeBlog) => {
    setSelectedBlog(blog);
    setIsConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedBlog) return;

    deleteMutation.mutate(selectedBlog.id, {
      onSuccess: () => {
        toast.success("Blog deleted successfully");
        setIsConfirmOpen(false);
        setSelectedBlog(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to delete blog"));
        logger.error("Error deleting blog:", err);
      },
    });
  };

  if (error) return <ErrorPage message="Failed to fetch blogs" />;

  return (
    <div className="space-y-6" data-cy="admin-blogs-page">
      <div>
        <h1 className="text-3xl font-bold">Blogs</h1>
        <p className="text-muted-foreground">
          Moderate every user's blog posts — remove any post regardless of
          author.
        </p>
      </div>

      <Input
        placeholder="Search blogs by title or tag..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
        data-cy="admin-blogs-search"
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-6" />
                    </TableCell>
                  </TableRow>
                ))
              ) : blogs.length > 0 ? (
                blogs.map((blog) => (
                  <TableRow key={blog.id} data-cy="admin-blogs-row">
                    <TableCell
                      className="font-medium"
                      data-cy="admin-blogs-row-title"
                    >
                      {blog.title}
                    </TableCell>
                    <TableCell data-cy="admin-blogs-row-author">
                      {getBlogOwner(blog) ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={blog.published ? "default" : "secondary"}>
                        {blog.published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {blog.createdAt ? formatDate(blog.createdAt) : "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        className="bg-transparent"
                        data-cy="admin-blogs-row-delete"
                        onClick={() => onDelete(blog)}
                      >
                        <Trash2 className="text-destructive" size={18} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No blogs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {hasNextPage && (
            <div className="flex justify-center mt-4 mb-4">
              <Button
                variant="outlinePrimary"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-4 py-2 text-sm rounded-lg disabled:opacity-50"
                data-cy="admin-blogs-load-more"
              >
                {isFetchingNextPage ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isConfirmOpen && (
        <AskForConfirmationModal
          title="Delete Blog"
          message={`Are you sure you want to delete "${selectedBlog?.title}"? This cannot be undone.`}
          showDelete
          onCancel={() => setIsConfirmOpen(false)}
          onDelete={confirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminBlogsPage;
