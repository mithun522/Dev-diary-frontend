// Vite exposes env vars on `import.meta.env`, which is invalid syntax once ts-jest compiles to
// CommonJS. Rather than stubbing out constants/Api.tsx (which would make the service tests
// meaningless — they exist to assert the real URLs), rewrite the meta-property to a CommonJS
// equivalent before handing the source to ts-jest. `process.env` has no VITE_* keys under Jest, so
// every `import.meta.env.VITE_X ?? "<default>"` resolves to its hardcoded dev-stage default — which
// is exactly what the API-contract tests assert against.
const tsJest = require("ts-jest").default.createTransformer({
  tsconfig: "tsconfig.jest.json",
});

const SALT = "import-meta-rewrite-v1";

const rewriteImportMeta = (source) =>
  source
    .replace(/import\.meta\.env/g, "process.env")
    .replace(/import\.meta\.url/g, '("file://" + __filename)');

module.exports = {
  process(sourceText, sourcePath, options) {
    return tsJest.process(rewriteImportMeta(sourceText), sourcePath, options);
  },
  processAsync(sourceText, sourcePath, options) {
    return tsJest.processAsync(rewriteImportMeta(sourceText), sourcePath, options);
  },
  getCacheKey(sourceText, sourcePath, options) {
    return tsJest.getCacheKey(rewriteImportMeta(sourceText), sourcePath, options) + SALT;
  },
};
