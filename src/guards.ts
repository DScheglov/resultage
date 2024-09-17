import { Err, Ok, Result } from './types';
import { OkImpl, ok } from './Ok';
import { ErrImpl } from './Err';

export const isResult =
  (value: unknown): value is Result<unknown, unknown> =>
    value instanceof OkImpl || value instanceof ErrImpl;

export const isOk =
  <T>(value: Result<T, unknown>): value is Ok<T> => value.isOk;

export const isErr =
  <E>(value: Result<unknown, E>): value is Err<E> => value.isErr;

export const ensureResult = <T, S, E>(
  value: T | Result<S, E>,
): Result<T | S, E> => (
    isResult(value) ? value : ok(value)
  );
