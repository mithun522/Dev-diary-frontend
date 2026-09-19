import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Card, CardContent } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Button from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import {
  useCurriculumTopics,
  useCreateCurriculumTopic,
  useUpdateCurriculumTopic,
  useDeleteCurriculumTopic,
} from "../../../api/hooks/useCurriculum";
import type { CurriculumTopic } from "../../../data/curriculumData";
import { logger } from "../../../utils/logger";
import ErrorPage from "../../ErrorPage";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const emptyForm = { slug: "", title: "", description: "", afterTopicId: "" };

const AdminCurriculumTopicsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: topics, isLoading, error } = useCurriculumTopics();
  const createMutation = useCreateCurriculumTopic();
  const updateMutation = useUpdateCurriculumTopic();
  const deleteMutation = useDeleteCurriculumTopic();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<CurriculumTopic | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [topicToDelete, setTopicToDelete] = useState<CurriculumTopic | null>(null);

  const openCreateForm = () => {
    setEditingTopic(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (topic: CurriculumTopic) => {
    setEditingTopic(topic);
    setForm({
      slug: topic.slug,
      title: topic.title,
      description: topic.description ?? "",
      afterTopicId: "",
    });
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!form.slug.trim() || !form.title.trim()) {
      toast.error("Slug and title are required");
      return;
    }

    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      ...(editingTopic ? {} : { afterTopicId: form.afterTopicId || undefined }),
    };

    const mutation = editingTopic
      ? updateMutation.mutateAsync({ id: editingTopic.id, payload })
      : createMutation.mutateAsync(payload);

    mutation
      .then(() => {
        toast.success(editingTopic ? "Topic updated" : "Topic created");
        setIsFormOpen(false);
      })
      .catch((err) => {
        toast.error(errorMessage(err, "Failed to save topic"));
        logger.error("Error saving curriculum topic:", err);
      });
  };

  const handleDelete = () => {
    if (!topicToDelete) return;
    deleteMutation.mutate(topicToDelete.id, {
      onSuccess: () => {
        toast.success("Topic deleted");
        setTopicToDelete(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to delete topic"));
        logger.error("Error deleting curriculum topic:", err);
        setTopicToDelete(null);
      },
    });
  };

  if (error) return <ErrorPage message="Failed to fetch curriculum topics" />;

  return (
    <div className="space-y-6" data-cy="admin-curriculum-topics-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Curriculum Topics</h1>
          <p className="text-muted-foreground">
            Topic-by-topic beginner exercises, shown to candidates in this order.
          </p>
        </div>
        <Button variant="primary" onClick={openCreateForm} data-cy="admin-curriculum-topic-add">
          Add Topic
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  data-cy="admin-curriculum-topic-slug"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  data-cy="admin-curriculum-topic-title"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                data-cy="admin-curriculum-topic-description"
              />
            </div>
            {!editingTopic && (
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Insert after (leave blank to append at the end)
                </label>
                <select
                  value={form.afterTopicId}
                  onChange={(e) => setForm((f) => ({ ...f, afterTopicId: e.target.value }))}
                  className="w-full text-sm bg-transparent border rounded-md px-2 py-2"
                  data-cy="admin-curriculum-topic-after"
                >
                  <option value="">Append at the end</option>
                  {(topics ?? []).map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      After: {topic.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                data-cy="admin-curriculum-topic-save"
              >
                {editingTopic ? "Save Changes" : "Create Topic"}
              </Button>
              <Button variant="ghost" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table data-cy="admin-curriculum-topics-table">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : topics && topics.length > 0 ? (
                topics.map((topic) => (
                  <TableRow key={topic.id} data-cy="admin-curriculum-topic-row">
                    <TableCell
                      className="font-medium cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/dsa/curriculum/${topic.id}`)}
                    >
                      {topic.title}
                    </TableCell>
                    <TableCell>{topic.slug}</TableCell>
                    <TableCell className="max-w-md truncate">{topic.description}</TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button variant="outlinePrimary" size="sm" onClick={() => openEditForm(topic)}>
                        Edit
                      </Button>
                      <Button
                        variant="outlineDanger"
                        size="sm"
                        onClick={() => setTopicToDelete(topic)}
                        data-cy="admin-curriculum-topic-delete"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No curriculum topics yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {topicToDelete && (
        <AskForConfirmationModal
          showDelete
          title="Delete Topic"
          message={`Are you sure you want to delete "${topicToDelete.title}"? All its problems will be deleted too.`}
          onCancel={() => setTopicToDelete(null)}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminCurriculumTopicsPage;
