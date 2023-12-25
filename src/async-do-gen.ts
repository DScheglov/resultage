import { ensureResult } from './guards';
import {
  MaybeAsync, OkTypeOf, ErrTypeOf, Result,
} from './types';

type AsyncUnwrap = <T, E>(
  result: MaybeAsync<Result<T, E>>,
) => AsyncGenerator<Result<never, E>, T>;

type AsyncJob<out T, out E> = (unpack: AsyncUnwrap) => AsyncGenerator<
  Result<never, E>,
  T
>;

async function* asyncUnwrap<T, E>(
  result: MaybeAsync<Result<T, E>>,
): AsyncGenerator<Result<never, E>, T> {
  const unwrapped = await result;
  if (unwrapped.isErr()) yield unwrapped;
  return unwrapped.unwrap();
}

export const asyncDo =
  <T, E>(job: AsyncJob<T, E>): Promise<Result<OkTypeOf<T>, E | ErrTypeOf<T>>> =>
    job(asyncUnwrap).next().then(
      ({ done, value }) => (done
        ? ensureResult(value as any) // T could be Result as well
        : value) as any,
    );
