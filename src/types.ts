export interface Ok<T> extends ResultInterface<T, never> {
  readonly value: T
  readonly isOk: true;
  readonly isErr: false;
}

export interface Err<E> extends ResultInterface<never, E> {
  readonly error: E;
  readonly isOk: false;
  readonly isErr: true;
}

export interface ResultInterface<T, E> {
  map<S>(fn: (data: T) => S): Result<S, E>;
  mapErr<F>(fn: (error: E) => F): Result<T, F>;
  chain<S, F>(next: (data: T) => Result<S, F>): Result<S, F | E>;
  chainErr<S, F>(next: (error: E) => Result<S, F>): Result<T | S, F>;
  unwrap(): T;
  unwrapOr<S>(fallback: S): T | S;
  unwrapOrElse<S>(fallback: (error: E) => S): T | S;
  unwrapErr(): E;
  unwrapErrOr<F>(fallback: F): E | F;
  unwrapErrOrElse<F>(fallback: (data: T) => F): E | F;
  unwrapOrThrow(): T;
  unpack(): T | E;
  match<ER, TR>(
    okMatcher: (data: T) => TR,
    errMatcher: (error: E) => ER,
  ): ER | TR;
  tap(fn: (data: T) => void): Result<T, E>;
  tapErr(fn: (error: E) => void): Result<T, E>;
  apply<S, F>(result: Result<(data: T) => S, F>): Result<S, E | F>;
  biMap<S, F>(okFn: (data: T) => S, errFn: (error: E) => F): Result<S, F>;
  biChain<TS, TF, ES, EF>(
    okFn: (data: T) => Result<TS, TF>,
    errFn: (error: E) => Result<ES, EF>,
  ): Result<TS | ES, TF | EF>;
  [Symbol.iterator](): Generator<E, T>;
}

export type Result<T, E> = Ok<T> | Err<E>;

export type NotResultOf<T> = T extends Result<any, any> ? never : T;
export type ErrTypeOf<T> = T extends Err<infer E> ? E : never;
export type OkTypeOf<T> = T extends Ok<infer R> ? R : never;

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
