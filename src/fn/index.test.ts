import { describe, it, expect } from '@jest/globals';
import * as fn from './index';

describe('fn exports', () => {
  it.each([
    fn.assertNever,
    fn.compose2,
    fn.compose,
    fn.identity,
    fn.idX,
    fn.lazy,
    fn.asConst,
    fn.pipe,
    fn.unreachable,
  ])('exports %p', (value) => {
    expect(value).toBeDefined();
  });
});
