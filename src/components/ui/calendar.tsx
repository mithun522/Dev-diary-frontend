import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "../lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 w-[356px] h-[351px]", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6 mt-2",
        caption: "flex relative",
        caption_label: "text-md font-medium order-2 pl-3",
        nav: "flex w-full absolute justify-end right-2",
        button_next:
          "text-gray-400 border border-gray-300 rounded-full p-1 ml-2 cursor-pointer hover:scale-105 ease-in-out duration-500 transition-all",
        button_previous:
          "bg-light text-black border border-gray-300 rounded-full p-1 cursor-pointer",
        day: cn(
          "h-9 w-9 p-3.5 font-normal", // Fixed size for all days
          "items-center justify-center" // Center alignment
        ),
        day_range_end: "day-range-end",
        selected:
          "flex items-center justify-center mt-2 ml-1 bg-primary text-white rounded-full",
        day_today: "bg-primary",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-red-400 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-primary aria-selected:text-primary",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
