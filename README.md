# Result [![Coverage Status](https://coveralls.io/repos/github/DScheglov/ts-result/badge.svg?branch=main)](https://coveralls.io/github/DScheglov/ts-result?branch=main) [![npm version](https://img.shields.io/npm/v/@cardellini/ts-result.svg?style=flat-square)](https://www.npmjs.com/package/@cardellini/ts-result) [![npm downloads](https://img.shields.io/npm/dm/@cardellini/ts-result.svg?style=flat-square)](https://www.npmjs.com/package/@cardellini/ts-result) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DScheglov/ts-result/blob/master/LICENSE)

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
  typeof value === 'object' && value !== null
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

const okIfPerson = (value: unknown) =>
  Do(function*() {
    const obj = yield* okIfObject(value).unwrapGen();
    const name = yield* okIfString(obj.name).unwrapGen();
    const age = yield* okIfInt(obj.age).unwrapGen();

    return { name, age };
  });

const person: Person = okIfPerson({ name: 'John', age: 42 }).unwrap();
```

or the same but with using `unwrap` function passed as a parameter to `Do`:

```typescript
const okIfPerson = (value: unknown) =>
  Do(function*(unwrap) {
    const obj = yield* unwrap(okIfObject(value));
    const name = yield* unwrap(okIfString(obj.name));
    const age = yield* unwrap(okIfInt(obj.age));

    return { name, age };
  });
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
import { asyncDo, collect, err, ok } from '@cardellini/ts-result';

const getBookWithAuthors = (bookId: string) =>
  asyncDo(async function* (unwrap) {
    const book = yield* unwrap(fetchBook(bookId));
    const authors = yield* unwrap(fetchPersons(book.authorIds));

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

### Working with Async Results in a Promise Chain

```typescript
import { asyncDo, unwrapGen } from '@cardellini/ts-result';

const getBookWithAuthors = (bookId: string) =>
  asyncDo(async function* () {
    const book = yield* await fetchBook(bookId).then(unwrapGen);
    const authors = yield* await fetchPersons(book.authorIds).then(unwrapGen);

    return { ...book, authors };
  });
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

Signature:

```typescript
isOk(): this is Ok<T>
```

### isErr()

Returns `true` if Result is `Err<E>`, `false` otherwise. Narrows the `Result<T, E>` to `Err<E>`.

Signature:

```typescript
isErr(): this is Err<E>
```

### map(fn)

Applies `fn` to the value of `Ok<T>` and returns the value wrapped in `Ok<S>`. If `Result<T, E>` is `Err<E>` returns itself without applying `fn`.

Signature:

```typescript
map<S>(fn: (data: T) => S): Result<S, E>
```

### mapErr(fn)

Applies `fn` to the value of `Err<E>` and returns the value wrapped in `Err<F>`. If `Result<T, E>` is `Ok<T>` returns itself without applying `fn`.

Signature:

```typescript
mapErr<F>(fn: (error: E) => F): Result<T, F>
```

### chain(next)

Applies `next` to the value of `Ok<T>` and returns the result of `next`. If the `Result<T, E>` is `Err<E>`, returns itself without applying `next`.

Signature:

```typescript
chain<S, F>(next: (data: T) => Result<S, F>): Result<T | S, E | F>
```

### chainErr(next)

Applies `next` to the value of `Err<E>` and returns the result of `next`. If the `Result<T, E>` is `Ok<T>`, returns itself without applying `next`.

Signature:

```typescript
chainErr<S, F>(next: (error: E) => Result<S, F>): Result<T | S, E | F>
```

### unwrap()

Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` throws a `TypeError` where `cause` is the `Err<E>`.

Signature:

```typescript
unwrap(): T
```

### unwrapGen()

Returns a generator function that yields the value of `Err<E>` or returns the value of `Ok<T>`.

Signature:

```typescript
unwrapGen(): Generator<E, T, unknown>
```

### unwrapOr(fallback)

Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` returns `fallback`.

Signature:

```typescript
unwrapOr<S>(fallback: S): T | S
```

### unwrapOrThrow()

Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` throws a value of
type `E`.

`unwrapOrThrow` doesn't check if `E` is an instance of `Error` or not, so it is
possible to throw a non-error literal.

Signature:

```typescript
unwrapOrThrow(): T
```

### unwrapOrElse

Returns the value of `Ok<T>`. If the `Result<T, E>` is `Err<E>` returns the result of `fallbackFn`.

Signature:

```typescript
unwrapOrElse<S>(fallbackFn: (error: E) => S): T | S
```

### unwrapErr

Returns the value of `Err<E>`. If the `Result<T, E>` is `Ok<T>` throws a `TypeError` where `cause` is the `Ok<T>`.

Signature:

```typescript
unwrapErr(): E
```

### unwrapErrOr(fallback)

Returns the value of `Err<E>`. If the `Result<T, E>` is `Ok<T>` returns `fallback`.

Signature:

```typescript
unwrapErrOr<F>(fallback: F): E | F
```

### unwrapErrOrElse(fallbackFn)

Returns the value of `Err<E>`. If the `Result<T, E>` is `Ok<T>` returns the result of `fallback`.

Signature:

```typescript
unwrapErrOrElse<F>(fallbackFn: (data: T) => F): E | F
```

### unpack()

Returns the value of `Ok<T>` or `Err<E>`.

Signature:

```typescript
unpack(): T | E
```

### match(okMatcher, errMatcher)

Applies `okMatcher` to the value of `Ok<T>` and returns the result. Applies `errMatcher` to the value of `Err<E>` and returns the result.

Signature:

```typescript
match<S, F>(okMatcher: (data: T) => S, errMatcher: (error: E) => F): S | F
```

### tap(fn)

Applies `fn` to the value of `Ok<T>` and returns the original result. If the `Result<T, E>` is `Err<E>` doesn't apply `fn`.

Signature:

```typescript
tap(fn: (data: T) => void): Result<T, E>
```

### tapErr(fn)

Applies `fn` to the value of `Err<E>` and returns the original result. If the `Result<T, E>` is `Ok<T>` doesn't apply `fn`.

Signature:

```typescript
tapErr(fn: (error: E) => void): Result<T, E>
```

### apply(fnResult)

Applies the function wrapped in `Ok<(data: T) => S>` of argument `fnResult` to the value of `Ok<T>` and returns the result of the application wrapped into `Ok<S>`. If the `Result<T, E>` is `Err<E>` or `fnResult` is `Err<F>`, returns itself without applying the function.

Signature:

```typescript
apply<S, F>(fnResult: Result<(data: T) => S, F>): Result<S, E | F>
```
