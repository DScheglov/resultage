import {
  Result, AsyncResult, MaybeAsyncResult,
  ErrTypeOf, Collected, AsyncCollected, OkTypeOf, CollectedErr,
} from './types';
import { ok } from './Ok';
import { err } from './Err';

export const reduce = <T, S, E>(
  results: readonly Result<T, E>[],
  reducer: (acc: S,
    result: T, index: number, list: readonly Result<T, E>[]
  ) => S,
  initial: S,
): Result<S, E> => {
  let acc = initial;
  let index = 0;
  for (const result of results) {
    if (result.isErr()) return result;
    acc = reducer(acc, result.unwrap(), index++, results);
  }

  return ok(acc);
};

export const reduceErr = <T, S, E>(
  results: readonly Result<T, E>[],
  reducer: (acc: S, err: E) => S,
  initial: S,
): Result<T, S> => {
  let acc = initial;
  for (const result of results) {
    if (result.isOk()) return result;
    acc = reducer(acc, result.unwrapErr());
  }

  return err(acc);
};

export const collect = <R extends readonly Result<any, any>[]>(
  results: R,
): Result<Collected<R>, ErrTypeOf<R[number]>> => reduce(
    results,
    (list, result) => {
      list.push(result);
      return list;
    },
    [] as Collected<R>,
  );

export const collectErr = <R extends readonly Result<any, any>[]>(
  results: R,
): Result<OkTypeOf<R[number]>, CollectedErr<R>> => reduceErr(
    results,
    (list, result) => {
      list.push(result);
      return list;
    },
    [] as CollectedErr<R>,
  );

export const collectAsync = <R extends readonly MaybeAsyncResult<any, any>[]>(
  results: R,
): AsyncResult<AsyncCollected<R>, ErrTypeOf<Awaited<R[number]>>> =>
    Promise.all(results).then(collect);

export const partition: {
  <T>(list: T[], predicate: (x: T) => boolean): [T[], T[]];
  <T, S extends T>(
    list: T[], predicate: (x: T) => x is S
  ): [S[], Exclude<T, S>[]];
} = ((
  list: unknown[],
  predicate: (x: unknown) => boolean,
): [unknown[], unknown[]] => {
  const left: unknown[] = [];
  const right: unknown[] = [];
  for (const x of list) {
    if (predicate(x)) {
      left.push(x);
    } else {
      right.push(x);
    }
  }
  return [left, right];
}) as any;

export const separate = <R extends readonly Result<any, any>[]>(
  results: R,
): [Result<Collected<R>, never>, Result<never, CollectedErr<R>>] => {
  const oks = [] as Collected<R> & any[];
  const errs = [] as CollectedErr<R> & any[];

  for (const result of results) {
    if (result.isOk()) {
      oks.push(result.unwrap());
    } else {
      errs.push(result.unwrapErr());
    }
  }

  return [ok(oks), err(errs)];
};

export const sequence = <T extends readonly (() => Result<any, any>)[]>(
  tasks: T,
): Result<
  { -readonly [K in keyof T]: OkTypeOf<ReturnType<T[K]>> },
  ErrTypeOf<ReturnType<T[number]>>
> => {
  const results: any[] = [];

  for (const task of tasks) {
    const res = task(); // eslint-disable-line no-await-in-loop
    if (res.isErr()) return res;
    results.push(res.unwrap());
  }

  return ok(results as any);
};

export const sequenceAsync =
  async <T extends readonly (() => MaybeAsyncResult<any, any>)[]>(
    tasks: T,
  ): AsyncResult<
    { -readonly [K in keyof T]: OkTypeOf<Awaited<ReturnType<T[K]>>> },
    ErrTypeOf<Awaited<T[number]>>
  > => {
    const results: any[] = [];

    for (const task of tasks) {
      const res = await task(); // eslint-disable-line no-await-in-loop
      if (res.isErr()) return res;
      results.push(res.unwrap());
    }

    return ok(results as any);
  };
