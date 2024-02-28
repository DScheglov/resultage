import { err } from './Err';
import { ensureResult } from './guards';
import {
  ErrTypeOf, NotResultOf, OkTypeOf, Result,
} from './types';

type Job<out T, out E> = () => Generator<E, T>;

export function Do<T, E>(job: Job<T, E>): Result<
  OkTypeOf<T> | NotResultOf<T>,
  E | ErrTypeOf<T>
> {
  const { done, value } = job().next();
  return (done
    ? ensureResult(value as any) // T could be Result as well
    : err(value));
}
