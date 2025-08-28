import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { DifficultyLevels, type DSAProblem } from "../../data/dsaProblemsData";
import { X } from "lucide-react";
import Button from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import AxiosInstance from "../../utils/AxiosInstance";
import { DSA } from "../../constants/Api";
import { convertToPascalCase } from "../../utils/convertToPascalCase";
import { MultiSelect } from "../../components/ui/multiselect";
import { logger } from "../../utils/logger";
import { ProgrammingLanguages } from "../../constants/Languages";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { Label } from "../../components/ui/label";
import { useForm, Controller } from "react-hook-form";

type DsaFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  problemData?: DSAProblem | null; // if provided → edit mode
};

const DsaFormModal: React.FC<DsaFormModalProps> = ({
  open,
  setOpen,
  problemData,
}) => {
  const queryClient = useQueryClient();
  const [disabled, setDisabled] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<DSAProblem>({
    defaultValues: problemData || {
      problem: "",
      difficulty: DifficultyLevels.EASY,
      language: ProgrammingLanguages.JAVASCRIPT,
      topics: [],
      link: "",
      status: "SOLVED",
      updatedAt: "",
      notes: "",
      bruteForceSolution: "",
      betterSolution: "",
      optimisedSolution: "",
    },
  });

  // Reset values whenever modal opens in edit mode
  useEffect(() => {
    if (problemData) {
      reset(problemData);
    }
  }, [problemData, reset]);

  const onSubmit = async (data: DSAProblem) => {
    setDisabled(true);
    try {
      let response;
      if (problemData) {
        // EDIT
        response = await AxiosInstance.put(`${DSA}/${problemData.id}`, data);
        if (response.status === 200) {
          toast.success("DSA problem updated successfully");
        }
      } else {
        // ADD
        response = await AxiosInstance.post(DSA, data);
        if (response.status === 200) {
          toast.success("DSA problem added successfully");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["dsa"] });
      setOpen(false);
      reset();
    } catch (error) {
      logger.error("Error submitting problem:", error);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md max-h-[600px] overflow-auto -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {problemData ? "Edit DSA Problem" : "Add DSA Problem"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X className="text-primary-background" />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="problem" isMandatory>
              Problem
            </Label>
            <div>
              <Input
                id="problem"
                placeholder="Problem title"
                {...register("problem", {
                  required: "Problem title is required",
                })}
                className={errors.problem ? "border border-red-600" : ""}
              />
              {errors.problem && (
                <p className="text-red-500 text-sm">{errors.problem.message}</p>
              )}
            </div>

            <Label htmlFor="difficulty">Difficulty</Label>
            <Controller
              name="difficulty"
              control={control}
              defaultValue={DifficultyLevels.EASY}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DifficultyLevels).map((level) => (
                      <SelectItem key={level} value={level}>
                        {convertToPascalCase(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />

            <Label htmlFor="language">Language</Label>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ProgrammingLanguages).map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {convertToPascalCase(lang)}
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

            <Label htmlFor="link">Problem Link</Label>
            <Input id="link" placeholder="https://..." {...register("link")} />

            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes..."
              {...register("notes")}
            />

            <Label htmlFor="bruteForceSolution" isMandatory>
              Solution
            </Label>
            <div>
              <Textarea
                id="bruteForceSolution"
                placeholder="Write your solution here..."
                {...register("bruteForceSolution", {
                  required: "Solution is required",
                })}
                className={
                  errors.bruteForceSolution ? "border border-red-600" : ""
                }
              />
              {errors.bruteForceSolution && (
                <p className="text-red-500 text-sm">
                  {errors.bruteForceSolution.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button variant="danger">Cancel</Button>
              </Dialog.Close>
              <Button variant="primary" type="submit" disabled={disabled}>
                Save
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DsaFormModal;
