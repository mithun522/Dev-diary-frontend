import { calculatePasswordStrength } from "../../src/utils/calculatePasswordStrength";

describe("calculatePasswordStrength", () => {
  test("returns 0 for an empty password", () => {
    expect(calculatePasswordStrength("")).toBe(0);
  });

  test("length >= 8 alone (no letters/digits/special chars) contributes 25", () => {
    expect(calculatePasswordStrength("        ")).toBe(25); // 8 spaces
  });

  test("uppercase alone (< 8 chars) contributes 25", () => {
    expect(calculatePasswordStrength("AAA")).toBe(25);
  });

  test("lowercase alone (< 8 chars) contributes 25", () => {
    expect(calculatePasswordStrength("aaa")).toBe(25);
  });

  test("digits alone (< 8 chars) contribute 25", () => {
    expect(calculatePasswordStrength("111")).toBe(25);
  });

  test("length + lowercase together contribute 50", () => {
    expect(calculatePasswordStrength("abcdefgh")).toBe(50);
  });

  test("a single uppercase character (< 8 chars) contributes only 25, not more", () => {
    expect(calculatePasswordStrength("A")).toBe(25);
  });

  test("length + lowercase + digit (no uppercase) contributes 75", () => {
    expect(calculatePasswordStrength("abcdefg1")).toBe(75);
  });

  test("length + lowercase + special char (no uppercase) contributes 75", () => {
    expect(calculatePasswordStrength("abcdefg!")).toBe(75);
  });

  test("a password satisfying all four checks scores 100", () => {
    expect(calculatePasswordStrength("Password1!")).toBe(100);
  });

  test("a short all-lowercase password scores 25", () => {
    expect(calculatePasswordStrength("abc")).toBe(25);
  });
});
