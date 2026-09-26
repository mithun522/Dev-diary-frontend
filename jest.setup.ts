import { TextEncoder, TextDecoder } from "node:util";

// jsdom doesn't implement these; react-router-dom needs them at import time.
if (typeof globalThis.TextEncoder === "undefined") {
  // @ts-expect-error -- Node's TextEncoder/TextDecoder are close enough for jsdom's purposes.
  globalThis.TextEncoder = TextEncoder;
  // @ts-expect-error -- see above.
  globalThis.TextDecoder = TextDecoder;
}

import "@testing-library/jest-dom";

// jsdom doesn't implement this either; recharts' ResponsiveContainer needs it to observe its
// wrapper's size, even in a test render where no real layout/resizing ever happens.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
