import { useState } from "react";
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
import { Bookmark, Clock, Edit, Heart, Pin, Search } from "lucide-react";
import {
  knowledgeNotes,
  knowledgeBlogs,
  type KnowledgeNote,
  type KnowledgeBlog,
  type KnowledgeTag,
} from "../../data/knowledgeData";

const KnowledgePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<KnowledgeNote | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<KnowledgeBlog | null>(null);

  // Filter notes based on search
  const filteredNotes = knowledgeNotes.filter(
    (note) =>
      searchQuery === "" ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter blogs based on search
  const filteredBlogs = knowledgeBlogs.filter(
    (blog) =>
      searchQuery === "" ||
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

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

  return (
    <div className="space-y-6">
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
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            New Note
          </Button>
          <Button variant="outlinePrimary">New Blog</Button>
        </div>
      </div>

      <Tabs defaultValue="notes">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
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
                        {note.tags.slice(0, 2).map((tag, index) => (
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

                {filteredNotes.length === 0 && (
                  <div className="text-center py-8 bg-muted/50 rounded-lg">
                    <p className="text-muted-foreground">
                      No notes found matching your search.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              {selectedNote ? (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedNote.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="md">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Edit Note</DropdownMenuItem>
                          <DropdownMenuItem>
                            {selectedNote.isPinned ? "Unpin Note" : "Pin Note"}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {selectedNote.isFavorite
                              ? "Remove from Favorites"
                              : "Add to Favorites"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
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

        {/* Blogs Tab */}
        <TabsContent value="blogs" className="pt-4">
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
                  Published
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-muted"
                >
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
                    <CardHeader
                      className={`p-4 ${blog.coverImage ? "pb-0" : ""}`}
                    >
                      <div className="flex justify-between gap-2">
                        <CardTitle className="text-base line-clamp-1">
                          {blog.title}
                        </CardTitle>
                        {!blog.published && (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 mt-1">
                        {blog.summary}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 2).map((tag, index) => (
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
                  {selectedBlog.coverImage && (
                    <div className="relative h-48 md:h-64 overflow-hidden rounded-t-lg">
                      <img
                        src={selectedBlog.coverImage}
                        alt={selectedBlog.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>{selectedBlog.title}</CardTitle>
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
                            {selectedBlog.published ? "Unpublish" : "Publish"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Blog
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="mt-1">
                      {selectedBlog.summary}
                    </CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedBlog.tags.map((tag, index) => (
                        <Badge key={index} className={getTagColor(tag)}>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{selectedBlog.readTime} min read</span>
                      </div>
                      <div>{formatDate(selectedBlog.updatedAt)}</div>
                      {!selectedBlog.published && (
                        <Badge variant="outline">Draft</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose dark:prose-invert max-w-none">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedBlog.content
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
                  <Edit className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Select a blog</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Choose a blog from the sidebar or create a new one to get
                    started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KnowledgePage;
