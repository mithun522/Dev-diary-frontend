import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Badge } from "../../../components/ui/badge";
import { Skeleton } from "../../../components/ui/skeleton";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import {
  CODE_EXECUTION_LANGUAGE_OPTIONS,
  CodeExecutionLanguages,
  type CodeExecutionLanguage,
} from "../../../constants/Languages";
import {
  CURRICULUM_LEVEL_COLORS,
  CURRICULUM_LEVEL_OPTIONS,
  CurriculumLevels,
  type CurriculumLevel,
  type CurriculumProblem,
} from "../../../data/curriculumData";
import {
  useCurriculumTopics,
  useCurriculumProblems,
  useCreateCurriculumProblem,
  useUpdateCurriculumProblem,
  useDeleteCurriculumProblem,
  useCurriculumProblemDetail,
} from "../../../api/hooks/useCurriculum";
import { pascalizeUnderscore } from "../../../utils/convertToPascalCase";
import { logger } from "../../../utils/logger";
import ErrorPage from "../../ErrorPage";

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const emptyForm = {
  slug: "",
  title: "",
  description: "",
  language: CodeExecutionLanguages.JAVASCRIPT as CodeExecutionLanguage,
  level: CurriculumLevels.BEGINNER as CurriculumLevel,
  starterCode: "",
  expectedStdout: "",
  afterProblemId: "",
};

const AdminCurriculumProblemsPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { data: topics } = useCurriculumTopics();
  const topic = topics?.find((t) => t.id === topicId);

  const [languageFilter, setLanguageFilter] = useState<CodeExecutionLanguage>(
    CodeExecutionLanguages.JAVASCRIPT
  );
  const {
    data: problems,
    isLoading,
    error,
  } = useCurriculumProblems(topicId ?? "", languageFilter);

  const createMutation = useCreateCurriculumProblem(topicId ?? "");
  const updateMutation = useUpdateCurriculumProblem(topicId ?? "");
  const deleteMutation = useDeleteCurriculumProblem(topicId ?? "");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [problemToDelete, setProblemToDelete] = useState<CurriculumProblem | null>(null);

  // A problem's single expected-stdout test case is loaded lazily (via the detail endpoint) only
  // once the admin actually opens it for editing, rather than fetching every row's detail up front.
  const { data: editingDetail, isFetching: isFetchingEditingDetail } =
    useCurriculumProblemDetail(editingProblemId ?? "");

  useEffect(() => {
    if (editingProblemId && editingDetail) {
      setForm({
        slug: editingDetail.slug,
        title: editingDetail.title,
        description: editingDetail.description,
        language: editingDetail.language,
        level: editingDetail.level,
        starterCode: editingDetail.starterCode,
        expectedStdout: editingDetail.sampleTestCases[0]?.expectedStdout ?? "",
        afterProblemId: "",
      });
    }
  }, [editingProblemId, editingDetail]);

  const openCreateForm = () => {
    setEditingProblemId(null);
    setForm({ ...emptyForm, language: languageFilter });
    setIsFormOpen(true);
  };

  const openEditForm = (problem: CurriculumProblem) => {
    setEditingProblemId(problem.id);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!form.slug.trim() || !form.title.trim() || !form.description.trim() || !form.starterCode.trim() || !form.expectedStdout.trim()) {
      toast.error("Slug, title, description, starter code, and expected output are all required");
      return;
    }

    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      language: form.language,
      level: form.level,
      starterCode: form.starterCode,
      testCases: [{ expectedStdout: form.expectedStdout, isSample: true }],
      ...(editingProblemId ? {} : { afterProblemId: form.afterProblemId || undefined }),
    };

    const mutation = editingProblemId
      ? updateMutation.mutateAsync({ id: editingProblemId, payload })
      : createMutation.mutateAsync(payload);

    mutation
      .then(() => {
        toast.success(editingProblemId ? "Problem updated" : "Problem created");
        setIsFormOpen(false);
      })
      .catch((err) => {
        toast.error(errorMessage(err, "Failed to save problem"));
        logger.error("Error saving curriculum problem:", err);
      });
  };

  const handleDelete = () => {
    if (!problemToDelete) return;
    deleteMutation.mutate(problemToDelete.id, {
      onSuccess: () => {
        toast.success("Problem deleted");
        setProblemToDelete(null);
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to delete problem"));
        logger.error("Error deleting curriculum problem:", err);
        setProblemToDelete(null);
      },
    });
  };

  if (error) return <ErrorPage message="Failed to fetch curriculum problems" />;

  return (
    <div className="space-y-6" data-cy="admin-curriculum-problems-page">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dsa/curriculum")}>
            &larr; Back to Topics
          </Button>
          <h1 className="text-3xl font-bold">{topic?.title ?? "Topic"} Problems</h1>
          <p className="text-muted-foreground">
            Problems shown to candidates in this order, for the selected language.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value as CodeExecutionLanguage)}
            className="text-sm bg-transparent border rounded-md px-2 py-2"
            data-cy="admin-curriculum-problem-language-filter"
          >
            {CODE_EXECUTION_LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="primary" onClick={openCreateForm} data-cy="admin-curriculum-problem-add">
            Add Problem
          </Button>
        </div>
      </div>

      {isFormOpen && (
        <Card
          className={`transition-opacity duration-200 ${
            editingProblemId && isFetchingEditingDetail
              ? "opacity-50 pointer-events-none"
              : "opacity-100"
          }`}
        >
          <CardContent className="pt-6 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  data-cy="admin-curriculum-problem-slug"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  data-cy="admin-curriculum-problem-title"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Language</label>
                <select
                  value={form.language}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, language: e.target.value as CodeExecutionLanguage }))
                  }
                  className="w-full text-sm bg-transparent border rounded-md px-2 py-2"
                  disabled={!!editingProblemId}
                  data-cy="admin-curriculum-problem-language"
                >
                  {CODE_EXECUTION_LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Level</label>
                <select
                  value={form.level}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, level: e.target.value as CurriculumLevel }))
                  }
                  className="w-full text-sm bg-transparent border rounded-md px-2 py-2"
                  data-cy="admin-curriculum-problem-level"
                >
                  {CURRICULUM_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Description (markdown)</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="min-h-[80px]"
                data-cy="admin-curriculum-problem-description"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Starter code</label>
              <Textarea
                value={form.starterCode}
                onChange={(e) => setForm((f) => ({ ...f, starterCode: e.target.value }))}
                className="min-h-[120px] font-mono text-sm"
                data-cy="admin-curriculum-problem-starter-code"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Expected output (exact stdout a correct solution must print)
              </label>
              <Textarea
                value={form.expectedStdout}
                onChange={(e) => setForm((f) => ({ ...f, expectedStdout: e.target.value }))}
                className="min-h-[80px] font-mono text-sm"
                data-cy="admin-curriculum-problem-expected-stdout"
              />
            </div>

            {!editingProblemId && (
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Insert after (within this language, leave blank to append at the end)
                </label>
                <select
                  value={form.afterProblemId}
                  onChange={(e) => setForm((f) => ({ ...f, afterProblemId: e.target.value }))}
                  className="w-full text-sm bg-transparent border rounded-md px-2 py-2"
                  data-cy="admin-curriculum-problem-after"
                >
                  <option value="">Append at the end</option>
                  {(problems ?? [])
                    .filter((p) => p.language === form.language)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        After: {p.title}
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
                data-cy="admin-curriculum-problem-save"
              >
                {editingProblemId ? "Save Changes" : "Create Problem"}
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
          <Table data-cy="admin-curriculum-problems-table">
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Level</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 4 }).map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : problems && problems.length > 0 ? (
                problems.map((problem) => (
                  <TableRow key={problem.id} data-cy="admin-curriculum-problem-row">
                    <TableCell className="font-medium">{problem.title}</TableCell>
                    <TableCell>{problem.language}</TableCell>
                    <TableCell>
                      <Badge className={CURRICULUM_LEVEL_COLORS[problem.level]}>
                        {pascalizeUnderscore(problem.level)}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex gap-2 justify-end">
                      <Button
                        variant="outlinePrimary"
                        size="sm"
                        onClick={() => openEditForm(problem)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlineDanger"
                        size="sm"
                        onClick={() => setProblemToDelete(problem)}
                        data-cy="admin-curriculum-problem-delete"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6">
                    No problems yet for this language in this topic.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {problemToDelete && (
        <AskForConfirmationModal
          showDelete
          title="Delete Problem"
          message={`Are you sure you want to delete "${problemToDelete.title}"?`}
          onCancel={() => setProblemToDelete(null)}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminCurriculumProblemsPage;
