import { err } from './Err.js';
import { ok } from './Ok.js';
import type { ErrTypeOf, OkTypeOf, Result } from './types';

export const reduceObject = <R extends Record<string, Result<any, any>>, S>(
  resultStruct: R,
  reducer: (
    acc: S,
    result: OkTypeOf<R[keyof R]>,
    key: keyof R,
    obj: R
  ) => S,
  initial: S,
): Result<S, ErrTypeOf<R[keyof R]>> => {
  let acc = initial;

  for (const [key, result] of Object.entries(resultStruct)) {
    if (result.isErr) return result;
    acc = reducer(acc, result.unwrap(), key, resultStruct);
  }

  return ok(acc);
};

export const reduceObjectErr = <R extends Record<string, Result<any, any>>, S>(
  resultStruct: R,
  reducer: (
    acc: S,
    err: ErrTypeOf<R[keyof R]>,
    key: keyof R,
    obj: R
  ) => S,
  initial: S,
): Result<OkTypeOf<R[keyof R]>, S> => {
  let acc = initial;

  for (const [key, result] of Object.entries(resultStruct)) {
    if (result.isOk) return result;
    acc = reducer(acc, result.unwrapErr(), key, resultStruct);
  }

  return err(acc);
};

export const collectFromObject = <
  R extends Record<string, Result<any, any>>,
>(resultStruct: R): Result<
  { [K in keyof R]: OkTypeOf<R[K]> }, ErrTypeOf<R[keyof R]>
> => reduceObject(
    resultStruct,
    (acc, value, key) => {
      acc[key] = value;
      return acc;
    },
    {} as { [K in keyof R]: OkTypeOf<R[K]> },
  );

export const collectErrFromObject = <
  R extends Record<string, Result<any, any>>,
>(resultStruct: R): Result<
  OkTypeOf<R[keyof R]>, { [K in keyof R]: ErrTypeOf<R[K]> }
> => reduceObjectErr(
    resultStruct,
    (acc, error, key) => {
      acc[key] = error;
      return acc;
    },
    {} as { [K in keyof R]: ErrTypeOf<R[K]> },
  );
