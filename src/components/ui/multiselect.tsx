import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "../lib/utils";

export const Topics = {
  ARRAY: "ARRAY",
  STRING: "STRING",
  LINKED_LIST: "LINKED_LIST",
  STACK: "STACK",
  QUEUE: "QUEUE",
  TREE: "TREE",
  GRAPH: "GRAPH",
  SLIDING_WINDOW: "SLIDING_WINDOW",
  DYNAMIC_PROGRAMMING: "DYNAMIC_PROGRAMMING",
  BIT_MANIPULATION: "BIT_MANIPULATION",
  BACKTRACKING: "BACKTRACKING",
  GREEDY: "GREEDY",
  HEAP: "HEAP",
  SORTING: "SORTING",
  TWO_POINTERS: "TWO_POINTERS",
  BINARY_SEARCH: "BINARY_SEARCH",
  DFS: "DFS",
  BFS: "BFS",
} as const;

export type Topic = keyof typeof Topics;

interface MultiSelectProps {
  selected: Topic[];
  onSelectedChange: (selected: Topic[]) => void;
  className?: string;
  placeholder?: string;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  (
    { selected, onSelectedChange, className, placeholder = "Select topics..." },
    ref
  ) => {
    const handleSelect = (value: Topic) => {
      if (selected.includes(value)) {
        onSelectedChange(selected.filter((item) => item !== value));
      } else {
        onSelectedChange([...selected, value]);
      }
    };

    return (
      <SelectPrimitive.Root>
        <SelectPrimitive.Trigger
          ref={ref}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white dark:bg-gray-800 px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            className
          )}
        >
          <SelectPrimitive.Value asChild>
            <span>
              {selected.length > 0
                ? selected.map((topic) => Topics[topic]).join(", ")
                : placeholder}
            </span>
          </SelectPrimitive.Value>
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2">
            <SelectScrollUpButton />
            <SelectPrimitive.Viewport className="p-1">
              {Object.entries(Topics).map(([key, value]) => (
                <SelectPrimitive.Item
                  key={key}
                  value={key}
                  onSelect={() => handleSelect(key as Topic)}
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {selected.includes(key as Topic) && (
                      <Check className="h-4 w-4" />
                    )}
                  </span>
                  <SelectPrimitive.ItemText>{value}</SelectPrimitive.ItemText>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
            <SelectScrollDownButton />
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  }
);

MultiSelect.displayName = "MultiSelect";

// Reuse your existing scroll button components
const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="h-4 w-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

export { MultiSelect };
