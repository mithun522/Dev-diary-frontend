import {
  getTagColor,
  getDifficultyColor,
  getPriorityColor,
  getPriorityAccentBorder,
  getPriorityDot,
  getStatusVariant,
} from "../../src/utils/colorVariations";
import type { KnowledgeTag } from "../../src/data/knowledgeData";

const ALL_TAGS: KnowledgeTag[] = [
  "algorithms",
  "data-structures",
  "javascript",
  "python",
  "system-design",
  "behavioral",
  "frontend",
  "backend",
  "database",
  "networking",
  "security",
  "architecture",
];

describe("getTagColor", () => {
  test.each(ALL_TAGS)("returns a non-empty class string for the '%s' tag", (tag) => {
    expect(getTagColor(tag)).toEqual(expect.any(String));
    expect(getTagColor(tag).length).toBeGreaterThan(0);
  });

  test("every tag maps to a distinct colour so tags stay visually separable", () => {
    const colors = ALL_TAGS.map(getTagColor);
    expect(new Set(colors).size).toBe(ALL_TAGS.length);
  });

  test("every colour carries both a light and a dark variant", () => {
    for (const tag of ALL_TAGS) {
      const color = getTagColor(tag);
      expect(color).toMatch(/\bbg-/);
      expect(color).toMatch(/\bdark:bg-/);
    }
  });

  test("returns the documented class for a representative tag", () => {
    expect(getTagColor("algorithms")).toBe(
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    );
  });

  test("has no fallback — an unknown tag yields undefined rather than a default colour", () => {
    expect(getTagColor("not-a-tag" as KnowledgeTag)).toBeUndefined();
  });
});

describe("getDifficultyColor", () => {
  test("maps easy/medium/hard to green/amber/red", () => {
    expect(getDifficultyColor("easy")).toBe("bg-green-500");
    expect(getDifficultyColor("medium")).toBe("bg-amber-500");
    expect(getDifficultyColor("hard")).toBe("bg-red-500");
  });

  test("is case-insensitive, so the uppercase API enum works too", () => {
    expect(getDifficultyColor("EASY")).toBe("bg-green-500");
    expect(getDifficultyColor("MEDIUM")).toBe("bg-amber-500");
    expect(getDifficultyColor("HARD")).toBe("bg-red-500");
  });

  test("handles mixed casing", () => {
    expect(getDifficultyColor("EaSy")).toBe("bg-green-500");
  });

  test("falls back to grey for an unknown difficulty", () => {
    expect(getDifficultyColor("IMPOSSIBLE")).toBe("bg-gray-500");
  });

  test("falls back to grey for an empty string", () => {
    expect(getDifficultyColor("")).toBe("bg-gray-500");
  });

  test("falls back to grey for undefined instead of throwing (optional chaining guard)", () => {
    expect(getDifficultyColor(undefined as unknown as string)).toBe("bg-gray-500");
  });

  test("falls back to grey for null instead of throwing", () => {
    expect(getDifficultyColor(null as unknown as string)).toBe("bg-gray-500");
  });
});

describe("getPriorityColor", () => {
  test("maps HIGH/MEDIUM/LOW to red/amber/green", () => {
    expect(getPriorityColor("HIGH")).toBe(
      "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    );
    expect(getPriorityColor("MEDIUM")).toBe(
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
    );
    expect(getPriorityColor("LOW")).toBe(
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    );
  });

  test("falls back to grey when the priority is undefined", () => {
    expect(getPriorityColor(undefined)).toBe(
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  });

  test("falls back to grey for an unknown priority", () => {
    expect(getPriorityColor("URGENT")).toBe(
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  });

  test("is case-sensitive — lowercase does not match the uppercase enum", () => {
    expect(getPriorityColor("high")).toBe(
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  });
});

describe("getPriorityAccentBorder", () => {
  test("maps HIGH/MEDIUM/LOW to a coloured left border", () => {
    expect(getPriorityAccentBorder("HIGH")).toBe("border-l-4 border-l-red-500");
    expect(getPriorityAccentBorder("MEDIUM")).toBe("border-l-4 border-l-amber-500");
    expect(getPriorityAccentBorder("LOW")).toBe("border-l-4 border-l-green-500");
  });

  test("falls back to a neutral border for undefined", () => {
    expect(getPriorityAccentBorder(undefined)).toBe(
      "border-l-4 border-l-gray-300 dark:border-l-gray-600"
    );
  });

  test("falls back to a neutral border for an unknown priority", () => {
    expect(getPriorityAccentBorder("URGENT")).toBe(
      "border-l-4 border-l-gray-300 dark:border-l-gray-600"
    );
  });

  test("always keeps the same border width so rows stay aligned", () => {
    for (const priority of ["HIGH", "MEDIUM", "LOW", "URGENT", undefined]) {
      expect(getPriorityAccentBorder(priority)).toMatch(/^border-l-4 /);
    }
  });
});

describe("getPriorityDot", () => {
  test("maps HIGH/MEDIUM/LOW to red/amber/green dots", () => {
    expect(getPriorityDot("HIGH")).toBe("bg-red-500");
    expect(getPriorityDot("MEDIUM")).toBe("bg-amber-500");
    expect(getPriorityDot("LOW")).toBe("bg-green-500");
  });

  test("falls back to a grey dot for undefined", () => {
    expect(getPriorityDot(undefined)).toBe("bg-gray-400");
  });

  test("falls back to a grey dot for an unknown priority", () => {
    expect(getPriorityDot("URGENT")).toBe("bg-gray-400");
  });

  test("uses a lighter grey than the accent border's neutral state", () => {
    expect(getPriorityDot(undefined)).not.toBe(getPriorityColor(undefined));
  });
});

describe("getStatusVariant", () => {
  test("maps Solved/Attempted/Unsolved to green/amber/grey", () => {
    expect(getStatusVariant("Solved")).toBe(
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    );
    expect(getStatusVariant("Attempted")).toBe(
      "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
    );
    expect(getStatusVariant("Unsolved")).toBe(
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  });

  test("returns an empty string (no classes) for an unknown status", () => {
    expect(getStatusVariant("Archived")).toBe("");
  });

  test("returns an empty string for an empty status", () => {
    expect(getStatusVariant("")).toBe("");
  });

  test("is case-sensitive — the uppercase API enum does NOT match the title-cased keys", () => {
    expect(getStatusVariant("SOLVED")).toBe("");
  });
});
