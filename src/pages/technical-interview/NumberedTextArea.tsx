import React, { useRef, type KeyboardEvent } from "react";
import { Textarea } from "../../components/ui/textarea";

interface NumberedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  dataCy: string;
}

const NumberedTextarea: React.FC<NumberedTextareaProps> = ({
  value,
  onChange,
  placeholder,
  className,
  error,
  dataCy,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Get current line to find the number or letter
      const beforeCursor = value.substring(0, start);
      const lines = beforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];

      // Check if current line starts with a letter followed by a period (sub-point)
      const letterMatch = currentLine.match(/^(\s*)([a-z])\.\s*/);
      if (letterMatch) {
        const indent = letterMatch[1];
        const currentLetter = letterMatch[2];
        const nextLetterCode = currentLetter.charCodeAt(0) + 1;
        const nextLetter = String.fromCharCode(nextLetterCode);
        const newLine = `\n${indent}${nextLetter}. `;

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
        return;
      }

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
        // If no number or letter is found, check if user wants to start numbering
        const trimmedLine = currentLine.trim();
        if (
          trimmedLine === "" ||
          (!trimmedLine.match(/^\d+\./) && !trimmedLine.match(/^[a-z]\./))
        ) {
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

    // Handle Tab key for creating sub-points
    if (e.key === "Tab") {
      e.preventDefault();

      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Get current line
      const beforeCursor = value.substring(0, start);
      const lines = beforeCursor.split("\n");
      const currentLine = lines[lines.length - 1];

      // Check if current line starts with a number followed by a period
      const numberMatch = currentLine.match(/^(\d+)\.\s*/);
      if (numberMatch) {
        // Convert to sub-point with letter 'a'
        const newLine = `\n    a. `;
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
        return;
      }

      // Check if current line is already a sub-point
      const letterMatch = currentLine.match(/^(\s*)([a-z])\.\s*/);
      if (letterMatch) {
        const indent = letterMatch[1];
        const nextLetter = "a"; // Start with 'a' for new sub-point
        const newLine = `\n${indent}${nextLetter}. `;

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
        return;
      }

      // If not on a numbered line, just add regular tab indentation
      const newValue =
        value.substring(0, start) + "    " + value.substring(end);
      onChange(newValue);

      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPosition = start + 4;
          textareaRef.current.setSelectionRange(
            newCursorPosition,
            newCursorPosition
          );
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  return (
    <Textarea
      data-cy={dataCy}
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
