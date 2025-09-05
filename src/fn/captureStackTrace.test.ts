import { describe, it, expect } from '@jest/globals';
import { captureStackTrace, stackCapturerPolyfill } from './captureStackTrace';

describe('captureStackTrace', () => {
  it('trims the stack trace after the skip function (polyfill)', () => {
    // Arrange
    function skipFn() {
      return new Error('This is an error');
    }

    const error = skipFn();
    const originalError = new Error('Original error');
    stackCapturerPolyfill();
    captureStackTrace(error, skipFn);

    expect(error.stack!.split(/\n/).length).toBe(
      originalError.stack!.split(/\n/).length,
    );
  });

  it("does't trim if skip function is not found (polyfill)", () => {
    function skipFn() {}
    const error = {
      stack: [
        'Error: test',
        '    at foo (file.js:2:2)',
        '    at bar (file.js:3:3)',
      ].join('\n'),
    };

    stackCapturerPolyfill();
    captureStackTrace(error, skipFn);

    expect(error.stack).toBe(
      [
        'Error: test',
        '    at foo (file.js:2:2)',
        '    at bar (file.js:3:3)',
      ].join('\n'),
    );
  });
});
