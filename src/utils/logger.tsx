/* eslint-disable no-console */
export const logger = {
  info: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    if (import.meta.env.DEV) console.error(...args);
  },
};
