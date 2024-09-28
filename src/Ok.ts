import { resolveOks } from './resolve-oks.js';
import type {
  AsyncOk,
  ErrTypeOf,
  Ok as OkType,
  ResolveOks,
  Result,
} from './types';

class Ok<T> implements OkType<T> {
  constructor(public readonly value: T) {}

  get isOk(): true {
    // eslint-disable-line class-methods-use-this
    return true;
  }

  get isErr(): false {
    // eslint-disable-line class-methods-use-this
    return false;
  }

  get error(): never {
    throw new TypeError('Cannot access `error` on an Ok instance.', {
      cause: this,
    });
  }

  map<S>(fn: (value: T) => S): Result<S, never> {
    return new Ok(fn(this.value));
  }

  mapErr(): Result<T, never> {
    return this as Result<T, never>;
  }

  chain<S, F>(next: (value: T) => Result<S, F>): Result<S, F> {
    return next(this.value);
  }

  chainErr(): Result<T, never> {
    return this;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(): T {
    return this.value;
  }

  unwrapOrElse(): T {
    return this.value;
  }

  unwrapErr(): never {
    throw new TypeError('Result is not an Err', { cause: this });
  }

  unwrapErrOr<F>(fallback: F): F {
    // eslint-disable-line class-methods-use-this
    return fallback;
  }

  unwrapErrOrElse<F>(fallback: (value: T) => F): F {
    return fallback(this.value);
  }

  unpack(): T {
    return this.value;
  }

  match<TR>(okMatcher: (value: T) => TR): TR {
    return okMatcher(this.value);
  }

  tap(fn: (value: T) => void): Result<T, never> {
    fn(this.value);
    return this;
  }

  tapErr(): Result<T, never> {
    return this;
  }

  unwrapOrThrow(): T {
    return this.value;
  }

  *[Symbol.iterator](): Generator<never, T> {
    // eslint-disable-line require-yield
    return this.value;
  }

  biMap<S>(okFn: (value: T) => S): Result<S, never> {
    return this.map(okFn);
  }

  biChain<S, F>(okFn: (data: T) => Result<S, F>): Result<S, F> {
    return okFn(this.value);
  }

  apply<Args extends any[], R = never>(
    this: Ok<(...args: ResolveOks<Args>) => R>,
    ...args: Args
  ): Result<R, ErrTypeOf<Args[number]>> {
    if (typeof this.value !== 'function') {
      throw new TypeError('Result.value is not a function', { cause: this });
    }

    const argValues = resolveOks(args);

    return Array.isArray(argValues) ? ok(this.value(...argValues)) : argValues;
  }
}

Object.setPrototypeOf(Ok.prototype, null);

export const OkImpl = Ok;

export const ok = <T>(value: T): OkType<T> => new Ok(value);
export const asyncOk = async <T>(value: T | Promise<T>): AsyncOk<T> =>
  ok(await value);
