import { ResultError } from './ResultError.js';
import type { AsyncErr, ErrResult, Result } from './types';

type ErrType<E> = ErrResult<E>;

class Err<E> implements ErrResult<E> {
  constructor(public readonly error: E) {}

  get isOk(): false {
    return false;
  }

  get isErr(): true {
    return true;
  }

  get isError(): true {
    return true;
  }

  get value(): never {
    return ResultError.raise(
      this,
      'ERR_NOT_OK',
      'Cannot access `value` on an Err instance.',
      Object.getOwnPropertyDescriptor(Err.prototype, 'value')!.get!,
    );
  }

  map() {
    return this;
  }

  mapErr<F>(fn: (error: E) => F) {
    return new Err(fn(this.error));
  }

  chain() {
    return this;
  }

  chainErr<S, F>(next: (error: E) => Result<S, F>): Result<S, F> {
    return next(this.error);
  }

  unwrap(): never {
    return ResultError.raise(
      this,
      'ERR_NOT_OK',
      'Cannot `unwrap` an Err instance.',
      Object.getOwnPropertyDescriptor(Err.prototype, 'unwrap')!.get!,
    );
  }

  unwrapOr<S>(fallback: S): S {
    return fallback;
  }

  unwrapOrElse<S>(fallback: (error: E) => S): S {
    return fallback(this.error);
  }

  unwrapErr(): E {
    return this.error;
  }

  unwrapErrOr(): E {
    return this.error;
  }

  unwrapErrOrElse(): E {
    return this.error;
  }

  unpack(): E {
    return this.error;
  }

  match<TR, ER>(
    okMatcher: (data: never) => TR,
    errMatcher: (error: E) => ER,
  ): ER {
    return errMatcher(this.error);
  }

  tap() {
    return this;
  }

  tapErr(fn: (error: E) => void) {
    fn(this.error);
    return this;
  }

  *[Symbol.iterator](): Generator<E, never> {
    yield this.error;
    return undefined as any as never;
  }

  unwrapOrThrow(): never {
    throw this.error;
  }

  biMap<F>(_: unknown, errFn: (error: E) => F) {
    return this.mapErr(errFn);
  }

  biChain<S, F>(_: unknown, errFn: (error: E) => Result<S, F>) {
    return errFn(this.error);
  }

  asTuple(): [ok: false, error: E, value: undefined] {
    return [false, this.error, undefined];
  }

  get [Symbol.toStringTag](): string {
    return 'Err';
  }
}

Object.setPrototypeOf(Err.prototype, null);
Object.defineProperty(Err, 'name', {
  value: 'Err',
  writable: false,
  enumerable: false,
  configurable: false,
});

export const ErrImpl = Err;

export const err = <E>(error: E): ErrType<E> => new Err(error);
export const asyncErr = async <E>(error: E | Promise<E>): AsyncErr<E> =>
  err(await error);
