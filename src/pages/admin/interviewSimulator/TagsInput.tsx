import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";

// Free-text chip input for string[] fields (topics/tags/tips) whose values aren't drawn from any
// fixed vocabulary — unlike the DSA catalog's `MultiSelect` (bound to the fixed `Topics` enum),
// interview-simulator topics/tags/tips are arbitrary admin-entered strings, so a simple
// type-and-press-Enter chip list is the right fit here.
type TagsInputProps = {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  dataCy?: string;
};

const TagsInput: React.FC<TagsInputProps> = ({
  value,
  onChange,
  placeholder = "Type and press Enter...",
  dataCy = "tags-input",
}) => {
  const [draft, setDraft] = useState("");

  const commitDraft = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={placeholder}
        data-cy={`${dataCy}-input`}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2" data-cy={`${dataCy}-chips`}>
          {value.map((item, index) => (
            <Badge
              key={`${item}-${index}`}
              variant="outline"
              className="text-xs flex items-center gap-1"
              data-cy={`${dataCy}-chip`}
            >
              {item}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Remove ${item}`}
                data-cy={`${dataCy}-chip-remove`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsInput;
