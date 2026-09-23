import { convertToPascalCase, pascalizeUnderscore } from "../../src/utils/convertToPascalCase";

describe("convertToPascalCase", () => {
  test("uppercases the first letter and lowercases the rest", () => {
    expect(convertToPascalCase("EASY")).toBe("Easy");
    expect(convertToPascalCase("hard")).toBe("Hard");
    expect(convertToPascalCase("mEdIuM")).toBe("Medium");
  });

  test("handles a single character", () => {
    expect(convertToPascalCase("a")).toBe("A");
  });
});

describe("pascalizeUnderscore", () => {
  test("splits on underscores and pascal-cases each word, joined by a space", () => {
    expect(pascalizeUnderscore("WRONG_ANSWER")).toBe("Wrong Answer");
    expect(pascalizeUnderscore("TIMED_OUT")).toBe("Timed Out");
    expect(pascalizeUnderscore("COMPILE_ERROR")).toBe("Compile Error");
  });

  test("handles a string with no underscores", () => {
    expect(pascalizeUnderscore("ACCEPTED")).toBe("Accepted");
  });

  test("handles multiple consecutive underscores by pascal-casing the resulting empty segment to itself", () => {
    expect(pascalizeUnderscore("A__B")).toBe("A  B");
  });
});
