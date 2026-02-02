# resultage [![npm version](https://img.shields.io/npm/v/resultage.svg?style=flat-square)](https://www.npmjs.com/package/resultage) [![npm downloads](https://img.shields.io/npm/dm/resultage.svg?style=flat-square)](https://www.npmjs.com/package/resultage) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DScheglov/resultage/blob/master/LICENSE) [![codecov](https://codecov.io/github/DScheglov/resultage/graph/badge.svg?token=QBOQUV8WGF)](https://codecov.io/github/DScheglov/resultage)

A clear way for handling success and failure in both synchronous and asynchronous operations.

## Installation

```bash
npm install resultage
```

## Usage

### Creating a Result

```typescript
import { Result, ok, err } from 'resultage';

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

### Collecting `Ok` values from a Result Array

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
import { Do, collect, err, ok } from 'resultage';

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
is a union of `OkResult<T>` and `ErrResult<E>` types:
  
  ```typescript
  type Result<T, E> = OkResult<T> | ErrResult<E>;
  ```

Where:

- `OkResult<T>` is a type that represents success and wraps the value of type `T`.
- `ErrResult<E>` is a type that represents failure and wraps the error of type `E`.

### `OkResult<T>` Interface

`OkResult<T>` is an interface that maps to the success result with the following structure.

```typescript
interface OkResult<T> {
  readonly value: T;
  readonly isOk: true;
  readonly isErr: false;
  readonly isError: false;
  /* ... methods ... */
}
```

The property `value` is accessible only when the type of the corresponding variable
or parameter is narrowed from the `Result<T, E>` to the `OkResult<T>`.

To narrow the type of the variable or parameter to `OkResult<T>`, use the `isOk` method
on the `Result<T, E>` instance.

**Note**: `OkResult<T>` is an interface, not a class, so it is not possible to create
an instance of `OkResult<T>` directly. Use the `ok` function to create an instance of `OkResult<T>`.

### `ErrResult<E>` Interface

`ErrResult<E>` is an interface that maps to the failure result with the following structure.

```typescript
interface ErrResult<E> {
  readonly error: E;
  readonly isOk: false;
  readonly isErr: true;
  readonly isError: true;
  /* ... methods ... */
}
```

The property `error` is accessible only when the type of the corresponding variable
or parameter is narrowed from the `Result<T, E>` to the `ErrResult<E>`.

To narrow the type of the variable or parameter to `ErrResult<E>`, use either the `isErr`
or the `isError` method on the `Result<T, E>` instance.

**Note**: `ErrResult<E>` is an interface, not a class, so it is not possible to create
an instance of `ErrResult<E>` directly. Use the `err` function to create an instance of `ErrResult<E>`.

### `Result<T, E>` Methods

The following methods are common to both `OkResult<T>` and `ErrResult<E>`:

```typescript
interface Result<T, E> {
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
}
```

## Constructors

As mentioned above, `OkResult<T>` and `ErrResult<E>` are interfaces, not classes, so it is not
possible to create an instance of `OkResult<T>` or `ErrResult<E>` directly. Use the following
functions to create an instance of `OkResult<T>` or `ErrResult<E>`.

### Function ok(value)

Creates an instance of `OkImpl<T>` class (that is not exported from the package).

Function Signature:

```typescript
const ok: <T>(value: T) => OkResult<T>
```

Example:

```typescript
import { ok } from 'resultage';

const okNumber = ok(42);
```

### Function err(error)

Creates an instance of `ErrImpl<E>` class (that is not exported from the package).

Function Signature:

```typescript
const err: <E>(error: E) => ErrResult<E>
```

Example:

```typescript
import { err } from 'resultage';

const errString = err('Error message');
```

## Properties And Methods of `Result<T, E>`

### Property .isOk: boolean

Returns `true` if Result is `OkResult<T>`, `false` otherwise. Narrows the `Result<T, E>` to `OkResult<T>` in "if"-branches,
and to `ErrResult<E>` in "else"-branches.

Property Definition:

```typescript
interface OkResult<T> { readonly isOk: true }
interface ErrResult<E> { readonly isOk: false } 
```

Function Signature:

```typescript
const isOk: <T, E>(result: Result<T, E>) => result is OkResult<T>
```

Example:

```typescript
import { ok } from 'resultage';

const result = ok(42);

if (result.isOk) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

Example with function:

```typescript
import { ok, isOk } from 'resultage';

const result = ok(42);

if (isOk(result)) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

The function `isOk(result)` is suitable for use as a callback in
`Array.prototype.filter` or similar methods.

```typescript
import { isOk } from 'resultage';

const results = [ok(42), err('Error')];

const isEverythingOk = results.every(isOk);
```

### Property .isErr: boolean

Returns `true` if Result is `ErrResult<E>`, `false` otherwise. Narrows the `Result<T, E>` to `ErrResult<E>` in "if"-branches,
and to `OkResult<T>` in "else"-branches.

Property Definition:

```typescript
interface OkResult<T> { readonly isErr: false }
interface ErrResult<E> { readonly isErr: true } 
```

Function Signature:

```typescript
const isErr: <T, E>(result: Result<T, E>) => result is ErrResult<E>
```

Example:

```typescript
import { err } from 'resultage';

