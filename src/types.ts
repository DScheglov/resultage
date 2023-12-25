export const SymbolOk = Symbol('Result::Kind::Ok');
export const SymbolErr = Symbol('Result::Kind::Err');

export type Ok<T> = Result<T, never> & { readonly kind: typeof SymbolOk };
export type Err<E> = Result<never, E> & { readonly kind: typeof SymbolErr };

export interface Result<T, E> {
  readonly kind: typeof SymbolOk | typeof SymbolErr;
  isOk(): this is Ok<T>;
  isErr(): this is Err<E>;
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
  unpack(): T | E;
  match<ER, TR>(
    okMatcher: (data: T) => TR,
    errMatcher: (error: E) => ER,
  ): ER | TR;
  tap(fn: (data: T) => void): Result<T, E>;
  tapErr(fn: (error: E) => void): Result<T, E>;
}

export type NotResultOf<T> = T extends Result<any, any> ? never : T;
export type ErrTypeOf<T> = T extends Result<any, infer E> ? E : never;
export type OkTypeOf<T> = T extends Result<infer R, any> ? R : NotResultOf<T>;

export type AsyncResult<T, E> = Promise<Result<T, E>>;
export type AsyncOk<T> = AsyncResult<T, never>;
export type AsyncErr<E> = AsyncResult<never, E>;
export type MaybeAsync<T> = T | Promise<T>;
export type MaybeAsyncResult<T, E> = Result<T, E> | AsyncResult<T, E>;

export type Fallback<E> = E | (() => E);
