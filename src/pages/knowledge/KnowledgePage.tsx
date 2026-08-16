import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import Button from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Bookmark,
  Clock,
  Edit,
  Heart,
  Newspaper,
  Pin,
  Search,
} from "lucide-react";
import { type KnowledgeNote, type KnowledgeTag } from "../../data/knowledgeData";
import AddBlogForm from "./Blogs/AddBlogForm";
import Blog from "./Blogs/Blog";
import AddNoteForm from "./Notes/AddNoteForm";
import { createBlog } from "../../api/services/blogs.service";
import { formatDate } from "../../utils/formatDate";
import { logger } from "../../utils/logger";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import {
  useDeleteNote,
  useFetchNotes,
  useUpdateNote,
} from "../../api/hooks/useFetchNotes";
import { useDebounce } from "../../api/hooks/use-debounce";
import AskForConfirmationModal from "../../components/AskForConfirmationModal";

const KnowledgePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<KnowledgeNote | null>(null);
  const [isAddNewBlog, setIsAddNewBlog] = useState<boolean>(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isDeleteNoteOpen, setIsDeleteNoteOpen] = useState(false);
  const [tabsValue, setTabsValue] = useState("notes");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const {
    data: notesData,
    isLoading: isLoadingNotes,
    fetchNextPage: fetchNextNotesPage,
    hasNextPage: hasNextNotesPage,
    isFetchingNextPage: isFetchingNextNotesPage,
  } = useFetchNotes(debouncedSearch);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const filteredNotes = notesData?.pages.flatMap((page) => page.notes) ?? [];

  // Get tag color
  const getTagColor = (tag: KnowledgeTag): string => {
    const colors: Record<KnowledgeTag, string> = {
      algorithms:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "data-structures":
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      javascript:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      python:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      "system-design":
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      behavioral:
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      frontend:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      backend: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      database: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
      networking:
        "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      security: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
      architecture:
        "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    };

    return colors[tag];
  };

  const queryClient = useQueryClient();

  const handleSubmitBlog = async (blogData: {
    title: string;
    summary: string;
    content: string;
    tags: KnowledgeTag[];
    coverImage: File;
    published: boolean;
    readTime: number;
  }) => {
    try {
      // readTime is estimated server-side (see knowledge-service's blogsRepo.js) — no need to
      // send blogData.readTime, our create schema doesn't accept it anyway.
      await createBlog({
        title: blogData.title,
        summary: blogData.summary,
        content: blogData.content,
        tags: blogData.tags,
        published: blogData.published,
        coverImage: blogData.coverImage,
      });
      toast.success(
        blogData.published ? "Blog published successfully" : "Draft saved"
      );
      queryClient.invalidateQueries({ queryKey: ["blogs"] });
      setIsAddNewBlog(false);
    } catch (error) {
      logger.error("Error adding blog:", error);
      toast.error("Failed to save blog");
    }
  };

  const searchKnowledge = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setSearchQuery(value);
    setTabsValue(name);
  };

  if (isAddNewBlog) {
    return (
      <AddBlogForm
        onSubmit={handleSubmitBlog}
        onCancel={() => setIsAddNewBlog(false)}
      />
    );
  }

  return (
    <div className="space-y-6" data-cy="knowledge-page">
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">
          Your personal notes and blog articles.
        </p>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes, blogs, and tags..."
            className="pl-10"
            value={searchQuery}
            name={tabsValue}
            onChange={searchKnowledge}
            data-cy="knowledge-search"
          />
        </div>

        <div className="flex gap-2">
          <Button
            className="flex justify-center items-center"
            onClick={() => {
              setSelectedNote(null);
              setIsEditingNote(false);
              setIsAddNoteOpen(true);
            }}
            data-cy="knowledge-new-note-button"
          >
            <Edit className="h-4 w-4 mr-2" />
            New Note
          </Button>
          <Button
            className="flex justify-center items-center"
            variant="outlinePrimary"
            onClick={() => setIsAddNewBlog(true)}
            data-cy="knowledge-new-blog-button"
          >
            <Newspaper className="h-4 w-4 mr-2" />
            New Blog
          </Button>
        </div>
      </div>

      <Tabs value={tabsValue} onValueChange={setTabsValue}>
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="notes" data-cy="knowledge-tab-notes">
            Notes
          </TabsTrigger>
          <TabsTrigger value="blogs" data-cy="knowledge-tab-blogs">
            Blogs
          </TabsTrigger>
        </TabsList>

        {/* Notes Tab */}
        <TabsContent value="notes" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
                  All
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
                  Pinned
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
                  Favorites
                </Badge>
              </div>

              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <Card
                    key={note.id}
                    className={`cursor-pointer hover:ring-1 hover:ring-primary/20 transition-shadow ${
                      selectedNote?.id === note.id ? "ring-1 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedNote(note)}
                    data-cy="note-card"
                  >
                    <CardHeader className="p-4 pb-0">
                      <div className="flex justify-between gap-2">
                        <CardTitle className="text-base line-clamp-1">
                          {note.title}
                        </CardTitle>
                        <div className="flex gap-1">
                          {note.isPinned && (
                            <Pin className="h-4 w-4 text-muted-foreground" />
                          )}
                          {note.isFavorite && (
                            <Heart className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                      <CardDescription className="flex flex-wrap gap-1 mt-1">
                        {note?.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            className={`text-xs ${getTagColor(tag)}`}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{note.tags.length - 2}
                          </Badge>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {note.content
                          .replace(/#+\s*(.*)\n/g, "")
                          .replace(/```.*```/gs, "")
                          .slice(0, 100)}
                        ...
                      </p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.updatedAt)}
                      </span>
                    </CardFooter>
                  </Card>
                ))}

                {!isLoadingNotes && filteredNotes.length === 0 && (
                  <div
                    className="text-center py-8 bg-muted/50 rounded-lg"
                    data-cy="notes-empty"
                  >
                    <p className="text-muted-foreground">
                      No notes found matching your search.
                    </p>
                  </div>
                )}

                {isLoadingNotes && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Loading notes...
                  </div>
                )}

                {hasNextNotesPage && (
                  <div className="flex justify-center">
                    <Button
                      variant="outlinePrimary"
                      onClick={() => fetchNextNotesPage()}
                      disabled={isFetchingNextNotesPage}
                      className="px-4 py-2 text-sm rounded-lg disabled:opacity-50"
                    >
                      {isFetchingNextNotesPage ? "Loading..." : "Load More"}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              {selectedNote ? (
                <Card data-cy="note-detail">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedNote.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="md"
                            data-cy="note-actions-trigger"
                          >
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setIsEditingNote(true);
                              setIsAddNoteOpen(true);
                            }}
                            data-cy="note-edit-action"
                          >
                            Edit Note
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              const updated = await updateNote.mutateAsync({
                                id: selectedNote.id,
                                input: {
                                  title: selectedNote.title,
                                  content: selectedNote.content,
                                  tags: selectedNote.tags,
                                  isPinned: !selectedNote.isPinned,
                                  isFavorite: selectedNote.isFavorite,
                                },
                              });
                              setSelectedNote(updated);
                            }}
                            data-cy="note-pin-action"
                          >
                            {selectedNote.isPinned ? "Unpin Note" : "Pin Note"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={async () => {
                              const updated = await updateNote.mutateAsync({
                                id: selectedNote.id,
                                input: {
                                  title: selectedNote.title,
                                  content: selectedNote.content,
                                  tags: selectedNote.tags,
                                  isPinned: selectedNote.isPinned,
                                  isFavorite: !selectedNote.isFavorite,
                                },
                              });
                              setSelectedNote(updated);
                            }}
                            data-cy="note-favorite-action"
                          >
                            {selectedNote.isFavorite
                              ? "Remove from Favorites"
                              : "Add to Favorites"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setIsDeleteNoteOpen(true)}
                            data-cy="note-delete-action"
                          >
                            Delete Note
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedNote.tags.map((tag, index) => (
                        <Badge key={index} className={getTagColor(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-2 text-xs">
                      <Clock className="h-3 w-3" /> Updated{" "}
                      {formatDate(selectedNote.updatedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedNote.content
                            .replace(/^# (.*$)/gm, "<h1>$1</h1>")
                            .replace(/^## (.*$)/gm, "<h2>$1</h2>")
                            .replace(/^### (.*$)/gm, "<h3>$1</h3>")
                            .replace(/\n/g, "<br>")
                            .replace(
                              /```([^`]+)```/g,
                              "<pre><code>$1</code></pre>"
                            ),
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-muted/50 rounded-lg">
                  <Bookmark className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a note</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Choose a note from the sidebar or create a new one to get
                    started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="blogs" className="pt-4">
          <Blog searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>

      {isAddNoteOpen && (
        <AddNoteForm
          open={isAddNoteOpen}
          setOpen={setIsAddNoteOpen}
          noteData={isEditingNote ? selectedNote : null}
          onSaved={() => setIsEditingNote(false)}
        />
      )}

      {isDeleteNoteOpen && selectedNote && (
        <AskForConfirmationModal
          title="Delete Note"
          message="Are you sure you want to delete this note?"
          showDelete
          onCancel={() => setIsDeleteNoteOpen(false)}
          onDelete={async () => {
            await deleteNote.mutateAsync(selectedNote.id);
            setSelectedNote(null);
            setIsDeleteNoteOpen(false);
            toast.success("Note deleted successfully");
          }}
        />
      )}
    </div>
  );
};

export default KnowledgePage;
