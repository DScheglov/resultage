import { ok, asyncOk } from './Ok.js';
import { err, asyncErr } from './Err.js';
import type {
  Result as ResultType,
  OkTypeOf,
  ErrTypeOf,
  AsyncResult,
  MaybeAsyncResult,
  MaybeAsync,
  OkResult,
  ErrResult,
  ResultOf,
} from './types';
import { rTry } from './try.js';
export * from './guards.js';
export * from './conditional.js';
export * from './do.js';
export * from './lists.js';
export * from './sync-methods.js';
export * from './async-methods.js';

export { ok, asyncOk };
export { err, asyncErr };

export const error = err;
export const asyncError = asyncErr;

export type {
  OkTypeOf,
  ErrTypeOf,
  AsyncResult,
  MaybeAsyncResult,
  MaybeAsync,
  OkResult,
  ErrResult,
  ResultOf,
};

export type Result<T, E> = ResultType<T, E>;

export const Result = {
  ok,
  asyncOk,
  err,
  error: err,
  asyncErr,
  asyncError: asyncErr,
  try: rTry,
};
