import type { ErrResult, OkResult, Result } from './types';
import { OkImpl, ok } from './Ok.js';
import { ErrImpl } from './Err.js';

export const isResult = (value: unknown): value is Result<unknown, unknown> =>
  value instanceof OkImpl || value instanceof ErrImpl;

export const isOk = <T>(value: Result<T, unknown>): value is OkResult<T> =>
  value.isOk;

export const isErr = <E>(value: Result<unknown, E>): value is ErrResult<E> =>
  value.isErr;

export const ensureResult = <T, S, E>(
  value: T | Result<S, E>,
): Result<T | S, E> => (isResult(value) ? value : ok(value));
