import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Badge } from "../../../components/ui/badge";
import { toast } from "react-toastify";
import type { KnowledgeNote, KnowledgeTag } from "../../../data/knowledgeData";
import { availableTags } from "../../../constants/AvailableTags";
import { getTagColor } from "../../../utils/colorVariations";
import { useCreateNote, useUpdateNote } from "../../../api/hooks/useFetchNotes";

interface AddNoteFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  noteData?: KnowledgeNote | null;
  onSaved: () => void;
}

const AddNoteForm: React.FC<AddNoteFormProps> = ({
  open,
  setOpen,
  noteData,
  onSaved,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<KnowledgeTag[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const createNote = useCreateNote();
  const updateNote = useUpdateNote();

  useEffect(() => {
    if (noteData) {
      setTitle(noteData.title);
      setContent(noteData.content);
      setSelectedTags(noteData.tags);
      setIsPinned(!!noteData.isPinned);
      setIsFavorite(!!noteData.isFavorite);
    } else {
      setTitle("");
      setContent("");
      setSelectedTags([]);
      setIsPinned(false);
      setIsFavorite(false);
    }
  }, [noteData, open]);

  const toggleTag = (tag: KnowledgeTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    const input = {
      title: title.trim(),
      content: content.trim(),
      tags: selectedTags,
      isPinned,
      isFavorite,
    };

    setIsSaving(true);
    try {
      if (noteData) {
        await updateNote.mutateAsync({ id: noteData.id, input });
        toast.success("Note updated successfully");
      } else {
        await createNote.mutateAsync(input);
        toast.success("Note added successfully");
      }
      onSaved();
      setOpen(false);
    } catch {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-2xl max-h-[85vh] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]"
          data-cy="note-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold" data-cy="note-form-title">
              {noteData ? "Edit Note" : "New Note"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X className="cursor-pointer" data-cy="note-form-close" />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="note-title" isMandatory>
                Title
              </Label>
              <Input
                id="note-title"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-cy="note-form-input-title"
              />
            </div>

            <div>
              <Label htmlFor="note-content" isMandatory>
                Content
              </Label>
              <Textarea
                id="note-content"
                placeholder="Write your note in Markdown..."
                className="min-h-[240px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                data-cy="note-form-content"
              />
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant={selectedTags.includes(tag) ? "primary" : "outlinePrimary"}
                    size="sm"
                    onClick={() => toggleTag(tag)}
                    className="text-xs"
                    data-cy="note-form-tag"
                    data-value={tag}
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
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  data-cy="note-form-pinned"
                />
                Pin this note
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  data-cy="note-form-favorite"
                />
                Add to favorites
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button type="button" variant="danger" data-cy="note-form-cancel">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={isSaving}
                data-cy="note-form-save"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddNoteForm;
