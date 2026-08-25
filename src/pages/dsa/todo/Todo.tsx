import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  ExternalLink,
  Pencil,
  Trash2,
} from "lucide-react";
import { Checkbox } from "../../../components/ui/checkbox";
import { Badge } from "../../../components/ui/badge";
import Button from "../../../components/ui/button";
import AskForConfirmationModal from "../../../components/AskForConfirmationModal";
import ErrorPage from "../../ErrorPage";
import {
  useFetchDsaTodos,
  DSA_TODOS_QUERY_KEY,
} from "../../../api/hooks/useFetchDsaTodo";
import { deleteDsaTodo, updateDsaTodo } from "../../../api/services/dsaTodo.service";
import type { DsaTodo } from "../../../data/dsaTodoData";
import {
  getPriorityAccentBorder,
  getPriorityColor,
} from "../../../utils/colorVariations";
import { convertToPascalCase } from "../../../utils/convertToPascalCase";
import {
  TODO_DELETE_FAILED,
  TODO_DELETE_SUCCESS,
  TODO_SAVE_FAILED,
} from "../../../constants/ToastMessage";
import AddTodoModal from "./AddTodoModal";
import TodoShimmer from "./TodoShimmer";

type Filter = "all" | "pending" | "done";

const Todo: React.FC = () => {
  const { data: todos = [], isLoading, error } = useFetchDsaTodos();
  const [filter, setFilter] = useState<Filter>("all");
  const [editingTodo, setEditingTodo] = useState<DsaTodo | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<DsaTodo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const pendingCount = todos.filter((t) => !t.isDone).length;
  const doneCount = todos.length - pendingCount;

  const visibleTodos = useMemo(() => {
    const filtered = todos.filter((t) => {
      if (filter === "pending") return !t.isDone;
      if (filter === "done") return !!t.isDone;
      return true;
    });

    // Pending-first, otherwise the list gets more cluttered with completed items as you go.
    return [...filtered].sort((a, b) => Number(!!a.isDone) - Number(!!b.isDone));
  }, [todos, filter]);

  const handleToggleDone = async (todo: DsaTodo) => {
    if (!todo.id) return;

    setTogglingId(todo.id);
    const nextIsDone = !todo.isDone;

    queryClient.setQueryData<DsaTodo[]>(DSA_TODOS_QUERY_KEY, (old) =>
      (old ?? []).map((item) =>
        item.id === todo.id ? { ...item, isDone: nextIsDone } : item
      )
    );

    try {
      await updateDsaTodo(todo.id, {
        problem: todo.problem,
        link: todo.link ?? "",
        priority: todo.priority,
        notes: todo.notes ?? "",
        isDone: nextIsDone,
      });
    } catch (err) {
      const error = err as AxiosError;
      toast.error(
        (error.response?.data as { message?: string })?.message ||
          TODO_SAVE_FAILED
      );
      // Roll back the optimistic flip since the request failed.
      queryClient.setQueryData<DsaTodo[]>(DSA_TODOS_QUERY_KEY, (old) =>
        (old ?? []).map((item) =>
          item.id === todo.id ? { ...item, isDone: todo.isDone } : item
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!todoToDelete?.id) return;

    setIsDeleting(true);
    const deletedId = todoToDelete.id;

    try {
      await deleteDsaTodo(deletedId);
      toast.success(TODO_DELETE_SUCCESS);

      queryClient.setQueryData<DsaTodo[]>(DSA_TODOS_QUERY_KEY, (old) =>
        (old ?? []).filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: DSA_TODOS_QUERY_KEY });
    } catch (err) {
      const error = err as AxiosError;
      toast.error(
        (error.response?.data as { message?: string })?.message ||
          TODO_DELETE_FAILED
      );
    } finally {
      setIsDeleting(false);
      setTodoToDelete(null);
    }
  };

  if (error) return <ErrorPage message="Failed to fetch todos" />;

  return (
    <div className="space-y-5" data-cy="dsa-todo-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <Circle className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
            <span className="font-medium">{pendingCount}</span>
            <span className="text-muted-foreground">pending</span>
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span className="font-medium">{doneCount}</span>
            <span className="text-muted-foreground">done</span>
          </span>
        </div>
        <AddTodoModal />
      </div>

      {!isLoading && todos.length > 0 && (
        <div className="flex gap-1 border-b">
          {(
            [
              { key: "all", label: "All" },
              { key: "pending", label: "Pending" },
              { key: "done", label: "Done" },
            ] as { key: Filter; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                filter === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-cy={`dsa-todo-filter-${key}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <TodoShimmer />
      ) : todos.length === 0 ? (
        <div className="flex flex-col gap-2 justify-center items-center py-16">
          <ClipboardList className="h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium">No todos yet</h3>
          <p className="text-muted-foreground">
            Add problems you want to solve later.
          </p>
        </div>
      ) : visibleTodos.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No {filter} todos.
        </p>
      ) : (
        <div className="space-y-2">
          {visibleTodos.map((todo) => (
            <div
              key={todo.id}
              className={`group flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/40 ${getPriorityAccentBorder(
                todo.priority
              )} ${todo.isDone ? "opacity-60" : ""}`}
              data-cy="dsa-todo-item"
            >
              <Checkbox
                checked={!!todo.isDone}
                disabled={togglingId === todo.id}
                onCheckedChange={() => handleToggleDone(todo)}
                className="mt-1"
                data-cy="dsa-todo-checkbox"
              />
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium truncate ${
                    todo.isDone ? "line-through text-muted-foreground" : ""
                  }`}
                  data-cy="dsa-todo-problem-name"
                >
                  {todo.problem}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  {todo.priority && (
                    <Badge className={getPriorityColor(todo.priority)}>
                      {convertToPascalCase(todo.priority)}
                    </Badge>
                  )}
                  {todo.link && (
                    <a
                      href={todo.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Link
                    </a>
                  )}
                </div>
                {todo.notes && (
                  <p className="text-sm text-muted-foreground mt-2 whitespace-pre-line line-clamp-3">
                    {todo.notes}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingTodo(todo)}
                  data-cy="dsa-todo-edit-button"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTodoToDelete(todo)}
                  data-cy="dsa-todo-delete-button"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTodo && (
        <AddTodoModal
          todo={editingTodo}
          open={!!editingTodo}
          onOpenChange={(open) => !open && setEditingTodo(null)}
          trigger={false}
        />
      )}

      {todoToDelete && (
        <AskForConfirmationModal
          title="Delete Todo"
          message={`Are you sure you want to delete "${todoToDelete.problem}"?`}
          showDelete
          isDeleting={isDeleting}
          onCancel={() => setTodoToDelete(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default Todo;
