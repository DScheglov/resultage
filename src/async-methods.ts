import * as R from './sync-methods.js';
import type {
  Result,
  AsyncResult,
  MaybeAsyncResult,
  ErrTypeOf,
  Err,
} from './types';
import { ok } from './Ok.js';
import { err } from './Err.js';
import { isResult } from './guards.js';

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
    asyncRes.then((result) => (result.isOk ? next(result.value) : result));

export const thenChainErr =
  <E, F, S>(next: (error: E) => MaybeAsyncResult<S, F>) =>
  <T>(asyncRes: AsyncResult<T, E>): AsyncResult<T | S, E | F> =>
    asyncRes.then((result) => (result.isErr ? next(result.error) : result));

export const thenMatch =
  <T, E, TR, ER>(okMatcher: (data: T) => TR, errMatcher: (error: E) => ER) =>
  (asyncRes: AsyncResult<T, E>): Promise<ER | TR> =>
    asyncRes.then((result) => result.match(okMatcher, errMatcher));

export const thenUnwrap = <E, T>(asyncRes: AsyncResult<T, E>): Promise<T> =>
  asyncRes.then(R.unwrap);

export const thenUnwrapOr =
  <E, T, S>(fallback: S) =>
  (asyncRes: AsyncResult<T, E>): Promise<T | S> =>
    asyncRes.then(R.unwrapOr(fallback));

export const thenUnwrapOrElse =
  <E, T, S>(fallback: (error: E) => S) =>
  (asyncRes: AsyncResult<T, E>): Promise<T | S> =>
    asyncRes.then(R.unwrapOrElse(fallback));

export const thenUnwrapOrReject = <T, E>(
  asyncRes: AsyncResult<T, E>,
): Promise<T> =>
  asyncRes.then(
    R.match(
      (data) => data,
      (error) => Promise.reject(error),
    ),
  );

export const thenUnwrapErr = <T, E>(asyncRes: AsyncResult<T, E>): Promise<E> =>
  asyncRes.then(R.unwrapErr);

export const thenUnwrapErrOr =
  <T, E, F>(fallback: F) =>
  (asyncRes: AsyncResult<T, E>): Promise<E | F> =>
    asyncRes.then(R.unwrapErrOr(fallback));

export const thenUnwrapErrOrElse =
  <T, F>(fallback: (data: T) => F) =>
  <E>(asyncRes: AsyncResult<T, E>): Promise<E | F> =>
    asyncRes.then(R.unwrapErrOrElse(fallback));

export const thenTap =
  <E, T>(fn: (data: T) => void) =>
  (asyncRes: AsyncResult<T, E>): AsyncResult<T, E> =>
    asyncRes.then(R.tap(fn));

export const thenTapAndWait =
  <E, T>(fn: (data: T) => Promise<void>) =>
  (asyncRes: AsyncResult<T, E>): AsyncResult<T, E> =>
    asyncRes.then((result) =>
      result.match(
        async (data) => {
          await fn(data);
          return result;
        },
        () => result,
      ),
    );

export const thenTapErr =
  <E, T>(fn: (error: E) => void) =>
  (asyncRes: AsyncResult<T, E>): AsyncResult<T, E> =>
    asyncRes.then(R.tapErr(fn));

export const thenTapErrAndWait =
  <E, T>(fn: (error: E) => Promise<void>) =>
  (asyncRes: AsyncResult<T, E>): AsyncResult<T, E> =>
    asyncRes.then((result) =>
      result.match(
        () => result,
        async (error) => {
          await fn(error);
          return result;
        },
      ),
    );

export const flip = async <E, T>(
  result: Result<T | Promise<T>, E | Promise<E>>,
): AsyncResult<T, E> =>
  result.isOk ? ok(await result.value) : err(await result.error);

export const from = async <T, E>(result: Result<T, E>): AsyncResult<T, E> =>
  result;

export const thenUnpack = <E, T>(asyncRes: AsyncResult<T, E>): Promise<E | T> =>
  asyncRes.then(R.unpack);

export type ResolveAwaitedOks<P extends readonly any[]> = {
  [K in keyof P]: P[K] extends Awaited<Result<infer T, any>> ? T : P[K];
};

export const thenApply =
  <PR extends readonly any[]>(...args: PR) =>
  async <T = never, E = never>(
    asyncRes: MaybeAsyncResult<(...args: ResolveAwaitedOks<PR>) => T, E>,
  ): AsyncResult<T, E | ErrTypeOf<Awaited<PR[number]>>> => {
    const result = await asyncRes;
    if (result.isErr) return result;

    if (typeof result.value !== 'function') {
      throw new TypeError('Result.value is not a function', { cause: result });
    }

    const argValues = [] as any[];
    const awaitedArgs = await Promise.all(args);

    for (const arg of awaitedArgs) {
      if (!isResult(arg)) {
        argValues.push(arg);
      } else if (arg.isErr) {
        return arg as Err<ErrTypeOf<PR[number]>>;
      } else {
        argValues.push(arg.value);
      }
    }

    return ok(result.value(...(argValues as any)));
  };
