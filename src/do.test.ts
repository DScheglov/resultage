import { describe, it, expect } from '@jest/globals';
import { Do, asyncDo } from './do';

describe('Do exports', () => {
  it.each([
    [Do],
    [asyncDo],
  ])('%p is defined', (doFn) => {
    expect(doFn).toBeDefined();
  });
});
