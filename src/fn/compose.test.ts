import { describe, expect, it } from '@jest/globals';
import { compose } from './compose';

describe('compose', () => {
  const f = (x: number) => x + 1;
  const g = (x: number) => x * 2;
  it('composes functions', () => {
    const composed = compose(g, f);
    expect(composed(1)).toBe(4);
  });

  it('returns the value if no functions are passed', () => {
    expect(compose(f)).toBe(f);
  });

  it.each([1, 2, 3, 4, 5, 6, 7, 8, 9] as const)(
    'works with %i functions',
    (n) => {
      const fns = Array.from({ length: n }, () => (x: number) => x + 1) as [
        (x: number) => number,
      ];
      const result = compose(...fns);
      expect(result(1)).toBe(n + 1);
    },
  );
});
