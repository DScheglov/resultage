import { Result } from './types';

export const map =
  <T, S>(fn: (data: T) => S) =>
    <E>(result: Result<T, E>): Result<S, E> => result.map(fn);

export const mapErr =
  <E, T, F>(fn: (error: E) => F) =>
    (result: Result<T, E>): Result<T, F> => result.mapErr(fn);

export const chain =
  <E, T, F, S>(next: (data: T) => Result<S, F>) =>
    (result: Result<T, E>): Result<S, F | E> => result.chain(next);

export const chainErr =
  <E, T, F, S>(next: (error: E) => Result<S, F>) =>
    (result: Result<T, E>): Result<T | S, F> => result.chainErr(next);

export const unwrap = <E, T>(result: Result<T, E>): T => result.unwrap();

export const unwrapGen = <E, T>(result: Result<T, E>): Generator<E, T> =>
  result.unwrapGen();

export const unwrapOr = <E, T, S>(fallback: S) =>
  (result: Result<T, E>): T | S => result.unwrapOr(fallback);

export const unwrapOrThrow = <E, T>(result: Result<T, E>) =>
  result.unwrapOrThrow();

export const unwrapOrElse =
<E, T, S>(fallback: (error: E) => S) =>
    (result: Result<T, E>): T | S => result.unwrapOrElse(fallback);

export const unwrapErr = <E, T>(result: Result<T, E>): E => result.unwrapErr();

export const unwrapErrOr = <E, T, F>(fallback: F) =>
  (result: Result<T, E>): E | F => result.unwrapErrOr(fallback);

export const unwrapErrOrElse =
  <E, T, F>(fallback: (data: T) => F) =>
    (result: Result<T, E>): E | F => result.unwrapErrOrElse(fallback);

export const unpack = <E, T>(result: Result<T, E>): E | T => result.unpack();

export const match =
  <E, T, ER, TR>(okMatcher: (data: T) => TR, errMatcher: (error: E) => ER) =>
    (result: Result<T, E>): ER | TR => result.match(okMatcher, errMatcher);

export const tap =
  <E, T>(fn: (data: T) => void) =>
    (result: Result<T, E>): Result<T, E> => result.tap(fn);

export const tapErr =
  <E, T>(fn: (error: E) => void) =>
    (result: Result<T, E>): Result<T, E> => result.tapErr(fn);

export const apply =
  <T, F, S>(result: Result<(data: T) => S, F>) =>
    <E>(value: Result<T, E>): Result<S, E | F> => value.apply(result);
