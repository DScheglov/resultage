import { describe, expect, it } from '@jest/globals';
import { pipe } from './pipe';

describe('pipe', () => {
  it('returns the value if no functions are passed', () => {
    expect(pipe(1)).toBe(1);
  });

  it('works with 1 function', () => {
    expect(pipe(1, (x: number) => x + 1)).toBe(2);
  });

  it('works with 2 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(3);
  });

  it('works with 3 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(4);
  });

  it('works with 4 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(5);
  });

  it('works with 5 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(6);
  });

  it('works with 6 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(7);
  });

  it('works with 7 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(8);
  });

  it('works with 8 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(9);
  });

  it('works with 9 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(10);
  });

  it('works with 10 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(11);
  });

  it('works with 11 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(12);
  });

  it('works with 12 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(13);
  });

  it('works with 13 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(14);
  });

  it('works with 14 functions', () => {
    expect(
      pipe(
        1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
        (x: number) => x + 1,
      ),
    ).toBe(15);
  });
});
