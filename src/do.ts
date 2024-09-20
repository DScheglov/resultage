import { err } from './Err.js';
import { ensureResult } from './guards.js';
import { isPromise } from './fn/is-promise.js';
import type {
  ErrTypeOf, NotResultOf, OkTypeOf, Result,
} from './types';

type Job<out T, out E> = () => Generator<E, T>;

type AsyncJob<out T, out E> = () => AsyncGenerator<E, T>;

const processIteratorResult = <T, E>(
  { done, value }: IteratorResult<E, T>,
): Result<
  OkTypeOf<T> | NotResultOf<T>,
  E | ErrTypeOf<T>
> => (done ? ensureResult(value as any) : err(value));

export function Do<T, E>(job: AsyncJob<T, E>): Promise<Result<
  OkTypeOf<T> | NotResultOf<T>,
  E | ErrTypeOf<T>
>>;

export function Do<T, E>(job: Job<T, E>): Result<
  OkTypeOf<T> | NotResultOf<T>,
  E | ErrTypeOf<T>
>;

export function Do<T, E>(job: Job<T, E> | AsyncJob<T, E>) {
  const generated = job().next();

  return isPromise(generated)
    ? generated.then(processIteratorResult)
    : processIteratorResult(generated);
}
