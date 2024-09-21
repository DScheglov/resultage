import { describe, expect, it } from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { identity, idX, asConst, lazy } from './identity';

describe('identity', () => {
  it('returns the value passed', () => {
    expect(identity(1)).toBe(1);
  });

  it('has alias idX', () => {
    expect(idX).toBe(identity);
  });
});

describe('asConst', () => {
  it('returns a function that returns the value passed', () => {
    const fn = asConst(1);
    expect(fn()).toBe(1);
  });

  it('narrows the type of the value passed', () => {
    const fn = asConst(1);
    const check: Expect<Equal<typeof fn, () => 1>> = true;
    expect(check).toBe(true);
  });
});

describe('lazy', () => {
  it('returns a function that returns the value passed', () => {
    const fn = lazy(1);
    expect(fn()).toBe(1);
  });
});
