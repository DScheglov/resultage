import { err } from './Err.js';
import { ensureResult } from './guards.js';
import { isPromise } from './fn/is-promise.js';
import type { ErrTypeOf, NotResultOf, OkTypeOf, Result } from './types';

type Job<T, E> = () => Generator<E, T>;
type Method<T, E, This> = { (this: This): Generator<E, T> };

type AsyncJob<T, E> = () => AsyncGenerator<E, T>;
type AsyncMethod<T, E, This> = { (this: This): AsyncGenerator<E, T> };

const processIteratorResult = <T, E>({
  done,
  value,
}: IteratorResult<E, T>): Result<
  OkTypeOf<T> | NotResultOf<T>,
  E | ErrTypeOf<T>
> => (done ? ensureResult(value as any) : err(value));

export function Do<T, E>(
  job: AsyncJob<T, E>,
): Promise<Result<OkTypeOf<T> | NotResultOf<T>, E | ErrTypeOf<T>>>;

export function Do<T, E, This>(
  method: AsyncMethod<T, E, This>,
  thisArg: This,
): Promise<Result<OkTypeOf<T> | NotResultOf<T>, E | ErrTypeOf<T>>>;

export function Do<T, E>(
  job: Job<T, E>,
): Result<OkTypeOf<T> | NotResultOf<T>, E | ErrTypeOf<T>>;

export function Do<T, E, This>(
  method: Method<T, E, This>,
  thisArg: This,
): Result<OkTypeOf<T> | NotResultOf<T>, E | ErrTypeOf<T>>;

export function Do<T, E, This>(jobOrMethod: any, thisArg?: This): any {
  const generated = jobOrMethod.call(thisArg).next() as
    | IteratorResult<E, T>
    | Promise<IteratorResult<E, T>>;

  return isPromise(generated)
    ? generated.then(processIteratorResult)
    : processIteratorResult(generated);
}