const result = err('Error message');

if (result.isErr) {
  console.error(result.error);
} else {
  console.log(result.value);
}
```

### Property .isError: boolean

Returns `true` if Result is `ErrResult<E>`, `false` otherwise. Narrows the `Result<T, E>` to `ErrResult<E>` in "if"-branches,
and to `OkResult<T>` in "else"-branches.

Property Definition:

```typescript
interface OkResult<T> { readonly isError: false }
interface ErrResult<E> { readonly isError: true }
```

Function Signature:

```typescript
const  isError: <T, E>(result: Result<T, E>): result is ErrResult<E>
```

Example:

```typescript
import { err } from 'resultage';

const result = err('Error message');

if (result.isError) {
  console.error(result.error);
} else {
  console.log(result.value);
}
```

Example with function:

```typescript
import { err, isError } from 'resultage';

const result = err('Error message');

if (isError(result)) {
  console.error(result.error);
} else {
  console.log(result.value);
}
```

The function `isError(result)` is suitable for use as a callback in
`Array.prototype.filter` or similar methods.

```typescript
import { isError } from 'resultage';

const results = [ok(42), err('Error')];

const isSomethingWrong = results.some(isError);
```

### Ok Property .value: T

Returns the value of `OkResult<T>`. Could be accessed if and only if the `Result<T, S>`
is explicitly narrowed to `OkResult<T>`.

Property Definition:

```typescript
interface OkResult<T> { readonly value: T }
```

Example:

```typescript
import { ok } from 'resultage';

const result = ok(42);

console.log(result.value); // Prints to console: 42
```

Example with narrowing:

```typescript
import { ok, err } from 'resultage';

const okIfOdd = (value: number) =>
  value % 2 === 1
    ? ok(value)
    : err('Value is not odd');

const result = okIfOdd(43);

result.value;
//     ^^^^^ - Error: Property 'value' does not exist on type 'Result<number, string>'.

if (result.isOk) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

### Err Property .error: E

Returns the error of `ErrResult<E>`. Could be accessed if and only if the `Result<T, S>`
is explicitly narrowed to `ErrResult<E>`.

Property Definition:

```typescript
interface ErrResult<E> { readonly error: E }
```

Example:

```typescript
import { err } from 'resultage';

const result = err('Error message');

console.log(result.error); // Prints to console: Error message
```

Example with narrowing:

```typescript
import { ok, err } from 'resultage';

const okIfOdd = (value: number) =>
  value % 2 === 1
    ? ok(value)
    : err('Value is not odd');

const result = okIfOdd(42);

result.error;
//     ^^^^^ - Error: Property 'error' does not exist on type 'Result<number, string>'.

if (result.isError) {
  console.error(result.error);
} else {
  console.log(result.value);
}
```

### Method .map(fn)

Applies `fn` to the value of `OkResult<T>` and returns the value wrapped in `OkResult<S>`. If `Result<T, E>` is `ErrResult<E>` returns itself without applying `fn`.

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

Example:

```typescript
import { ok } from 'resultage';

const result = ok(42);

const mappedResult = result.map(value => value * 2);

console.log(mappedResult.value); // Prints to console: 84
```

### Method .mapErr(fn)

Applies `fn` to the value of `ErrResult<E>` and returns the value wrapped in `ErrResult<F>`. If `Result<T, E>` is `OkResult<T>` returns itself without applying `fn`.

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

Example:

```typescript
import { err } from 'resultage';

const result = err('Error message');

const mappedResult = result.mapErr(error => new Error(error));
```

### Method .chain(next)

Applies `next` to the value of `OkResult<T>` and returns the result of `next`. If the `Result<T, E>` is `ErrResult<E>`,
returns itself without applying `next`.

The next function must return a `Result<S, F>`.

Method Signature:

```typescript
interface Result<T, E> {
  chain<S, F>(next: (data: T) => Result<S, F>): Result<S, E | F>
}
```

Curried Function Signature:

```typescript
const chain:
  <T, S, F>(next: (data: T) => Result<S, F>) =>
  <E>(result: Result<T, E>) => Result<S, E | F>
```

Example:

```typescript
import { ok } from 'resultage';

const result = ok(42);

const chainedResult = result.chain(value => ok(value * 2));
```

The `chain` method is the primary method for composing `(...) => Result<T, E>` functions.

### Method .chainErr(next)

Applies `next` to the value of `ErrResult<E>` and returns the result of `next`.
If the `Result<T, E>` is `OkResult<T>`, returns itself without applying `next`.

The next function must return a `Result<S, F>`.

Method Signature:

```typescript
interface Result<T, E> {
  chainErr<S, F>(next: (error: E) => Result<S, F>): Result<T | S, F>
}
```

Curried Function Signature:

```typescript
const chainErr:
  <S, E, F>(next: (error: E) => Result<S, F>) =>
  <T>(result: Result<T, E>) => Result<T | S, F>
```

