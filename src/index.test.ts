import { describe, it, expect } from '@jest/globals';
import * as index from './index';

describe('index exports', () => {
  it.each([
    index.asyncDo,
    index.sequence,
    index.thenMap,
    index.thenMapErr,
    index.thenChain,
    index.thenChainErr,
    index.thenMatch,
    index.thenUnwrap,
    index.thenUnwrapOr,
    index.thenUnwrapOrElse,
    index.thenUnwrapOrReject,
    index.thenUnwrapErr,
    index.thenUnwrapErrOr,
    index.thenUnwrapErrOrElse,
    index.thenTap,
    index.thenTapAndWait,
    index.thenTapErr,
    index.thenTapErrAndWait,
    index.flip,
    index.from,
    index.thenUnpack,
    index.ok,
    // index.Ok, // type
    index.asyncOk,
    index.err,
    // index.Err, // type
    index.asyncErr,
    index.isResult,
    index.isOk,
    index.isErr,
    index.ensureResult,
    index.okIf,
    index.expect,
    index.expectExists,
    index.okIfExists,
    index.map,
    index.mapErr,
    index.chain,
    index.chainErr,
    index.unwrap,
    index.unwrapOr,
    index.unwrapOrElse,
    index.unwrapErr,
    index.unwrapErrOr,
    index.unwrapErrOrElse,
    index.unpack,
    index.match,
    index.tap,
    index.tapErr,
    index.Do,
    index.reduce,
    index.collect,
  ])('exports %p', (value) => {
    expect(value).toBeDefined();
  });
});
