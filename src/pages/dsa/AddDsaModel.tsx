import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import {
  DifficultyLevel,
  DifficultyLevels,
  type DSAProblem,
} from "../../data/dsaProblemsData";
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

type AddDsaModelProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};
export type DifficultyLevel = "EASY" | "MEDIUM" | "HARD";

const AddDsaModel: React.FC<AddDsaModelProps> = ({ open, setOpen }) => {
  const [dsaProblem, setDsaProblem] = useState<DSAProblem>({
    id: "",
    title: "",
    difficulty: DifficultyLevels.EASY,
    topic: [],
    link: "",
    status: "SOLVED",
    lastSolved: "",
    notes: "",
    solution: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setDsaProblem((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await AxiosInstance.post(DSA, dsaProblem);
      const addedDsaProblem = response.data;

      if (response.status === 201) {
        setDsaProblem((prev) => ({
          ...prev,
          id: addedDsaProblem.id,
          title: addedDsaProblem.title,
          difficulty: addedDsaProblem.EASY,
          topic: addedDsaProblem.topic,
          link: addedDsaProblem.link,
          status: addedDsaProblem.status,
          lastSolved: addedDsaProblem.lastSolved,
          notes: addedDsaProblem.notes,
          solution: addedDsaProblem.solution,
        }));
      }
    } catch (error) {
      console.error("Error submitting problem:", error);
    } finally {
      setOpen(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              Add DSA Problem
            </Dialog.Title>
            <Dialog.Close asChild>
              <X className="text-primary-background" />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              name="title"
              placeholder="Title"
              value={dsaProblem.title}
              onChange={handleChange}
              className="w-full p-2 border rounded-md dark:bg-gray-800"
            />
            <Select
              value={dsaProblem.difficulty}
              onValueChange={(value) =>
                setDsaProblem({
                  ...dsaProblem,
                  difficulty: value as DifficultyLevel,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[102]">
                {Object.values(DifficultyLevels).map((level) => (
                  <SelectItem key={level} value={level}>
                    {convertToPascalCase(level)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <label
                htmlFor="topics"
                className="block text-sm font-medium mb-1"
              >
                Problem Topics
              </label>
              <MultiSelect
                className="z-[102]"
                selected={dsaProblem.topic}
                onSelectedChange={(value) => {
                  setDsaProblem({
                    ...dsaProblem,
                    topic: value,
                  });
                }}
                placeholder="Select problem topics..."
              />
            </div>
            <Input
              name="link"
              placeholder="Link"
              value={dsaProblem.link}
              onChange={handleChange}
            />
            <Textarea
              name="notes"
              placeholder="Notes"
              value={dsaProblem.notes}
              onChange={handleChange}
            />
            <Textarea
              name="solution"
              placeholder="Solution"
              value={dsaProblem.solution}
              onChange={handleChange}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button variant="danger">Cancel</Button>
              </Dialog.Close>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddDsaModel;
