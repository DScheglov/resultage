import { Result, AsyncResult, MaybeAsyncResult } from './types';
import { ok } from './Ok';

export const reduce = <T, S, E>(
  results: Result<T, E>[],
  reducer: (acc: S, result: T) => S,
  initial: S,
): Result<S, E> => {
  let acc = initial;
  for (const result of results) {
    if (result.isErr()) return result;
    acc = reducer(acc, result.unwrap());
  }

  return ok(acc);
};

export const collect = <T, E>(
  results: Result<T, E>[],
): Result<T[], E> => reduce(
    results,
    (list, result) => {
      list.push(result);
      return list;
    },
    [] as T[],
  );

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

export const sequence =
  async <T, E>(
    tasks: Array<() => MaybeAsyncResult<T, E>>,
  ): AsyncResult<T[], E> => {
    const results: T[] = [];

    for (const task of tasks) {
      const res = await task(); // eslint-disable-line no-await-in-loop

      if (res.isErr()) {
        return res;
      }

      results.push(res.unwrap());
    }

    return ok(results);
  };
