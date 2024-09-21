import { isResult } from './guards.js';
import { ok } from './Ok.js';
import type { Result } from './types';

export const map =
  <T, S>(fn: (data: T) => S) =>
  <E>(result: Result<T, E>): Result<S, E> =>
    result.map(fn);

export const mapErr =
  <E, F>(fn: (error: E) => F) =>
  <T>(result: Result<T, E>): Result<T, F> =>
    result.mapErr(fn);

export const chain =
  <T, F, S>(next: (data: T) => Result<S, F>) =>
  <E>(result: Result<T, E>): Result<S, F | E> =>
    result.chain(next);

export const chainErr =
  <E, F, S>(next: (error: E) => Result<S, F>) =>
  <T>(result: Result<T, E>): Result<T | S, F> =>
    result.chainErr(next);

export const unwrap = <E, T>(result: Result<T, E>): T => result.unwrap();

export const unwrapOr =
  <S>(fallback: S) =>
  <E, T>(result: Result<T, E>): T | S =>
    result.unwrapOr(fallback);

export const unwrapOrThrow = <E, T>(result: Result<T, E>) =>
  result.unwrapOrThrow();

export const unwrapOrElse =
  <E, S>(fallback: (error: E) => S) =>
  <T>(result: Result<T, E>): T | S =>
    result.unwrapOrElse(fallback);

export const unwrapErr = <E, T>(result: Result<T, E>): E => result.unwrapErr();

export const unwrapErrOr =
  <F>(fallback: F) =>
  <E, T>(result: Result<T, E>): E | F =>
    result.unwrapErrOr(fallback);

export const unwrapErrOrElse =
  <T, F>(fallback: (data: T) => F) =>
  <E>(result: Result<T, E>): E | F =>
    result.unwrapErrOrElse(fallback);

export const unpack = <E, T>(result: Result<T, E>): E | T => result.unpack();

export const match =
  <E, T, ER, TR>(okMatcher: (data: T) => TR, errMatcher: (error: E) => ER) =>
  (result: Result<T, E>): ER | TR =>
    result.match(okMatcher, errMatcher);

export const tap =
  <T>(fn: (data: T) => void) =>
  <E>(result: Result<T, E>): Result<T, E> =>
    result.tap(fn);

export const tapErr =
  <E>(fn: (error: E) => void) =>
  <T>(result: Result<T, E>): Result<T, E> =>
    result.tapErr(fn);

type ResolveOks<P extends readonly any[]> = {
  [K in keyof P]: P[K] extends Result<infer T, any> ? T : P[K];
};

type ResolveErrs<P extends readonly any[]> = {
  [K in keyof P]: P[K] extends Result<any, infer E> ? E : never;
};

export const apply =
  <PR extends readonly any[]>(...args: PR) =>
  <T, E>(
    result: Result<(...args: ResolveOks<PR>) => T, E>,
  ): Result<T, E | ResolveErrs<PR>[number]> => {
    if (result.isErr) return result;

    if (typeof result.value !== 'function') {
      throw new TypeError('Result.value is not a function', { cause: result });
    }

    const argValues = [] as any[];

    for (const arg of args) {
      if (!isResult(arg)) {
        argValues.push(arg);
        continue; // eslint-disable-line no-continue
      }
      if (arg.isErr) return arg as any;
      argValues.push(arg.value);
    }

    return ok(result.value(...(argValues as any)));
  };

export const biMap =
  <S, F, T = never, E = never>(okFn: (data: T) => S, errFn: (error: E) => F) =>
  (result: Result<T, E>): Result<S, F> =>
    result.biMap(okFn, errFn);

export const biChain =
  <TS, TF, ES, EF, T = never, E = never>(
    okFn: (data: T) => Result<TS, TF>,
    errFn: (error: E) => Result<ES, EF>,
  ) =>
  (result: Result<T, E>): Result<TS | ES, TF | EF> =>
    result.biChain(okFn, errFn);
