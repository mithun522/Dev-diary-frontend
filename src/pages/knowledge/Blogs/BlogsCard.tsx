import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import Button from "../../../components/ui/button";
import MarkdownPreview from "@uiw/react-markdown-preview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { BACKEND_URL } from "../../../constants/Api";
import { getTagColor } from "../../../utils/colorVariations";
import { Badge } from "../../../components/ui/badge";
import type { KnowledgeBlog } from "../../../data/knowledgeData";
import { formatDate } from "../../../utils/formatDate";
import { Clock, EllipsisVertical, Maximize2, X } from "lucide-react";

interface BlogsCardProps {
  selectedBlog: KnowledgeBlog;
  handleDeleteBlog: (id: number) => void;
  isMaximized: boolean;
  setIsMaximized: (maximized: boolean) => void;
}

const BlogsCard: React.FC<BlogsCardProps> = ({
  selectedBlog,
  handleDeleteBlog,
  isMaximized,
  setIsMaximized,
}) => {
  return (
    <Card className="z-50">
      {selectedBlog?.image_url && (
        <div className="relative rounded-t-lg bg-black">
          <div className="flex absolute top-2 right-2">
            {isMaximized ? (
              <Button onClick={() => setIsMaximized(false)} variant="ghost">
                <X />
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => setIsMaximized(true)}>
                <Maximize2 />
              </Button>
            )}
          </div>
          <img
            src={BACKEND_URL + selectedBlog?.image_url}
            alt={selectedBlog?.title}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle>{selectedBlog?.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="md">
                <EllipsisVertical />
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
          <MarkdownPreview source={selectedBlog?.summary} />
        </CardDescription>
        <div className="flex flex-wrap gap-1 mt-2">
          {Array.isArray(selectedBlog) &&
            selectedBlog?.tags.map((tag, index) => (
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
          {!selectedBlog?.published && <Badge variant="outline">Draft</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="prose dark:prose-invert max-w-none">
          <MarkdownPreview source={selectedBlog?.content} />
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogsCard;
