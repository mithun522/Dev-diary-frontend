import { useState } from "react";
import { Plus } from "lucide-react";
import {
  useAddLanguage,
  useFetchLanguage,
  type LanguageType,
} from "../../api/hooks/useFetchLanguage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Skeleton } from "../../components/ui/skeleton";
import { Input } from "../../components/ui/input";
import Button from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { logger } from "../../utils/logger";
import { toast } from "react-toastify";

interface LanguagesProps {
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
}

const Languages: React.FC<LanguagesProps> = ({
  selectedLanguage,
  setSelectedLanguage,
}) => {
  const { data: languages = [], isLoading, error } = useFetchLanguage();
  const { mutate: addLanguage, isPending: isAdding } = useAddLanguage();
  const [newLanguage, setNewLanguage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      addLanguage(newLanguage.trim(), {
        onSuccess: () => {
          setNewLanguage("");
          setIsDialogOpen(false);

          toast.success("Language added successfully");
        },
        onError: (error) => {
          logger.error("Failed to add language:", error);
          toast.error("Failed to add language");
        },
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (error) return;

  return (
    <>
      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
        <SelectTrigger className="w-full md:w-48">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Languages</SelectItem>
          {languages &&
            languages.map((lang: LanguageType) => (
              <SelectItem key={lang.id} value={lang.language}>
                {lang.language}
              </SelectItem>
            ))}

          {/* Add Language as Dialog Trigger */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Language
                </div>
              </div>
            </DialogTrigger>
            <DialogContent onClose={() => setIsDialogOpen(false)}>
              <DialogHeader>
                <DialogTitle>Add New Language</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter language name"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddLanguage();
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outlinePrimary"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddLanguage}
                    disabled={!newLanguage.trim() || isAdding}
                  >
                    {isAdding ? "Adding..." : "Add Language"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </SelectContent>
      </Select>
    </>
  );
};

export default Languages;
