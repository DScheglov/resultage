# Result [![Coverage Status](https://coveralls.io/repos/github/DScheglov/ts-result/badge.svg?branch=main)](https://coveralls.io/github/DScheglov/ts-result?branch=main) [![npm version](https://img.shields.io/npm/v/@cardellini/ts-result.svg?style=flat-square)](https://www.npmjs.com/package/@cardellini/ts-result) [![npm downloads](https://img.shields.io/npm/dm/@cardellini/ts-result.svg?style=flat-square)](https://www.npmjs.com/package/@cardellini/ts-result) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DScheglov/ts-result/blob/master/LICENSE)

Useful type to model success and failure, implemented with focus on type safety,
developer experience and preserving flat learning curve.

## Installation

```bash
npm install @cardellini/ts-result
```

## Usage

```typescript
import { Result, ok, err } from '@cardellini/ts-result';

function divide(a: number, b: number): Result<number, 'ERR_DIV_BY_ZERO'> {
  if (b === 0) {
    return err('ERR_DIV_BY_ZERO');
  }

  return ok(a / b);
}

const result = divide(10, 2);

if (result.isOk()) {
  console.log(result.unwrap()); // 5
} else {
  console.log(result.unwrapErr()); // 'ERR_DIV_BY_ZERO'
}
```

## Documentation

[TODO: insert link to documentation]

## Result Type

`Result<T, E>` is a generic type that represents either success or failure, where:

- `T` is the type of value that represents success and wrapped with `Ok<T>`.
- `E` is the type of error that represents failure and wrapped with `Err<E>`.

The `Result<T, E>` is not a union type, it is an interface with the methods described below,
which is implemented by `Ok<T>` and `Err<E>` classes.

## Methods of `Result<T, E>`

- `isOk(): this is Ok<T>;`<br/>
  Returns `true` if Result is `Ok<T>`, `false` otherwise. Narrows the `Result<T, E>` to `Ok<T>`.
- `isErr(): this is Err<E>;`<br/>
  Returns `true` if Result is `Err<E>`, `false` otherwise. Narrows the `Result<T, E>` to `Err<E>`.
- `map<S>(fn: (data: T) => S): Result<S, E>;`<br/>
  Applies `fn` to the value of `Ok<T>` and returns the value wrapped in `Ok<S>`. If `Result<T, E>` is `Err<E>` returns itself without applying `fn`.
- `mapErr<F>(fn: (error: E) => F): Result<T, F>;`<br/>
  Applies `fn` to the value of `Err<E>` and returns the value wrapped in `Err<F>`. If `Result<T, E>` is `Ok<T>` returns itself without applying `fn`.
- `chain<S, F>(next: (data: T) => Result<S, F>): Result<S, F | E>;`<br/>
  Applies `next` to the value of `Ok<T>` and returns the result of `next`. If the `Result<T, E>` is `Err<E>`, returns itself without applying `next`.
- `chainErr<S, F>(next: (error: E) => Result<S, F>): Result<T | S, F>;`<br/>
  Applies `next` to the value of `Err<E>` and returns the result of `next`. If the `Result<T, E>` is `Ok<T>`, returns itself without applying `next`.
- `unwrap(): T;`<br/>
  Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` throws a `TypeError` where `cause` is the error wrapped in the `Err<E>`.
- `unwrapOr<S>(fallback: S): T | S;`<br/>
  Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` returns `fallback`.
- `unwrapOrElse<S>(fallback: (error: E) => S): T | S;`<br/>
  Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` returns the result of `fallback`.
- `unwrapErr(): E;`<br/>
  Returns the value of `Err<E>`. If the `Result<T, E>` is `Ok<T>` throws a `TypeError` where `cause` is the value wrapped in the `Ok<T>`.
- `unwrapErrOr<F>(fallback: F): E | F;`<br/>
  Returns the value of `Err<E>`. If the `Result<T, E>` is `Ok<T>` returns `fallback`.
- `unwrapErrOrElse<F>(fallback: (data: T) => F): E | F;`<br/>
  Returns the value of `Err<E>`. If the `Result<T, E>` is `Ok<T>` returns the result of `fallback`.
- `unpack(): T | E;`<br/>
  Returns the value of `Ok<T>` or `Err<E>`.
- `match<ER, TR>(okMatcher: (data: T) => TR,errMatcher: (error: E) => ER): ER | TR;`<br/>
  Applies `okMatcher` to the value of `Ok<T>` and returns the result. Applies `errMatcher` to the value of `Err<E>` and returns the result.
- `tap(fn: (data: T) => void): Result<T, E>;`<br/>
  Applies `fn` to the value of `Ok<T>` and returns the original result. If the `Result<T, E>` is `Err<E>` doesn't apply `fn`.
- `tapErr(fn: (error: E) => void): Result<T, E>;`<br/>
  Applies `fn` to the value of `Err<E>` and returns the original result. If the `Result<T, E>` is `Ok<T>` doesn't apply `fn`.
- `apply<S, F>(fnResult: Result<(data: T) => S, F>): Result<S, E | F>;`<br/>
  Applies the function wrapped in `Ok<(data: T) => S>` of argument `fnResult` to the value of `Ok<T>` and returns the result of the application wrapped into `Ok<S>`. If the `Result<T, E>` is `Err<E>` or `fnResult` is `Err<F>`, returns itself without applying the function.
