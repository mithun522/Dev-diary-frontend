import { useEffect, useState } from "react";
import Button from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Plus, X, Tags, Sparkles } from "lucide-react";

interface AddSkillModalProps {
  open: boolean;
  onClose: () => void;
  existingSkills?: string[];
  onSkillsUpdate?: (skills: string[]) => void;
}

const AddSkillModal: React.FC<AddSkillModalProps> = ({
  open,
  onClose,
  existingSkills = [],
  onSkillsUpdate,
}) => {
  const [skill, setSkill] = useState<string>("");
  const [skillList, setSkillList] = useState<string[]>(existingSkills);

  // This modal is mounted once for the page's lifetime (controlled only via `open`), so the
  // useState initializer above only ever runs on first mount. Without this, reopening after a
  // save shows stale skills instead of the latest saved list.
  useEffect(() => {
    if (open) {
      setSkill("");
      setSkillList(existingSkills);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addSkill = () => {
    if (skill.trim() && !skillList.includes(skill.trim())) {
      const newSkillList = [...skillList, skill.trim()];
      setSkillList(newSkillList);
      setSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkillList = skillList.filter((s) => s !== skillToRemove);
    setSkillList(newSkillList);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = () => {
    onSkillsUpdate?.(skillList);
    onClose();
  };

  const popularSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "AWS",
    "Docker",
  ];

  const addPopularSkill = (popularSkill: string) => {
    if (!skillList.includes(popularSkill)) {
      setSkillList([...skillList, popularSkill]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" onClose={onClose} data-cy="skill-modal">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <Tags className="w-6 h-6 text-blue-600" />
          </div>
          <DialogTitle className="text-lg font-semibold">
            Manage Skills
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Add or remove skills to showcase your expertise
          </DialogDescription>
        </div>

        <div className="space-y-4">
          {/* Input Section */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Add New Skill
            </label>
            <div className="flex gap-2">
              <Input
                className="flex-1"
                placeholder="Enter a skill..."
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                data-cy="skill-modal-input"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={addSkill}
                disabled={!skill.trim()}
                className="px-3"
                data-cy="skill-modal-add-button"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500">Press Enter to add quickly</p>
          </div>

          {/* Popular Skills */}
          {skillList.length === 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4" />
                <span>Popular skills</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {popularSkills.map((popularSkill) => (
                  <Badge
                    key={popularSkill}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    onClick={() => addPopularSkill(popularSkill)}
                  >
                    {popularSkill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Skills List */}
          {skillList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Your Skills ({skillList.length})
                </span>
                {skillList.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSkillList([])}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <div className="border rounded-lg p-3 bg-gray-50 max-h-32 overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {skillList.map((item, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 py-1.5 px-3 group"
                      data-cy="skill-modal-item"
                    >
                      {item}
                      <button
                        onClick={() => removeSkill(item)}
                        className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
                        data-cy="skill-modal-item-remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {skillList.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No skills added yet
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outlinePrimary"
            onClick={onClose}
            className="flex-1"
            data-cy="skill-modal-cancel"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            data-cy="skill-modal-save"
          >
            Save Skills
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSkillModal;
