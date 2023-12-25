import { ensureResult } from './guards';
import {
  Err, ErrTypeOf, OkTypeOf, Result,
} from './types';

type Unwrap = <T, E>(result: Result<T, E>) => Generator<Err<E>, T>;

type Job<out T, out E> = (unpack: Unwrap) => Generator<
  Err<E>,
  T
>;

function* unwrap<T, E>(result: Result<T, E>): Generator<Err<E>, T> {
  if (result.isErr()) yield result;
  return result.unwrap();
}

export function Do<T, E>(job: Job<T, E>): Result<
  OkTypeOf<T>,
  E | ErrTypeOf<T>
> {
  const { done, value } = job(unwrap).next();
  return (done
    ? ensureResult(value as any) // T could be Result as well
    : value);
}
