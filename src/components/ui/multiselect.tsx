import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";
import { Topics, type Topic } from "../../constants/Topics";

interface MultiSelectProps {
  selected: Topic[];
  onSelectedChange: (selected: Topic[]) => void;
  className?: string;
  placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  selected,
  onSelectedChange,
  className,
  placeholder = "Select topics...",
}) => {
  const toggleSelect = (value: Topic) => {
    if (selected.includes(value)) {
      onSelectedChange(selected.filter((t) => t !== value));
    } else {
      onSelectedChange([...selected, value]);
    }
  };

  return (
    <Popover.Root>
      <Popover.Trigger
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm",
          className
        )}
      >
        <span className="truncate">
          {selected.length > 0
            ? selected.map((key) => Topics[key]).join(", ")
            : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Popover.Trigger>
      <Popover.Content className="z-50 bg-white dark:bg-gray-900 border p-2 rounded shadow-md">
        <div className="max-h-60 overflow-y-auto">
          {Object.entries(Topics).map(([key, label]) => {
            const isSelected = selected.includes(key as Topic);
            return (
              <div
                key={key}
                className="flex gap-2 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => toggleSelect(key as Topic)}
              >
                <div className="w-4 h-4 border rounded flex items-center justify-center">
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
                <span className="text-sm">{label}</span>
              </div>
            );
          })}
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};
