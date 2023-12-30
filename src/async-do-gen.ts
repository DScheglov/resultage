import { err } from './Err';
import { ensureResult } from './guards';
import {
  MaybeAsync, OkTypeOf, ErrTypeOf, Result, NotResultOf,
} from './types';

type AsyncUnwrap = <T, E>(
  result: MaybeAsync<Result<T, E>>,
) => AsyncGenerator<E, T>;

type AsyncJob<out T, out E> = (unpack: AsyncUnwrap) => AsyncGenerator<E, T>;

async function* asyncUnwrap<T, E>(
  result: MaybeAsync<Result<T, E>>,
): AsyncGenerator<E, T> {
  const awaited = await result;
  if (awaited.isErr()) yield awaited.unwrapErr();
  return awaited.unwrap();
}

export const asyncDo = <T, E>(job: AsyncJob<T, E>): Promise<Result<
  OkTypeOf<T> | NotResultOf<T>,
  E | ErrTypeOf<T>
>> =>
    job(asyncUnwrap).next().then(
      ({ done, value }) => (done
        ? ensureResult(value as any) // T could be Result as well
        : err(value)),
    );
