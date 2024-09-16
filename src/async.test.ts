import { describe, it, expect } from '@jest/globals';
import * as async from './async';

describe('async exports', () => {
  it.each([
    async.ok,
    // async.Ok, // type
    async.asyncOk,
    async.err,
    // async.Err, // type
    async.asyncErr,
    async.isResult,
    async.isOk,
    async.isErr,
    async.ensureResult,
    async.okIf,
    async.expect,
    async.expectExists,
    async.okIfExists,
    async.Do,
    async.thenMap,
    async.thenMapErr,
    async.thenChain,
    async.thenChainErr,
    async.thenMatch,
    async.thenUnwrap,
    async.thenUnwrapOr,
    async.thenUnwrapOrElse,
    async.thenUnwrapOrReject,
    async.thenUnwrapErr,
    async.thenUnwrapErrOr,
    async.thenUnwrapErrOrElse,
    async.thenTap,
    async.thenTapAndWait,
    async.thenTapErr,
    async.thenTapErrAndWait,
    async.flip,
    async.from,
    async.thenUnpack,
  ])('exports %p', (value) => {
    expect(value).toBeDefined();
  });
});
