import { describe, it, expect } from '@jest/globals';
import * as base from './base';

describe('base exports', () => {
  it.each([
    base.ok,
    // base.Ok, // type
    base.asyncOk,
    base.err,
    // base.Err, // type
    base.asyncErr,
    base.isResult,
    base.isOk,
    base.isErr,
    base.ensureResult,
    base.okIf,
    base.expect,
    base.expectExists,
    base.okIfExists,
  ])('exports %p', (value) => {
    expect(value).toBeDefined();
  });
});
