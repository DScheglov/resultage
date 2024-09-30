import type { AsyncErr, Err as ErrType, Result } from './types';

class Err<E> implements ErrType<E> {
  constructor(public readonly error: E) {}

  get isOk(): false {
    // eslint-disable-line class-methods-use-this
    return false;
  }

  get isErr(): true {
    // eslint-disable-line class-methods-use-this
    return true;
  }

  get value(): never {
    throw new TypeError('Cannot access `value` on an Err instance.', {
      cause: this,
    });
  }

  map(): Result<never, E> {
    return this;
  }

  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return new Err(fn(this.error));
  }

  chain(): Result<never, E> {
    return this;
  }

  chainErr<S, F>(next: (error: E) => Result<S, F>): Result<S, F> {
    return next(this.error);
  }

  unwrap(): never {
    throw new TypeError('Result is not an Ok', { cause: this });
  }

  unwrapOr<S>(fallback: S): S {
    // eslint-disable-line class-methods-use-this
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

  tap(): Result<never, E> {
    return this;
  }

  tapErr(fn: (error: E) => void): Result<never, E> {
    fn(this.error);
    return this;
  }

  *[Symbol.iterator](): Generator<E, never> {
    yield this.error;
    return undefined as any as never;
  }

  unwrapOrThrow(): never {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw this.error;
  }

  biMap<S, F>(_: unknown, errFn: (error: E) => F): Result<S, F> {
    return this.mapErr(errFn);
  }

  biChain<S, F>(_: unknown, errFn: (error: E) => Result<S, F>): Result<S, F> {
    return errFn(this.error);
  }

  /**
   * Applies a function to the contained value if Ok, or returns self if Err.
   * For Err, this is a no-op to maintain consistent interface with Ok.
   */
  apply() {
    return this;
  }
  asTuple(): readonly [ok: false, value: undefined, error: E] {
    return [false, undefined, this.error] as const;
  }
}

Object.setPrototypeOf(Err.prototype, null);

export const ErrImpl = Err;

export const err = <E>(error: E): ErrType<E> => new Err(error);
export const asyncErr = async <E>(error: E | Promise<E>): AsyncErr<E> =>
  err(await error);
