import { describe, expect, it } from '@jest/globals';
import { assertNever } from './assertNever';

describe('assertNever', () => {
  it('throws a TypeError', () => {
    expect(() => assertNever(1 as never, 'Unreachable')).toThrow(TypeError);
  });

  it('throws a TypeError with a message', () => {
    expect(() => assertNever(1 as never, 'Unreachable')).toThrow('Unreachable');
  });

  it('throws a TypeError with a message generator', () => {
    expect(() => assertNever(1 as never, (x: number) => `Unreachable ${x}`)).toThrow('Unreachable 1');
  });
});
