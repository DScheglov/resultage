import { describe, it, expect } from '@jest/globals';
import * as sync from './sync';

describe('sync exports', () => {
  it.each([
    sync.ok,
    // sync.Ok, // type
    sync.asyncOk,
    sync.err,
    // sync.Err, // type
    sync.asyncErr,
    sync.isResult,
    sync.isOk,
    sync.isErr,
    sync.ensureResult,
    sync.okIf,
    sync.expect,
    sync.expectExists,
    sync.okIfExists,
    sync.map,
    sync.mapErr,
    sync.chain,
    sync.chainErr,
    sync.unwrap,
    sync.unwrapOr,
    sync.unwrapOrElse,
    sync.unwrapErr,
    sync.unwrapErrOr,
    sync.unwrapErrOrElse,
    sync.unpack,
    sync.match,
    sync.tap,
    sync.tapErr,
    sync.Do,
    sync.reduce,
    sync.collect,
  ])('exports %p', (value) => {
    expect(value).toBeDefined();
  });
});
