import { useState } from "react";
import { X, Plus, Upload } from "lucide-react";
import type { KnowledgeTag } from "../../data/knowledgeData";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  CardTitle,
  Card,
  CardContent,
  CardHeader,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import Button from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { toast } from "react-toastify";
import LivePreview from "./LivePreview";
import { availableTags } from "../../constants/AvailableTags";
import { getTagColor } from "../../utils/colorTags";

interface AddBlogFormProps {
  onSubmit: (blogData: {
    title: string;
    summary: string;
    content: string;
    tags: KnowledgeTag[];
    coverImage: File;
    published: boolean;
    readTime: number;
    userId: number;
  }) => void;
  onCancel: () => void;
}

const AddBlogForm = ({ onSubmit, onCancel }: AddBlogFormProps) => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<KnowledgeTag[]>([]);
  const [coverImage, setCoverImage] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [userId, setUserId] = useState<number>(0);
  const [isLivePreview, setIsLivePreview] = useState<boolean>(false);

  const handleAddTag = (tag: KnowledgeTag) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tag: KnowledgeTag) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const estimateReadTime = (text: string): number => {
    const wordsPerMinute = 100;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) {
      toast.error("Please select a cover image");
      return;
    }

    if (!userId) {
      toast.error("User not logged in");
      return;
    }

    if (title.trim() && summary.trim() && content.trim()) {
      const readTime = estimateReadTime(content);
      onSubmit({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        tags: selectedTags,
        coverImage: coverImage,
        published,
        readTime: readTime,
        userId: userId,
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // generate preview URL
    }
  };

  if (isLivePreview && previewUrl) {
    return (
      <LivePreview
        title={title}
        summary={summary}
        content={content}
        selectedTags={selectedTags}
        previewUrl={previewUrl}
        coverImage={coverImage}
        published={published}
        readTime={estimateReadTime(content)}
        onCancel={() => setIsLivePreview(false)}
      />
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Blog</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Write a brief summary of your blog post..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL (Optional)</Label>
            <div className="flex gap-2">
              <Input
                id="coverImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />

              <Button type="button" variant="outlinePrimary" size="md">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {previewUrl && (
              <div className="mt-2">
                <img
                  src={previewUrl}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-md border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content in Markdown format..."
              className="min-h-[400px]"
              required
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>You can use Markdown syntax for formatting</span>
              <span>Estimated read time: {estimateReadTime(content)} min</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant={
                    selectedTags.includes(tag) ? "primary" : "outlinePrimary"
                  }
                  size="sm"
                  onClick={() =>
                    selectedTags.includes(tag)
                      ? handleRemoveTag(tag)
                      : handleAddTag(tag)
                  }
                  className="text-xs"
                >
                  {selectedTags.includes(tag) ? (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      {tag}
                    </>
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      {tag}
                    </>
                  )}
                </Button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} className={getTagColor(tag)}>
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="published">Publish immediately</Label>
            <span className="text-sm text-muted-foreground">
              (Uncheck to save as draft)
            </span>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outlinePrimary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outlinePrimary"
              onClick={() => setIsLivePreview(true)}
            >
              Preview
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !summary.trim() || !content.trim()}
            >
              {published ? "Publish Blog" : "Save as Draft"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddBlogForm;
