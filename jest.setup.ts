import { TextEncoder, TextDecoder } from "node:util";

// jsdom doesn't implement these; react-router-dom needs them at import time.
if (typeof globalThis.TextEncoder === "undefined") {
  // @ts-expect-error -- Node's TextEncoder/TextDecoder are close enough for jsdom's purposes.
  globalThis.TextEncoder = TextEncoder;
  // @ts-expect-error -- see above.
  globalThis.TextDecoder = TextDecoder;
}

import "@testing-library/jest-dom";