Example:

```typescript
import { err } from 'resultage';

const result = err('Error message');

const chainedResult = result.chainErr(error => err(new Error(error)));
```

`chainErr` is a convenient method for recovering from an error.

```typescript
import { err, ok } from 'resultage';

const okIfOdd = (value: number) =>
  value % 2 === 1
    ? ok(value)
    : err('Value is not odd');

const getOdd = (value: number): number =>
  okIfOdd(value)
    .chainErr(() => ok(value + 1))
    .unwrap();

console.log(getOdd(1)); // 1
```

### Method .unwrap()

Returns the value of `OkResult<T>`. If the `Result<T, E>` is `ErrResult<E>` throws an `Error`
where `cause` is the result.

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

Example:

```typescript
import { ok } from 'resultage';

const result = ok(42);

console.log(result.unwrap()); // Prints to console: 42
```

Example with error:

```typescript
import { err } from 'resultage';

const result = err('Error message');

console.log(result.unwrap()); 
// Throws an Error with the message: 'Result is not an Ok' and cause equal
// to the result.
```

### Method .unwrapOr(fallback)

Returns the value of `OkResult<T>`. If the `Result<T, E>` is `ErrResult<E>` returns `fallback`.

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

### Method .unwrapOrThrow()

Returns the value of `OkResult<T>`. If the `Result<T, E>` is `ErrResult<E>` throws a value of
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

### Method .unwrapOrElse

Returns the value of `OkResult<T>`. If the `Result<T, E>` is `ErrResult<E>` returns the result of `fallbackFn`.

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

### Method .unwrapErr

Returns the value of `ErrResult<E>`. If the `Result<T, E>` is `OkResult<T>` throws an `Error` where `cause` is the `OkResult<T>`.

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

### Method .unwrapErrOr(fallback)

Returns the value of `ErrResult<E>`. If the `Result<T, E>` is `OkResult<T>` returns `fallback`.

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

### Method .unwrapErrOrElse(fallbackFn)

Returns the value of `ErrResult<E>`. If the `Result<T, E>` is `OkResult<T>` returns the result of `fallback`.

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

### Method .unpack()

Returns the value of `OkResult<T>` or `ErrResult<E>`.

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

### Method .match(okMatcher, errMatcher)

Applies `okMatcher` to the value of `OkResult<T>` and returns the result. Applies `errMatcher` to the value of `ErrResult<E>` and returns the result.

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

### Method .tap(fn)

Applies `fn` to the value of `OkResult<T>` and returns the original result. If the `Result<T, E>` is `ErrResult<E>` doesn't apply `fn`.

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

### Method .tapErr(fn)

Applies `fn` to the value of `ErrResult<E>` and returns the original result. If the `Result<T, E>` is `OkResult<T>` doesn't apply `fn`.

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

### Method .biMap(okFn, errFn)

Maps both the success value and the error value. Applies `okFn` if the result is `OkResult<T>`,
or `errFn` if the result is `ErrResult<E>`.

Method Signature:

```typescript
interface Result<T, E> {
  biMap<S, F>(okFn: (data: T) => S, errFn: (error: E) => F): Result<S, F>
}
```

Curried Function Signature:

```typescript
const biMap:
  <S, F, T = never, E = never>(okFn: (data: T) => S, errFn: (error: E) => F) =>
  (result: Result<T, E>) => Result<S, F>
```

### Method .biChain(okFn, errFn)

Chains both the success value and the error value. Applies `okFn` if the result is `OkResult<T>`,
or `errFn` if the result is `ErrResult<E>`. Both functions must return a `Result`.

Method Signature:

```typescript
interface Result<T, E> {
  biChain<TS, TF, ES, EF>(
    okFn: (data: T) => Result<TS, TF>,
    errFn: (error: E) => Result<ES, EF>,
  ): Result<TS | ES, TF | EF>
}
```

Curried Function Signature:

```typescript
const biChain:
  <TS, TF, ES, EF, T = never, E = never>(
    okFn: (data: T) => Result<TS, TF>,
    errFn: (error: E) => Result<ES, EF>,
  ) =>
  (result: Result<T, E>) => Result<TS | ES, TF | EF>
```

### Method .asTuple()

Returns the result as a tuple `[ok, error, value]`.
If strict tuple checks are enabled, this allows narrowing based on the first element.

Method Signature:

```typescript
interface Result<T, E> {
  asTuple(): [ok: true, error: undefined, value: T] | [ok: false, error: E, value: undefined]
}
```

Function Signature:

```typescript
const asTuple: <T, E>(result: Result<T, E>) => [ok: true, error: undefined, value: T] | [ok: false, error: E, value: undefined]
```

## Operating on Multiple Results

### collect(results)

Collects `OkResult<T>` values from an array of `Result<T, E>` and returns a `Result<T[], E>`.

Function Signature:

```typescript
const collect:
  <R extends readonly Result<any, any>[]>(results: R) => Result<Collected<R>, ErrTypeOf<R[number]>>
```
