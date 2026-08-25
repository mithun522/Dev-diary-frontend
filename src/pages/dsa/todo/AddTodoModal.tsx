import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { AxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import Button from "../../../components/ui/button";
import { TodoPriority, type DsaTodo } from "../../../data/dsaTodoData";
import { createDsaTodo, updateDsaTodo } from "../../../api/services/dsaTodo.service";
import { DSA_TODOS_QUERY_KEY } from "../../../api/hooks/useFetchDsaTodo";
import { convertToPascalCase } from "../../../utils/convertToPascalCase";
import {
  TODO_ADD_SUCCESS,
  TODO_SAVE_FAILED,
  TODO_UPDATE_SUCCESS,
} from "../../../constants/ToastMessage";

const PRIORITY_STYLES: Record<
  (typeof TodoPriority)[keyof typeof TodoPriority],
  { active: string; inactive: string }
> = {
  LOW: {
    active: "bg-green-500 border-green-500 text-white",
    inactive:
      "border-green-300 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950",
  },
  MEDIUM: {
    active: "bg-amber-500 border-amber-500 text-white",
    inactive:
      "border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950",
  },
  HIGH: {
    active: "bg-red-500 border-red-500 text-white",
    inactive:
      "border-red-300 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950",
  },
};

const EMPTY_FORM = {
  problem: "",
  link: "",
  priority: TodoPriority.MEDIUM as DsaTodo["priority"],
  notes: "",
};

interface AddTodoModalProps {
  todo?: DsaTodo;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: boolean;
}

const AddTodoModal: React.FC<AddTodoModalProps> = ({
  todo,
  open: controlledOpen,
  onOpenChange,
  trigger = true,
}) => {
  const isEdit = !!todo;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setFormData(
        todo
          ? {
              problem: todo.problem,
              link: todo.link ?? "",
              priority: todo.priority ?? TodoPriority.MEDIUM,
              notes: todo.notes ?? "",
            }
          : EMPTY_FORM
      );
      setError("");
    }
  }, [open, todo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.problem.trim() === "") {
      setError("Please enter a problem name");
      return;
    }
    setError("");

    const payload: DsaTodo = {
      problem: formData.problem,
      link: formData.link ?? "",
      priority: formData.priority,
      notes: formData.notes ?? "",
      ...(isEdit ? { isDone: todo?.isDone ?? false } : {}),
    };

    setIsSubmitting(true);
    try {
      if (isEdit && todo?.id) {
        const updated = await updateDsaTodo(todo.id, payload);
        toast.success(TODO_UPDATE_SUCCESS);

        queryClient.setQueryData<DsaTodo[]>(DSA_TODOS_QUERY_KEY, (old) =>
          (old ?? []).map((item) => (item.id === todo.id ? updated : item))
        );
      } else {
        const created = await createDsaTodo(payload);
        toast.success(TODO_ADD_SUCCESS);

        queryClient.setQueryData<DsaTodo[]>(DSA_TODOS_QUERY_KEY, (old) => [
          created,
          ...(old ?? []),
        ]);
      }

      queryClient.invalidateQueries({ queryKey: DSA_TODOS_QUERY_KEY });
      setOpen(false);
    } catch (err) {
      const error = err as AxiosError;
      toast.error(
        (error.response?.data as { message?: string })?.message ||
          TODO_SAVE_FAILED
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          <Button
            variant="primary"
            className="flex items-center gap-2 whitespace-nowrap"
            data-cy="dsa-todo-add-button"
          >
            <Plus className="h-4 w-4" />
            Add Todo
          </Button>
        </DialogTrigger>
      )}
      <DialogContent onClose={() => setOpen(false)} data-cy="dsa-todo-form-modal">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Todo" : "Add Todo"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="todo-problem" isMandatory>
              Problem
            </Label>
            <Input
              id="todo-problem"
              placeholder="Problem to solve..."
              value={formData.problem}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, problem: e.target.value }));
                setError("");
              }}
              error={error}
              data-cy="dsa-todo-problem"
            />
          </div>

          <div>
            <Label htmlFor="todo-link">Link</Label>
            <Input
              id="todo-link"
              placeholder="https://..."
              value={formData.link}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, link: e.target.value }))
              }
              data-cy="dsa-todo-link"
            />
          </div>

          <div>
            <Label htmlFor="todo-priority">Priority</Label>
            <div className="flex gap-2 mt-1" id="todo-priority">
              {Object.values(TodoPriority).map((priority) => {
                const isActive = formData.priority === priority;
                return (
                  <button
                    key={priority}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, priority }))
                    }
                    className={`flex-1 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? PRIORITY_STYLES[priority].active
                        : PRIORITY_STYLES[priority].inactive
                    }`}
                    data-cy={`dsa-todo-priority-${priority.toLowerCase()}`}
                  >
                    {convertToPascalCase(priority)}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="todo-notes">Notes</Label>
            <Textarea
              id="todo-notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              data-cy="dsa-todo-notes"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outlinePrimary"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 min-w-[70px]"
              data-cy="dsa-todo-save-button"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Update"
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTodoModal;
