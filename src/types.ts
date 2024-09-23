export interface Ok<T> extends ResultInterface<T, never> {
  readonly value: T;
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

  biMap<S, F>(okFn: (data: T) => S, errFn: (error: E) => F): Result<S, F>;
  biChain<TS, TF, ES, EF>(
    okFn: (data: T) => Result<TS, TF>,
    errFn: (error: E) => Result<ES, EF>,
  ): Result<TS | ES, TF | EF>;
  [Symbol.iterator](): Generator<E, T>;
  apply<Args extends any[], R>(
    this: ResultInterface<(...args: ResolveOks<Args>) => R, E>,
    ...args: Args
  ): Result<R, E | ErrTypeOf<Args[number]>>;
}

export type Result<T, E> = (Ok<T> | Err<E>) & {
  /**
   * Applies the function contained in this Result to the given arguments.
   * If this Result is an Err, it returns the Err. If any argument is an Err, it returns that Err.
   * Otherwise, it applies the function to the resolved arguments and wraps the result in a new Result.
   *
   * @param args - The arguments to apply to the function. Arguments can be both Results and regular values.
   * @returns A new Result containing either the function's result or an error
   */
  apply<Args extends any[], R>(
    this: ResultInterface<(...args: ResolveOks<Args>) => R, E>,
    ...args: Args
  ): Result<R, E | ErrTypeOf<Args[number]>>;
};

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

/**
 * Maps over an array type P, resolving Result types to their contained type T.
 * If an element is not a Result, it retains its original type.
 * This type is used in the apply method to handle arguments that may be Results.
 */
export type ResolveOks<P extends readonly any[]> = {
  [K in keyof P]: P[K] extends Result<infer T, any> ? T : P[K];
};
