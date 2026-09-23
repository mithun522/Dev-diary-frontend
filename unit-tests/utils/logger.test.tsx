import { logger } from "../../src/utils/logger";

// The transformer rewrites `import.meta.env.DEV` to `process.env.DEV`, which is undefined (falsy)
// under Jest by default — so by default the logger must stay silent, no matter what callers pass.
describe("logger — DEV disabled (the default under Jest)", () => {
  let infoSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  test("info does not write to console.info", () => {
    logger.info("hello");
    expect(infoSpy).not.toHaveBeenCalled();
  });

  test("warn does not write to console.warn", () => {
    logger.warn("careful");
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test("error does not write to console.error", () => {
    logger.error("oops");
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("none of the methods throw even when called with no arguments", () => {
    expect(() => logger.info()).not.toThrow();
    expect(() => logger.warn()).not.toThrow();
    expect(() => logger.error()).not.toThrow();
  });
});

describe("logger — DEV enabled", () => {
  const ORIGINAL_DEV = process.env.DEV;

  afterEach(() => {
    if (ORIGINAL_DEV === undefined) {
      delete process.env.DEV;
    } else {
      process.env.DEV = ORIGINAL_DEV;
    }
    jest.resetModules();
  });

  test("info forwards all args to console.info", () => {
    process.env.DEV = "true";
    jest.resetModules();
     
    const { logger: devLogger } = require("../../src/utils/logger");
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});

    devLogger.info("a", 1, { b: 2 });

    expect(infoSpy).toHaveBeenCalledWith("a", 1, { b: 2 });
    infoSpy.mockRestore();
  });

  test("warn forwards all args to console.warn", () => {
    process.env.DEV = "true";
    jest.resetModules();
     
    const { logger: devLogger } = require("../../src/utils/logger");
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    devLogger.warn("careful", "now");

    expect(warnSpy).toHaveBeenCalledWith("careful", "now");
    warnSpy.mockRestore();
  });

  test("error forwards all args to console.error", () => {
    process.env.DEV = "true";
    jest.resetModules();
     
    const { logger: devLogger } = require("../../src/utils/logger");
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const err = new Error("broke");

    devLogger.error("Invalid token:", err);

    expect(errorSpy).toHaveBeenCalledWith("Invalid token:", err);
    errorSpy.mockRestore();
  });
});
