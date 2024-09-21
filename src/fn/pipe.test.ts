import { describe, expect, it } from '@jest/globals';
import { pipe } from './pipe';

describe('pipe', () => {
  it('returns the value if no functions are passed', () => {
    expect(pipe(1)).toBe(1);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const)(
    'works with %i functions',
    (n) => {
      const fns = Array.from({ length: n }, () => (x: number) => x + 1) as [
        (x: number) => number,
      ];
      const result = pipe(1, ...fns);
      expect(result).toBe(n + 1);
    },
  );
});
