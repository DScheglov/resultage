export interface OkResult<T> {
  readonly value: T;
  readonly isOk: true;
  readonly isErr: false;
  readonly isError: false;
  map<S>(fn: (data: T) => S): OkResult<S>;
  mapErr(fn: (error: never) => unknown): OkResult<T>;
  chain<S, F>(next: (data: T) => Result<S, F>): Result<S, F>;
  chainErr(next: (error: never) => Result<unknown, unknown>): OkResult<T>;
  unwrap(): T;
  unwrapOr(fallback: unknown): T;
  unwrapOrElse(fallback: (error: never) => unknown): T;
  unwrapErr(): never;
  unwrapErrOr<F>(fallback: F): F;
  unwrapErrOrElse<F>(fallback: (value: T) => F): F;
  unwrapOrThrow(): T;
  unpack(): T;
  match<TR, ER>(
    okMatcher: (data: T) => TR,
    errMatcher: (error: never) => ER,
  ): TR;
  tap(fn: (data: T) => void): OkResult<T>;
  tapErr(fn: unknown): OkResult<T>;

  biMap<S, F>(okFn: (data: T) => S, errFn: (error: never) => F): OkResult<S>;
  biChain<TS, TF, ES, EF>(
    okFn: (data: T) => Result<TS, TF>,
    errFn: (error: never) => Result<ES, EF>,
  ): Result<TS, TF>;
  asTuple(): [ok: true, error: undefined, value: T];
  [Symbol.iterator](): Generator<never, T>;
}

export interface ErrResult<E> {
  readonly error: E;
  readonly isOk: false;
  readonly isErr: true;
  readonly isError: true;
  map(fn: (data: never) => unknown): ErrResult<E>;
  mapErr<F>(fn: (error: E) => F): ErrResult<F>;
  chain(next: (value: never) => Result<unknown, unknown>): ErrResult<E>;
  chainErr<S, F>(next: (error: E) => Result<S, F>): Result<S, F>;
  unwrap(): never;
  unwrapOr<S>(fallback: S): S;
  unwrapOrElse<S>(fallback: (error: E) => S): S;
  unwrapErr(): E;
  unwrapErrOr<F>(fallback: F): E;
  unwrapErrOrElse(fallback: (value: never) => unknown): E;
  unwrapOrThrow(): never;
  unpack(): E;
  match<TR, ER>(
    okMatcher: (value: never) => TR,
    errMatcher: (error: E) => ER,
  ): ER;
  tap(fn: (value: never) => unknown): ErrResult<E>;
  tapErr(fn: (error: E) => void): ErrResult<E>;

  biMap<S, F>(okFn: (value: never) => S, errFn: (error: E) => F): ErrResult<F>;
  biChain<TS, TF, ES, EF>(
    okFn: (value: never) => Result<TS, TF>,
    errFn: (error: E) => Result<ES, EF>,
  ): Result<ES, EF>;
  asTuple(): [ok: false, error: E, value: undefined];
  [Symbol.iterator](): Generator<E, never>;
}

export type Result<T, E> = OkResult<T> | ErrResult<E>;

export type NotResultOf<T> = T extends Result<any, any> ? never : T;
export type ErrTypeOf<T> = T extends ErrResult<infer E> ? E : never;
export type OkTypeOf<T> = T extends OkResult<infer R> ? R : never;

export type AsyncResult<T, E> = Promise<Result<T, E>>;
export type AsyncOk<T> = AsyncResult<T, never>;
export type AsyncErr<E> = AsyncResult<never, E>;
export type MaybeAsync<T> = T | Promise<T>;
export type MaybeAsyncResult<T, E> = Result<T, E> | AsyncResult<T, E>;

export type Fallback<E> = E | (() => E);

export type Collected<R extends readonly unknown[] | []> = {
  -readonly [K in keyof R]: OkTypeOf<R[K]>;
};

export type CollectedErr<R extends readonly unknown[] | []> = {
  -readonly [K in keyof R]: ErrTypeOf<R[K]>;
};

export type AsyncCollected<T extends readonly unknown[] | []> = {
  -readonly [K in keyof T]: OkTypeOf<Awaited<T[K]>>;
};

export type AsyncCollectedErr<T extends readonly unknown[] | []> = {
  -readonly [K in keyof T]: ErrTypeOf<Awaited<T[K]>>;
};

export type ResultOf<T extends (...args: any[]) => Result<any, any>> = Result<
  OkTypeOf<ReturnType<T>>,
  ErrTypeOf<ReturnType<T>>
>;

/**
 * Maps over an array type P, resolving Result types to their contained type T.
 * If an element is not a Result, it retains its original type.
 * This type is used in the apply method to handle arguments that may be Results.
 */
export type ResolveOks<P extends readonly any[]> = {
  [K in keyof P]: P[K] extends Result<infer T, any> ? T : P[K];
};
