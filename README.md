# Result [![Coverage Status](https://coveralls.io/repos/github/DScheglov/ts-result/badge.svg?branch=main)](https://coveralls.io/github/DScheglov/ts-result?branch=main)
[![npm version](https://img.shields.io/npm/v/@cardellini/ts-result.svg?style=flat-square)](https://www.npmjs.com/package/@cardellini/ts-result)
[![npm downloads](https://img.shields.io/npm/dm/@cardellini/ts-result.svg?style=flat-square)](https://www.npmjs.com/package/@cardellini/ts-result)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DScheglov/ts-result/blob/master/LICENSE)

Useful type to model success and failure, implemented with focus on type safety,
developer experience and preserving flat learning curve.

## Installation

```bash
npm install @cardellini/ts-result
```

## Usage

### Creating a Result

```typescript
import { Result, ok, err } from '@cardellini/ts-result';

type JsonObject = Record<string, unknown>;

const okIfObject = (value: unknown): Result<JsonObject, 'ERR_NOT_AN_OBJECT'> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? ok(value as JsonObject)
    : err('ERR_NOT_AN_OBJECT');

const okIfInt = (value: unknown): Result<number, 'ERR_NOT_AN_INT'> =>
  Number.isInteger(value)
    ? ok(value as number)
    : err('ERR_NOT_AN_INT');

const okIfString = (value: unknown): Result<string, 'ERR_NOT_A_STRING'> =>
  typeof value === 'string'
    ? ok(value)
    : err('ERR_NOT_A_STRING');
```

### Composing with Do-notation

```typescript
type Person = {
  name: string;
  age: number;
}

const okIfPerson = (value: unknown): Result<Person, 'ERR_NOT_A_PERSON'> =>
  Do(function*() {
    const obj = yield* okIfObject(value);
    const name = yield* okIfString(obj.name);
    const age = yield* okIfInt(obj.age);

    return { name, age };
  }).mapErr(() => 'ERR_NOT_A_PERSON');

const person: Person = okIfPerson({ name: 'John', age: 42 }).unwrap();
```

### Composing with chain

```typescript
const okIfPerson =
  (value: unknown) => okIfObject(value).chain(
  (obj)            => okIfString(obj.name).chain(
  (name)           => okIfInt(obj.age).chain(
  (age)            => ok({ name, age })
)));
```

or the same with `map` on the last step:

```typescript
const okIfPerson =
  (value: unknown) => okIfObject(value).chain(
  (obj)            => okIfString(obj.name).chain(
  (name)           => okIfInt(obj.age).map(
  (age)            => ({ name, age })
)));
```

> Note: from the performance perspective, using `chain` is preferable to `Do`-notation,
> because `chain` doesn't create and run generators.
> However, `Do`-notation is more readable and easier to use.
> Additionally, the formatting of the code in this section requires specific
> linters and formatters configuration.

### Collecting Ok-s from a Result Array

```typescript
const lordOfTheRingsAuthors = collect([
  ok({ id, name: 'J. R. R. Tolkien' }),
  ok({ id, name: 'Christopher Tolkien' }),
]);

const silmarillionAuthors = collect([
  ok({ id, name: 'J. R. R. Tolkien' }),
  err('ERR_PERSON_NOT_FOUND' as const),
]);

console.log(lordOfTheRingsAuthors.unwrap());
// Prints to console:
// [
//   { id, name: 'J. R. R. Tolkien' },
//   { id, name: 'Christopher Tolkien' }
// ]

console.log(silmarillionAuthors.unwrapErr());
// Prints to console: ERR_PERSON_NOT_FOUND
```

### Working with Async Results

```typescript
import { Do, collect, err, ok } from '@cardellini/ts-result';

const getBookWithAuthors = (bookId: string) =>
  Do(async function* () {
    const book = yield* await fetchBook(bookId);
    const authors = yield* await fetchPersons(book.authorIds);

    return { ...book, authors };
  });

const fetchBook = async (id: string) => (
  id === '1' ? ok({ id, title: 'The Lord of the Rings', authorIds: ['1', '2'] }) :
  id === '2' ? ok({ id, title: 'The Silmarillion', authorIds: ['1', '3'] }) :
  err('ERR_BOOK_NOT_FOUND' as const)
);

const fetchPersons = async (ids: string[]) => collect(
  ids.map(id => (
    id === '1' ? ok({ id, name: 'J. R. R. Tolkien' }) :
    id === '2' ? ok({ id, name: 'Christopher Tolkien' }) :
    err("ERR_PERSON_NOT_FOUND" as const)
  ))
);

async function run() {
  const LordOfTheRings = await getBookWithAuthors('1');
  console.log(LordOfTheRings.unwrap());
  // Prints to console book with authors populated

  const Silmarillion = await getBookWithAuthors('2');
  console.log(Silmarillion.unwrapErr());
  // Prints to console: ERR_PERSON_NOT_FOUND

  const TheHobbit = await getBookWithAuthors('3');
  console.log(TheHobbit.unwrapErr());
  // Prints to console: ERR_BOOK_NOT_FOUND
}

run().catch(console.error);
```

## Documentation

[TODO: insert link to documentation]

## Result Type

`Result<T, E>` is a generic type that represents either success or failure, and
is an union of `Ok<T>` and `Err<E>` types:
  
  ```typescript
  type Result<T, E> = Ok<T> | Err<E>;
  ```

Where:

- `Ok<T>` is a type that represents success and wraps the value of type `T`.
- `Err<E>` is a type that represents failure and wraps the error of type `E`.

### `Ok<T>` Interface

`Ok<T>` is an interface that extends the `ResultInterface<T, never>` interface
with the following structure.

```typescript
interface Ok<T> extends ResultInterface<T, never> {
  readonly value: T;
  readonly isOk: true;
  readonly isErr: false;
}
```

The property `value` is accessible only when the type of the correspondent variable
or parameter is narrowed from the `Result<T, E>` to the `Ok<T>`.

To narrow the type of the variable or parameter to `Ok<T>`, use either the `isOk` method
or the `isErr` method on the `Result<T, E>` instance.

### `Err<E>` Interface

`Err<E>` is an interface that extends the `ResultInterface<never, E>` interface
with the following structure.

```typescript
interface Err<E> extends ResultInterface<never, E> {
  readonly error: E;
  readonly isOk: false;
  readonly isErr: true;
}
```

The property `error` is accessible only when the type of the correspondent variable
or parameter is narrowed from the `Result<T, E>` to the `Err<E>`.

To narrow the type of the variable or parameter to `Err<E>`, use either the `isOk` method
or the `isErr` method on the `Result<T, E>` instance.

### `ResultInterface<T, E>` Interface

`ResultInterface<T, E>` is an interface that defines the common Result methods.

```typescript
interface ResultInterface<T, E> {
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
```

## Constructors

### ok(value)

Creates an instance of `Ok<T>`.

Function Signature:

```typescript
const ok: <T>(value: T) => Ok<T>
```

### err(error)

Creates an instance of `Err<E>`.

Function Signature:

```typescript
const err: <E>(error: E) => Err<E>
```

## Methods of `Result<T, E>` Instances

### isOk()

Returns `true` if Result is `Ok<T>`, `false` otherwise. Narrows the `Result<T, E>` to `Ok<T>`.

Method Signature:

```typescript
interface Result<T, E> {
  isOk(): this is Ok<T>
}
```

Function Signature:

```typescript
const isOk: <T, E>(result: Result<T, E>) => result is Ok<T>
```

### isErr()

Returns `true` if Result is `Err<E>`, `false` otherwise. Narrows the `Result<T, E>` to `Err<E>`.

Method Signature:

```typescript
interface Result<T, E> {
  isErr(): this is Err<E>
}
```

Function Signature:

```typescript
const  isErr: <T, E>(result: Result<T, E>): result is Err<E>
```

### map(fn)

Applies `fn` to the value of `Ok<T>` and returns the value wrapped in `Ok<S>`. If `Result<T, E>` is `Err<E>` returns itself without applying `fn`.

Method Signature:

```typescript
interface Result<T, E> {
  map<S>(fn: (data: T) => S): Result<S, E>
}
```

Curried Function Signature:

```typescript
const map:
  <T, S>(fn: (data: T) => S) =>
  <E>(result: Result<T, E>) => Result<S, E>
```

### mapErr(fn)

Applies `fn` to the value of `Err<E>` and returns the value wrapped in `Err<F>`. If `Result<T, E>` is `Ok<T>` returns itself without applying `fn`.

Method Signature:

```typescript
interface Result<T, E> {
  mapErr<F>(fn: (error: E) => F): Result<T, F>
}
```

Curried Function Signature:

```typescript
const mapErr:
  <E, F>(fn: (error: E) => F) =>
  <T>(result: Result<T, E>) => Result<T, F>
```

### chain(next)

Applies `next` to the value of `Ok<T>` and returns the result of `next`. If the `Result<T, E>` is `Err<E>`, returns itself without applying `next`.

Method Signature:

```typescript
interface Result<T, E> {
  chain<S, F>(next: (data: T) => Result<S, F>): Result<T | S, E | F>
}
```

Curried Function Signature:

```typescript
const chain:
  <T, S, E, F>(next: (data: T) => Result<S, F>) =>
  (result: Result<T, E>) => Result<T | S, E | F>
```

### chainErr(next)

Applies `next` to the value of `Err<E>` and returns the result of `next`. If the `Result<T, E>` is `Ok<T>`, returns itself without applying `next`.

Method Signature:

```typescript
interface Result<T, E> {
  chainErr<S, F>(next: (error: E) => Result<S, F>): Result<T | S, E | F>
}
```

Curried Function Signature:

```typescript
const chainErr:
  <S, E, F>(next: (error: E) => Result<S, F>) =>
  <T>(result: Result<T, E>) => Result<T | S, E | F>
```

### unwrap()

Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` throws a `TypeError` where `cause` is the `Err<E>`.

Method Signature:

```typescript
interface Result<T, E> {
  unwrap(): T
}
```

Function Signature:

```typescript
const unwrap: <T>(result: Result<T, unknown>) => T
```

### unwrapOr(fallback)

Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` returns `fallback`.

Method Signature:

```typescript
interface Result<T, E> {
  unwrapOr<S>(fallback: S): T | S
}
```

Curried Function Signature:

```typescript
const unwrapOr:
  <T, S>(fallback: S) =>
  (result: Result<T, unknown>) => T | S
```

### unwrapOrThrow()

Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` throws a value of
type `E`.

`unwrapOrThrow` doesn't check if `E` is an instance of `Error` or not, so it is
possible to throw a non-error literal.

Method Signature:

```typescript
interface Result<T, E> {
  unwrapOrThrow(): T
}
```

Function Signature:

```typescript
const unwrapOrThrow: <T>(result: Result<T, unknown>) => T
```

### unwrapOrElse

Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` returns the result of `fallbackFn`.

Method Signature:

```typescript
interface Result<T, E> {
  unwrapOrElse<S>(fallbackFn: (error: E) => S): T | S
}
```

Curried Function Signature:

```typescript
const unwrapOrElse:
  <T, S>(fallbackFn: (error: unknown) => S) =>
  (result: Result<T, unknown>) => T | S
```

### unwrapErr

Returns the value of `Err<E>`. If the `Result<T, E>` is `Ok<T>` throws a `TypeError` where `cause` is the `Ok<T>`.

Method Signature:

```typescript
interface Result<T, E> {
  unwrapErr(): E
}
```

Function Signature:

```typescript
const unwrapErr: <E>(result: Result<unknown, E>) => E
```

### unwrapErrOr(fallback)

Returns the value of `Err<E>`. If the `Result<T, E>` is `Ok<T>` returns `fallback`.

Method Signature:

```typescript
interface Result<T, E> {
  unwrapErrOr<F>(fallback: F): E | F
}
```

Curried Function Signature:

```typescript
const unwrapErrOr:
  <F>(fallback: F) =>
  <T, E>(result: Result<T, E>) => E | F
```

### unwrapErrOrElse(fallbackFn)

Returns the value of `Err<E>`. If the `Result<T, E>` is `Ok<T>` returns the result of `fallback`.

Method Signature:

```typescript
interface Result<T, E> {
  unwrapErrOrElse<F>(fallbackFn: (data: T) => F): E | F
}
```

Curried Function Signature:

```typescript
const unwrapErrOrElse:
  <F, T>(fallbackFn: (data: T) => F) =>
  <E>(result: Result<T, E>) => E | F
```

### unpack()

Returns the value of `Ok<T>` or `Err<E>`.

Method Signature:

```typescript
interface Result<T, E> {
  unpack(): T | E
}
```

Function Signature:

```typescript
const unpack: <T, E>(result: Result<T, E>) => T | E
```

### match(okMatcher, errMatcher)

Applies `okMatcher` to the value of `Ok<T>` and returns the result. Applies `errMatcher` to the value of `Err<E>` and returns the result.

Method Signature:

```typescript
interface Result<T, E> {
  match<S, F>(okMatcher: (data: T) => S, errMatcher: (error: E) => F): S | F
}
```

Curried Function Signature:

```typescript
const match:
  <T, S, E, F>(okMatcher: (data: T) => S, errMatcher: (error: E) => F) =>
  (result: Result<T, E>) => S | F
```

### tap(fn)

Applies `fn` to the value of `Ok<T>` and returns the original result. If the `Result<T, E>` is `Err<E>` doesn't apply `fn`.

Method Signature:

```typescript
interface Result<T, E> {
  tap(fn: (data: T) => void): Result<T, E>
}
```

Curried Function Signature:

```typescript
const tap:
  <T>(fn: (data: T) => void) =>
  <E>(result: Result<T, E>) => Result<T, E>
```

### tapErr(fn)

Applies `fn` to the value of `Err<E>` and returns the original result. If the `Result<T, E>` is `Ok<T>` doesn't apply `fn`.

Method Signature:

```typescript
interface Result<T, E> {
  tapErr(fn: (error: E) => void): Result<T, E>
}
```

Curried Function Signature:

```typescript
const tapErr:
  <E>(fn: (error: E) => void) =>
  <T>(result: Result<T, E>) => Result<T, E>
```

### apply(fnResult)

Applies the function wrapped in `Ok<(data: T) => S>` of argument `fnResult` to the value of `Ok<T>` and returns the result of the application wrapped into `Ok<S>`. If the `Result<T, E>` is `Err<E>` or `fnResult` is `Err<F>`, returns itself without applying the function.

Method Signature:

```typescript
interface Result<T, E> {
  apply<S, F>(fnResult: Result<(data: T) => S, F>): Result<S, E | F>
}
```

Curried Function Signature:

```typescript
const apply: 
  <T, S, F>(fnResult: Result<(data: T) => S, F>) =>
  <E>(result: Result<T, E>) => Result<S, E | F>
```

## Operating on Multiple Results

### collect(results)

Collects `Ok<T>` values from an array of `Result<T, E>` and returns a `Result<T[], E>`.

Function Signature:

```typescript
const collect:
  <R extends readonly Result<any, any>[]>(results: R) => Result<Collected<R>, ErrTypeOf<R[number]>>
```
