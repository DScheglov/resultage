import { describe, it, expect } from '@jest/globals';
import * as methods from './methods';

describe('index exports', () => {
  it.each([
    methods.thenMap,
    methods.thenMapErr,
    methods.thenChain,
    methods.thenChainErr,
    methods.thenMatch,
    methods.thenUnwrap,
    methods.thenUnwrapOr,
    methods.thenUnwrapOrElse,
    methods.thenUnwrapOrReject,
    methods.thenUnwrapErr,
    methods.thenUnwrapErrOr,
    methods.thenUnwrapErrOrElse,
    methods.thenTap,
    methods.thenTapAndWait,
    methods.thenTapErr,
    methods.thenTapErrAndWait,
    methods.flip,
    methods.from,
    methods.thenUnpack,
    methods.map,
    methods.mapErr,
    methods.chain,
    methods.chainErr,
    methods.unwrap,
    methods.unwrapOr,
    methods.unwrapOrElse,
    methods.unwrapErr,
    methods.unwrapErrOr,
    methods.unwrapErrOrElse,
    methods.unpack,
    methods.match,
    methods.tap,
    methods.tapErr,
  ])('exports %p', (value) => {
    expect(value).toBeDefined();
  });
});
