import { ErrResult, Result } from './types.js';
import { isPromise } from './fn/is-promise.js';
import { ok } from './Ok.js';
import { err } from './Err.js';

export function rTry<Args extends unknown[]>(
  fn: (...args: Args) => never,
  ...args: Args
): ErrResult<unknown>;
export function rTry<T, Args extends unknown[]>(
  fn: () => Promise<T>,
  ...args: Args
): Promise<Result<T, unknown>>;
export function rTry<T, Args extends unknown[]>(
  fn: (...args: Args) => T,
  ...args: Args
): Result<T, unknown>;
export function rTry<T>(promise: Promise<T>): Promise<Result<T, unknown>>;
export function rTry<T>(value: T): Result<T, unknown>;
export function rTry<T, Args extends unknown[]>(
  fn: Promise<T> | ((...args: Args) => T | Promise<T>),
  ...args: Args
): any {
  if (isPromise(fn)) return fn.then(ok, err);
  if (typeof fn !== 'function') return ok(fn as T);
  try {
    const result = fn(...args);
    return isPromise(result) ? result.then(ok, err) : ok(result);
  } catch (error) {
    return err(error);
  }
}
