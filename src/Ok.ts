import { resolveOks } from './resolve-oks.js';
import { ResultError } from './ResultError.js';
import type { AsyncOk, ErrTypeOf, OkResult, ResolveOks, Result } from './types';

type OkType<T> = OkResult<T>;

class Ok<T> implements OkResult<T> {
  constructor(public readonly value: T) {}

  get isOk(): true { 
    return true;
  }

  get isErr(): false {
    return false;
  }

  get error(): never {
    return ResultError.raise(
      this,
      'ERR_NOT_ERR',
      'Cannot access `error` on an Ok instance.',
      Object.getOwnPropertyDescriptor(this.constructor.prototype, 'error')!
        .get!,
    );
  }

  map<S>(fn: (value: T) => S) {
    return new Ok(fn(this.value));
  }

  mapErr() {
    return this;
  }

  chain<S, F>(next: (value: T) => Result<S, F>) {
    return next(this.value);
  }

  chainErr() {
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
    return ResultError.raise(
      this,
      'ERR_NOT_ERR',
      'Cannot `unwrapErr` an Ok instance.',
      Object.getOwnPropertyDescriptor(Ok.prototype, 'unwrapErr')!.get!,
    );
  }

  unwrapErrOr<F>(fallback: F): F {
     
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

  tap(fn: (value: T) => void) {
    fn(this.value);
    return this;
  }

  tapErr() {
    return this;
  }

  unwrapOrThrow(): T {
    return this.value;
  }

  *[Symbol.iterator](): Generator<never, T> {
    return this.value;
  }

  biMap<S>(okFn: (value: T) => S) {
    return this.map(okFn);
  }

  biChain<S, F>(okFn: (data: T) => Result<S, F>) {
    return okFn(this.value);
  }

  apply<Args extends any[], R = never>(
    this: Ok<(...args: ResolveOks<Args>) => R>,
    ...args: Args
  ): Result<R, ErrTypeOf<Args[number]>> {
    if (typeof this.value !== 'function') {
      return ResultError.raise(
        this,
        'ERR_VALUE_IS_NOT_A_FUNC',
        'Result.value is not a function',
        Object.getOwnPropertyDescriptor(this.constructor.prototype, 'apply')!
          .value,
      );
    }

    const argValues = resolveOks(args);

    return Array.isArray(argValues) ? ok(this.value(...argValues)) : argValues;
  }

  get [Symbol.toStringTag](): string {
    return 'Ok';
  }
}

Object.setPrototypeOf(Ok.prototype, null);
Object.defineProperty(Ok, 'name', {
  value: 'Ok',
  writable: false,
  enumerable: false,
  configurable: false,
});

export const OkImpl = Ok;

export const ok = <T>(value: T): OkType<T> => new Ok(value);
export const asyncOk = async <T>(value: T | Promise<T>): AsyncOk<T> =>
  ok(await value);
