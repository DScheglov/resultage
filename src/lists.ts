import {
  Result, AsyncResult, MaybeAsyncResult,
  ErrTypeOf, Collected, AsyncCollected, OkTypeOf, CollectedErr,
} from './types';
import { ok } from './Ok';
import { err } from './Err';

/**
 * Reduces an array of `Result` objects into a single `Result` by applying a reducer function.
 *
 * @param results - An array of `Result` objects.
 * @param reducer - A function that takes an accumulator, a result, an index, and the list of results, and returns the updated accumulator.
 * @param initial - The initial value of the accumulator.
 * @returns A `Result` object that represents the reduced value.
 * @template T - The type of the successful result.
 * @template S - The type of the accumulator.
 * @template E - The type of the error.
 */
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
    if (result.isErr) return result;
    acc = reducer(acc, result.unwrap(), index++, results);
  }

  return ok(acc);
};

/**
 * Reduces an array of `Result` objects by applying a reducer function to each error value.
 * If any of the `Result` objects is an `Ok` variant, it is returned as is.
 * If all `Result` objects are `Err` variants, the reducer function is applied to each error value
 * in the array, starting with the initial value, and the final result is wrapped in an `Err` variant.
 *
 * @param results - An array of `Result` objects.
 * @param reducer - A function that takes an accumulator and an error value, and returns the updated accumulator.
 * @param initial - The initial value of the accumulator.
 * @returns A `Result` object that is either an `Ok` variant if any of the `Result` objects is an `Ok` variant,
 * or an `Err` variant with the final result of applying the reducer function to each error value.
 * @template T - The type of the value in the `Ok` variant of the `Result` objects.
 * @template S - The type of the accumulator.
 * @template E - The type of the value in the `Err` variant of the `Result` objects.
 */
export const reduceErr = <T, S, E>(
  results: readonly Result<T, E>[],
  reducer: (acc: S, err: E) => S,
  initial: S,
): Result<T, S> => {
  let acc = initial;
  for (const result of results) {
    if (result.isOk) return result;
    acc = reducer(acc, result.unwrapErr());
  }

  return err(acc);
};

/**
 * Collects the results of an array of `Result` objects into a single `Result` object.
 *
 * @template R - The array type containing `Result` objects.
 * @param results - The array of `Result` objects to collect.
 * @returns A `Result` object containing the collected results.
 */
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

/**
 * Collects the error values from an array of `Result` objects.
 *
 * @template R - The array type containing `Result` objects.
 * @param results - The array of `Result` objects.
 * @returns A `Result` object containing the collected error values.
 */
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

/**
 * Collects the results of multiple asynchronous operations into a single result.
 *
 * @template R - The array type containing the results of the asynchronous operations.
 * @param results - An array of promises representing the asynchronous operations.
 * @returns A promise that resolves to the collected results or rejects with the error of the first failed operation.
 */
export const collectAsync = <R extends readonly MaybeAsyncResult<any, any>[]>(
  results: R,
): AsyncResult<AsyncCollected<R>, ErrTypeOf<Awaited<R[number]>>> =>
    Promise.all(results).then(collect);

/**
 * Partitions an array into two separate arrays based on a given predicate.
 * The first array contains elements that satisfy the predicate, while the second array contains elements that do not.
 *
 * @param list - The array to be partitioned.
 * @param predicate - The predicate function used to determine whether an element should be included in the first array.
 * @returns An array containing two arrays: the first array contains elements that satisfy the predicate, and the second array contains elements that do not.
 */
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

/**
 * Separates an array of `Result` objects into two separate `Result` objects.
 * The first `Result` contains the collected successful values, while the second `Result` contains the collected error values.
 *
 * @param results An array of `Result` objects.
 * @returns A tuple containing two `Result` objects: the first one contains the collected successful values, and the second one contains the collected error values.
 */
export const separate = <R extends readonly Result<any, any>[]>(
  results: R,
): [Result<Collected<R>, never>, Result<never, CollectedErr<R>>] => {
  const oks = [] as Collected<R> & any[];
  const errs = [] as CollectedErr<R> & any[];

  for (const result of results) {
    if (result.isOk) {
      oks.push(result.unwrap());
    } else {
      errs.push(result.unwrapErr());
    }
  }

  return [ok(oks), err(errs)];
};

/**
 * Executes an array of tasks that return `Result` objects and collects their successful results.
 * If any task returns an `Err` result, the function stops executing and returns that error.
 *
 * @param tasks An array of tasks that return `Result` objects.
 * @returns A `Result` object containing an array of successful results, or an error if any task fails.
 */
export const sequence = <T extends readonly (() => Result<any, any>)[]>(
  tasks: T,
): Result<
  { -readonly [K in keyof T]: OkTypeOf<ReturnType<T[K]>> },
  ErrTypeOf<ReturnType<T[number]>>
> => {
  const results: any[] = [];

  for (const task of tasks) {
    const res = task(); // eslint-disable-line no-await-in-loop
    if (res.isErr) return res;
    results.push(res.unwrap());
  }

  return ok(results as any);
};

/**
 * Executes an array of asynchronous tasks sequentially and returns the results as an `AsyncResult`.
 *
 * @param tasks - An array of functions that return `MaybeAsyncResult` when executed.
 * @returns An `AsyncResult` containing the results of the executed tasks.
 */
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
      if (res.isErr) return res;
      results.push(res.unwrap());
    }

    return ok(results as any);
  };
