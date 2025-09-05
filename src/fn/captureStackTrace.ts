function polyfillCaptureStackTrace(
  error: { stack: string },
  skipFn: { (...args: any[]): any },
) {
  const lines = error.stack.split('\n');
  const [header, ...stackLines] = lines;
  const index = stackLines.findIndex((line) => line.includes(skipFn.name));
  const trimmed = index >= 0 ? stackLines.slice(index + 1) : stackLines;
  error.stack = [header, ...trimmed].join('\n');
}

export let captureStackTrace =
  Error.captureStackTrace ?? polyfillCaptureStackTrace;

export const stackCapturerPolyfill = ({
  reset = false,
}: { reset?: boolean } = {}): void => {
  captureStackTrace =
    reset && Error.captureStackTrace
      ? Error.captureStackTrace
      : polyfillCaptureStackTrace;
};
