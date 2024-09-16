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

`Result<T, E>` is a generic type that represents either success or failure, where:

- `T` is the type of value that represents success and wrapped with `Ok<T>`.
- `E` is the type of error that represents failure and wrapped with `Err<E>`.

The `Result<T, E>` is not a union type, it is an interface with the methods described below,
which is implemented by `Ok<T>` and `Err<E>` classes.

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

### unwrapGen()

Returns a generator function that yields the value of `Err<E>` or returns the value of `Ok<T>`.

Method Signature:

```typescript
interface Result<T, E> {
  unwrapGen(): Generator<E, T, unknown>
}
```

Function Signature:

```typescript
const unwrapGen: <T, E>(result: Result<T, E>) => Generator<E, T, unknown>
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
