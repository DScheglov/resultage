import * as R from './sync-methods';
import * as isResult from './guards';
import { Result, AsyncResult, MaybeAsyncResult } from './types';
import { ok } from './Ok';
import { err } from './Err';

export const thenMap =
  <T, S>(fn: (data: T) => S) =>
  <E>(asyncRes: AsyncResult<T, E>): AsyncResult<S, E> =>
      asyncRes.then(R.map(fn));

export const thenMapErr =
  <E, F>(fn: (error: E) => F) =>
  <T>(asyncRes: AsyncResult<T, E>): AsyncResult<T, F> =>
      asyncRes.then(R.mapErr(fn));

export const thenChain =
  <T, S, F>(next: (data: T) => MaybeAsyncResult<S, F>) =>
  <E>(asyncRes: AsyncResult<T, E>): AsyncResult<T | S, E | F> =>
      asyncRes.then((result) => (
        isResult.isOk(result) ? next(result.unwrap()) : result
      ));

export const thenChainErr =
  <E, F, S>(next: (error: E) => MaybeAsyncResult<S, F>) =>
  <T>(asyncRes: AsyncResult<T, E>): AsyncResult<T | S, E | F> =>
      asyncRes.then((result) => (
        isResult.isErr(result) ? next(result.unwrapErr()) : result
      ));

export const thenMatch =
  <T, E, TR, ER>(okMatcher: (data: T) => TR, errMatcher: (error: E) => ER) =>
    (asyncRes: AsyncResult<T, E>): Promise<ER | TR> =>
      asyncRes.then((result) => result.match(okMatcher, errMatcher));

export const thenUnwrap = <E, T>(asyncRes: AsyncResult<T, E>): Promise<T> =>
  asyncRes.then(R.unwrap);

export const thenUnwrapOr = <E, T, S>(fallback: S) =>
  (asyncRes: AsyncResult<T, E>): Promise<T | S> =>
    asyncRes.then(R.unwrapOr(fallback));

export const thenUnwrapOrElse =
  <E, T, S>(fallback: (error: E) => S) =>
    (asyncRes: AsyncResult<T, E>): Promise<T | S> =>
      asyncRes.then(R.unwrapOrElse(fallback));

export const thenUnwrapOrReject =
  <T, E>(asyncRes: AsyncResult<T, E>): Promise<T> =>
    asyncRes.then(R.match(
      (data) => data,
      (error) => Promise.reject(error),
    ));

export const thenUnwrapErr = <T, E>(asyncRes: AsyncResult<T, E>): Promise<E> =>
  asyncRes.then(R.unwrapErr);

export const thenUnwrapErrOr = <T, E, F>(fallback: F) =>
  (asyncRes: AsyncResult<T, E>): Promise<E | F> =>
    asyncRes.then(R.unwrapErrOr(fallback));

export const thenUnwrapErrOrElse =
  <T, F>(fallback: (data: T) => F) =>
    <E>(asyncRes: AsyncResult<T, E>): Promise<E | F> =>
      asyncRes.then(R.unwrapErrOrElse(fallback));

export const thenTap = <E, T>(fn: (data: T) => void) =>
  (asyncRes: AsyncResult<T, E>): AsyncResult<T, E> =>
    asyncRes.then(R.tap(fn));

export const thenTapAndWait = <E, T>(fn: (data: T) => Promise<void>) =>
  (asyncRes: AsyncResult<T, E>): AsyncResult<T, E> =>
    asyncRes.then((result) => result.match(
      async (data) => { await fn(data); return result; },
      () => result,
    ));

export const thenTapErr = <E, T>(fn: (error: E) => void) =>
  (asyncRes: AsyncResult<T, E>): AsyncResult<T, E> =>
    asyncRes.then(R.tapErr(fn));

export const thenTapErrAndWait = <E, T>(fn: (error: E) => Promise<void>) =>
  (asyncRes: AsyncResult<T, E>): AsyncResult<T, E> =>
    asyncRes.then((result) => result.match(
      () => result,
      async (error) => { await fn(error); return result; },
    ));

export const flip = async <E, T>(
  result: Result<T | Promise<T>, E | Promise<E>>,
): AsyncResult<T, E> => (
  isResult.isOk(result)
    ? ok(await result.unwrap())
    : err(await result.unwrapErr())
);

export const from =
  async <T, E>(result: Result<T, E>): AsyncResult<T, E> => result;

export const thenUnpack = <E, T>(asyncRes: AsyncResult<T, E>): Promise<E | T> =>
  asyncRes.then(R.unpack);
