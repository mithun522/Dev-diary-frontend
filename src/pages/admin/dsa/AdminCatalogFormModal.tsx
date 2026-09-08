import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { X, Plus, Trash2, Sparkles } from "lucide-react";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Label } from "../../../components/ui/label";
import { Checkbox } from "../../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { MultiSelect } from "../../../components/ui/multiselect";
import { convertToPascalCase } from "../../../utils/convertToPascalCase";
import { logger } from "../../../utils/logger";
import { DifficultyLevels } from "../../../data/dsaProblemsData";
import type { CatalogDifficulty } from "../../../data/catalogData";
import type { Topic } from "../../../constants/Topics";
import {
  useFetchCatalogProblemDetail,
  useGenerateTestCases,
} from "../../../api/hooks/useFetchCatalog";
import {
  useCreateCatalogProblem,
  useUpdateCatalogProblem,
} from "../../../api/hooks/useAdminCatalog";
import type { CatalogProblemInputPayload } from "../../../api/services/adminCatalog.service";

type TestCaseRow = {
  id?: string;
  argsJson: string;
  expectedJson: string;
  isSample: boolean;
};

type CatalogFormValues = {
  slug: string;
  title: string;
  difficulty: CatalogDifficulty;
  topics: Topic[];
  description: string;
  functionName: string;
  paramNamesText: string; // comma-separated parameter names
  starterCode: string;
  testCases: TestCaseRow[];
};

const emptyTestCaseRow = (): TestCaseRow => ({
  argsJson: "[]",
  expectedJson: "",
  isSample: true,
});

const emptyDefaults: CatalogFormValues = {
  slug: "",
  title: "",
  difficulty: DifficultyLevels.EASY,
  topics: [],
  description: "",
  functionName: "",
  paramNamesText: "",
  starterCode: "",
  testCases: [emptyTestCaseRow()],
};

type AdminCatalogFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  problemId?: string | null; // if provided -> edit mode
};

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const AdminCatalogFormModal: React.FC<AdminCatalogFormModalProps> = ({
  open,
  setOpen,
  problemId,
}) => {
  const [disabled, setDisabled] = useState(false);
  const [referenceSolution, setReferenceSolution] = useState("");

  const { data: problemDetail, isLoading: isLoadingDetail } =
    useFetchCatalogProblemDetail(problemId ?? undefined);
  const createMutation = useCreateCatalogProblem();
  const updateMutation = useUpdateCatalogProblem();
  const generateMutation = useGenerateTestCases(problemId ?? "");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CatalogFormValues>({ defaultValues: emptyDefaults });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "testCases",
  });

  // Populate the form once the full problem detail (with sampleTestCases) has loaded in edit
  // mode; reset to a blank form for create mode.
  useEffect(() => {
    if (!open) return;
    setReferenceSolution("");

    if (problemId && problemDetail) {
      reset({
        slug: problemDetail.slug,
        title: problemDetail.title,
        difficulty: problemDetail.difficulty,
        topics: problemDetail.topics,
        description: problemDetail.description,
        functionName: problemDetail.functionName,
        paramNamesText: (problemDetail.paramNames ?? []).join(", "),
        starterCode: problemDetail.starterCode,
        testCases:
          problemDetail.sampleTestCases.length > 0
            ? problemDetail.sampleTestCases.map((tc) => ({
                id: tc.id,
                argsJson: JSON.stringify(tc.args),
                expectedJson: JSON.stringify(tc.expected),
                isSample: tc.isSample,
              }))
            : [emptyTestCaseRow()],
      });
    } else if (!problemId) {
      reset(emptyDefaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, problemId, problemDetail, reset]);

  const handleGenerateTestCases = () => {
    if (!problemId) return;
    if (!referenceSolution.trim()) {
      toast.error("Paste a known-correct reference solution first");
      return;
    }

    generateMutation.mutate(referenceSolution, {
      onSuccess: (testCases) => {
        setValue(
          "testCases",
          testCases.length > 0
            ? testCases.map((tc) => ({
                id: tc.id,
                argsJson: JSON.stringify(tc.args),
                expectedJson: JSON.stringify(tc.expected),
                isSample: tc.isSample,
              }))
            : [emptyTestCaseRow()]
        );
        toast.success("Test cases generated — review before saving");
      },
      onError: (err) => {
        toast.error(errorMessage(err, "Failed to generate test cases"));
        logger.error("Error generating test cases:", err);
      },
    });
  };

  const onSubmit = async (data: CatalogFormValues) => {
    setDisabled(true);

    let testCases: CatalogProblemInputPayload["testCases"];
    try {
      testCases = data.testCases.map((tc, index) => {
        let args: unknown[];
        let expected: unknown;
        try {
          args = JSON.parse(tc.argsJson);
        } catch {
          throw new Error(`Test case ${index + 1}: args is not valid JSON`);
        }
        try {
          expected = JSON.parse(tc.expectedJson);
        } catch {
          throw new Error(`Test case ${index + 1}: expected is not valid JSON`);
        }
        if (!Array.isArray(args)) {
          throw new Error(`Test case ${index + 1}: args must be a JSON array`);
        }
        // Backend's TestCaseInput has additionalProperties: false and no `id` property — an
        // existing test case's `id` (carried in the form from CatalogProblemDetail's response,
        // or from a generate-test-cases result) must never be sent back, or API Gateway rejects
        // the whole request before it reaches the Lambda.
        return {
          args,
          expected,
          isSample: tc.isSample,
        };
      });
    } catch (parseError) {
      toast.error(
        parseError instanceof Error ? parseError.message : "Invalid test case JSON"
      );
      setDisabled(false);
      return;
    }

    const payload: CatalogProblemInputPayload = {
      slug: data.slug,
      title: data.title,
      difficulty: data.difficulty,
      topics: data.topics ?? [],
      description: data.description,
      functionName: data.functionName,
      paramNames: data.paramNamesText
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean),
      starterCode: data.starterCode,
      testCases,
    };

    try {
      if (problemId) {
        await updateMutation.mutateAsync({ id: problemId, payload });
        toast.success("Catalog problem updated successfully");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Catalog problem added successfully");
      }
      setOpen(false);
      reset(emptyDefaults);
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save catalog problem"));
      logger.error("Error submitting catalog problem:", error);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[92vw] max-w-2xl max-h-[85vh] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]"
          data-cy="admin-catalog-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title
              className="text-lg font-semibold"
              data-cy="admin-catalog-form-title"
            >
              {problemId ? "Edit Catalog Problem" : "Add Catalog Problem"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X
                className="text-primary-background cursor-pointer"
                data-cy="admin-catalog-form-close"
              />
            </Dialog.Close>
          </div>

          {problemId && isLoadingDetail ? (
            <div
              className="h-40 w-full bg-gray-300 animate-pulse rounded"
              data-cy="admin-catalog-form-loading"
            />
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Label htmlFor="slug" isMandatory>
                Slug
              </Label>
              <div>
                <Input
                  id="slug"
                  placeholder="two-sum"
                  {...register("slug", { required: "Slug is required" })}
                  className={errors.slug ? "border border-red-600" : ""}
                  data-cy="admin-catalog-form-slug"
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm" data-cy="admin-catalog-form-slug-error">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <Label htmlFor="title" isMandatory>
                Title
              </Label>
              <div>
                <Input
                  id="title"
                  placeholder="Two Sum"
                  {...register("title", { required: "Title is required" })}
                  className={errors.title ? "border border-red-600" : ""}
                  data-cy="admin-catalog-form-title-input"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm" data-cy="admin-catalog-form-title-error">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <Label htmlFor="difficulty">Difficulty</Label>
              <Controller
                name="difficulty"
                control={control}
                defaultValue={DifficultyLevels.EASY}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      className="w-full"
                      data-cy="admin-catalog-form-difficulty-trigger"
                    >
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent
                      className="z-[9999]"
                      data-cy="admin-catalog-form-difficulty-content"
                    >
                      {Object.values(DifficultyLevels).map((level) => (
                        <SelectItem key={level} value={level}>
                          {convertToPascalCase(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />

              <Label htmlFor="topics">Topics</Label>
              <Controller
                name="topics"
                control={control}
                render={({ field }) => (
                  <MultiSelect
                    selected={field.value}
                    onSelectedChange={field.onChange}
                    placeholder="Select problem topics..."
                  />
                )}
              />

              <Label htmlFor="description" isMandatory>
                Description (Markdown)
              </Label>
              <div>
                <Textarea
                  id="description"
                  placeholder="Problem description in Markdown..."
                  rows={6}
                  {...register("description", {
                    required: "Description is required",
                  })}
                  className={errors.description ? "border border-red-600" : ""}
                  data-cy="admin-catalog-form-description"
                />
                {errors.description && (
                  <p
                    className="text-red-500 text-sm"
                    data-cy="admin-catalog-form-description-error"
                  >
                    {errors.description.message}
                  </p>
                )}
              </div>

              <Label htmlFor="functionName" isMandatory>
                Function name
              </Label>
              <div>
                <Input
                  id="functionName"
                  placeholder="twoSum"
                  {...register("functionName", {
                    required: "Function name is required",
                  })}
                  className={errors.functionName ? "border border-red-600" : ""}
                  data-cy="admin-catalog-form-function-name"
                />
                {errors.functionName && (
                  <p
                    className="text-red-500 text-sm"
                    data-cy="admin-catalog-form-function-name-error"
                  >
                    {errors.functionName.message}
                  </p>
                )}
              </div>

              <Label htmlFor="paramNamesText">Parameter names (comma-separated)</Label>
              <Input
                id="paramNamesText"
                placeholder="nums, target"
                {...register("paramNamesText")}
                data-cy="admin-catalog-form-param-names"
              />

              <Label htmlFor="starterCode" isMandatory>
                Starter code
              </Label>
              <div>
                <Textarea
                  id="starterCode"
                  placeholder="function twoSum(nums, target) {\n\n}"
                  rows={6}
                  {...register("starterCode", {
                    required: "Starter code is required",
                  })}
                  className={`font-mono ${errors.starterCode ? "border border-red-600" : ""}`}
                  data-cy="admin-catalog-form-starter-code"
                />
                {errors.starterCode && (
                  <p
                    className="text-red-500 text-sm"
                    data-cy="admin-catalog-form-starter-code-error"
                  >
                    {errors.starterCode.message}
                  </p>
                )}
              </div>

              {problemId && (
                <div className="rounded-md border p-3 space-y-2">
                  <Label htmlFor="referenceSolution">
                    Reference solution (for test case generation)
                  </Label>
                  <Textarea
                    id="referenceSolution"
                    placeholder="A known-correct JS implementation of the function, used to compute expected outputs..."
                    rows={4}
                    value={referenceSolution}
                    onChange={(e) => setReferenceSolution(e.target.value)}
                    className="font-mono"
                    data-cy="admin-catalog-reference-solution"
                  />
                  <Button
                    type="button"
                    variant="outlinePrimary"
                    size="sm"
                    onClick={handleGenerateTestCases}
                    disabled={generateMutation.isPending}
                    className="flex items-center gap-1"
                    data-cy="admin-catalog-generate-test-cases"
                  >
                    <Sparkles size={14} />
                    {generateMutation.isPending ? "Generating..." : "Generate test cases"}
                  </Button>
                </div>
              )}

              <Label>Test cases</Label>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-md border p-3 space-y-2"
                    data-cy="admin-catalog-test-case-row"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Test case {index + 1}</span>
                      <Trash2
                        size={16}
                        className="cursor-pointer text-destructive"
                        onClick={() => remove(index)}
                        data-cy="admin-catalog-test-case-remove"
                      />
                    </div>

                    <Label htmlFor={`testCases.${index}.argsJson`}>
                      Args (JSON array)
                    </Label>
                    <Input
                      id={`testCases.${index}.argsJson`}
                      placeholder="[[2,7,11,15], 9]"
                      {...register(
                        `testCases.${index}.argsJson` as `testCases.${number}.argsJson`
                      )}
                      className="font-mono"
                      data-cy="admin-catalog-test-case-args"
                    />

                    <Label htmlFor={`testCases.${index}.expectedJson`}>
                      Expected (JSON)
                    </Label>
                    <Input
                      id={`testCases.${index}.expectedJson`}
                      placeholder="[0,1]"
                      {...register(
                        `testCases.${index}.expectedJson` as `testCases.${number}.expectedJson`
                      )}
                      className="font-mono"
                      data-cy="admin-catalog-test-case-expected"
                    />

                    <div className="flex items-center gap-2">
                      <Controller
                        name={`testCases.${index}.isSample` as `testCases.${number}.isSample`}
                        control={control}
                        render={({ field: checkboxField }) => (
                          <Checkbox
                            checked={checkboxField.value}
                            onCheckedChange={checkboxField.onChange}
                            data-cy="admin-catalog-test-case-is-sample"
                          />
                        )}
                      />
                      <Label htmlFor={`testCases.${index}.isSample`} className="font-normal">
                        Visible as sample test case
                      </Label>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append(emptyTestCaseRow())}
                className="flex items-center gap-1"
                data-cy="admin-catalog-add-test-case"
              >
                <Plus size={14} />
                Add test case
              </Button>

              <div className="flex justify-end gap-2 pt-4">
                <Dialog.Close asChild>
                  <Button type="button" variant="danger" data-cy="admin-catalog-form-cancel">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={disabled}
                  className="flex items-center justify-center gap-2 min-w-[70px]"
                  data-cy="admin-catalog-form-save"
                >
                  {disabled ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AdminCatalogFormModal;
