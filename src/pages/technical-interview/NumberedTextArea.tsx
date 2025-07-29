import React, { useRef, type KeyboardEvent } from "react";
import { Textarea } from "../../components/ui/textarea";

interface NumberedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

const NumberedTextarea: React.FC<NumberedTextareaProps> = ({
  value,
  onChange,
  placeholder,
  className,
  error,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Get current line to find the number
      const beforeCursor = value.substring(0, start);
      const lines = beforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];

      // Check if current line starts with a number followed by a period
      const numberMatch = currentLine.match(/^(\d+)\.\s*/);

      if (numberMatch) {
        const currentNumber = parseInt(numberMatch[1]);
        const nextNumber = currentNumber + 1;
        const newLine = `\n${nextNumber}. `;

        // Insert the new numbered line
        const newValue =
          value.substring(0, start) + newLine + value.substring(end);
        onChange(newValue);

        // Set cursor position after the new number
        setTimeout(() => {
          if (textareaRef.current) {
            const newCursorPosition = start + newLine.length;
            textareaRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition
            );
            textareaRef.current.focus();
          }
        }, 0);
      } else {
        // If no number is found, check if user wants to start numbering
        const trimmedLine = currentLine.trim();
        if (trimmedLine === "" || !trimmedLine.match(/^\d+\./)) {
          // Start with number 1
          const newLine = "\n1. ";
          const newValue =
            value.substring(0, start) + newLine + value.substring(end);
          onChange(newValue);

          setTimeout(() => {
            if (textareaRef.current) {
              const newCursorPosition = start + newLine.length;
              textareaRef.current.setSelectionRange(
                newCursorPosition,
                newCursorPosition
              );
              textareaRef.current.focus();
            }
          }, 0);
        } else {
          // Just add a regular new line
          const newValue =
            value.substring(0, start) + "\n" + value.substring(end);
          onChange(newValue);

          setTimeout(() => {
            if (textareaRef.current) {
              const newCursorPosition = start + 1;
              textareaRef.current.setSelectionRange(
                newCursorPosition,
                newCursorPosition
              );
              textareaRef.current.focus();
            }
          }, 0);
        }
      }
    }
  };

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      error={error}
    />
  );
};

export default NumberedTextarea;
