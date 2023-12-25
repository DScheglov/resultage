import { describe, it, expect } from '@jest/globals';
import { unreachable } from './unreachable';

describe('unreachable', () => {
  it('throws an error', () => {
    expect(() => unreachable()).toThrowError(
      new Error('Unreachable code reached'),
    );
  });

  it('throws an error with custom message', () => {
    expect(() => unreachable('Custom message')).toThrowError(
      new Error('Custom message'),
    );
  });
});
