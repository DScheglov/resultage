import { Result } from './types';
import { ok } from './Ok';
import { err } from './Err';

export const okIf: {
  <T, S extends T, F>(
    value: T,
    guard: (data: T) => data is S,
    fallback: F | ((value: Exclude<T, S>) => F)
  ): Result<S, F>;
  <T, F>(
    value: T,
    predicate: (data: T) => boolean,
    fallback: F | ((value: T) => F)
  ): Result<T, F>;
} = (
  value: unknown,
  predicate: (data: any) => boolean,
  fallback: (value: any) => any,
) => (predicate(value)
  ? ok(value)
  : err(typeof fallback === 'function' ? fallback(value) : fallback));

export const expect: {
  <T, S extends T, F>(
    guard: (data: T) => data is S,
    fallback: F | ((value: Exclude<T, S>) => F)
  ): (value: T) => Result<S, F>;
  <T, F>(
    predicate: (data: T) => boolean,
    fallback: F | ((value: T) => F)
  ): (value: T) => Result<T, F>;
} = (
  predicate: (data: any) => boolean,
  fallback: (value: any) => any,
) => (value: unknown) => okIf(value, predicate, fallback);

export const expectExists =
  <E>(fallback: E | ((value: undefined | null) => E)) =>
  <T>(value: T | undefined | null): Result<T, E> =>
      okIf(
        value,
        (value: T | undefined | null): value is T => value != null,
        fallback,
      );

export const okIfExists = <T, E>(
  value: T | undefined | null,
  fallback: E | ((value: undefined | null) => E),
): Result<T, E> => okIf(
    value,
    (value: T | undefined | null): value is T => value != null,
    fallback,
  );
