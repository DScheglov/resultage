import { err } from './Err';
import { ensureResult } from './guards';
import {
  ErrTypeOf, NotResultOf, OkTypeOf, Result,
} from './types';

type Unwrap = <T, E>(result: Result<T, E>) => Generator<E, T>;
type Job<out T, out E> = (unpack: Unwrap) => Generator<E, T>;

function* unwrap<T, E>(result: Result<T, E>): Generator<E, T> {
  if (result.isErr()) yield result.unwrapErr();
  return result.unwrap();
}

export function Do<T, E>(job: Job<T, E>): Result<
  OkTypeOf<T> | NotResultOf<T>,
  E | ErrTypeOf<T>
> {
  const { done, value } = job(unwrap).next();
  return (done
    ? ensureResult(value as any) // T could be Result as well
    : err(value));
}
