import { Clock } from "lucide-react";
import type React from "react";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { getTagColor } from "../../utils/colorVariations";
import type { KnowledgeTag } from "../../data/knowledgeData";
import Button from "../../components/ui/button";

type LivePreviewProps = {
  title: string;
  summary: string;
  content: string;
  selectedTags: KnowledgeTag[];
  coverImage?: File;
  previewUrl: string;
  readTime: number;
  published: boolean;
  onCancel: () => void;
};

const LivePreview: React.FC<LivePreviewProps> = ({
  title,
  summary,
  content,
  selectedTags,
  coverImage,
  previewUrl,
  readTime,
  published,
  onCancel,
}) => {
  return (
    <div className="md:col-span-2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <Card>
        {coverImage && (
          <img
            src={previewUrl}
            alt={title}
            className="w-full inset-0 object-cover"
          />
        )}
        <CardHeader className="pb-3">
          <CardDescription className="mt-1">{summary}</CardDescription>
          <div className="flex flex-wrap gap-1 mt-2">
            {selectedTags.map((tag, index) => (
              <Badge key={index} className={getTagColor(tag)}>
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readTime} min read</span>
            </div>
            {!published && <Badge variant="outline">Draft</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <MarkdownPreview source={content} />
          </div>
        </CardContent>
        <div className="flex justify-end p-2">
          <Button onClick={onCancel}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
};

export default LivePreview;
