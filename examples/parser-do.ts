/* eslint-disable @typescript-eslint/no-unused-vars */
import { Result, ok, err, Do } from '@cardellini/ts-result';

type Person = {
  name: string;
  age: number;
};

type JsonObject = Record<string, unknown>;

const okIfObject = (value: unknown): Result<JsonObject, 'ERR_NOT_AN_OBJECT'> =>
  typeof value === 'object' && value !== null
    ? ok(value as JsonObject)
    : err('ERR_NOT_AN_OBJECT');

const okIfInt = (value: unknown): Result<number, 'ERR_NOT_AN_INT'> =>
  Number.isInteger(value) ? ok(value as number) : err('ERR_NOT_AN_INT');

const okIfPositive = (value: number): Result<number, 'ERR_NOT_POSITIVE'> =>
  value > 0 ? ok(value) : err('ERR_NOT_POSITIVE');

const okIfNotEmptyStr = (
  value: unknown,
): Result<string, 'ERR_NOT_A_STRING' | 'ERR_EMPTY_STRING'> =>
  typeof value !== 'string'
    ? err('ERR_NOT_A_STRING')
    : value.length === 0
      ? err('ERR_EMPTY_STRING')
      : ok(value);

type ValidationError<E extends string> = { path: string[]; code: E };

const validationError = <E extends string>(
  path: string[],
  code: E,
): ValidationError<E> => ({ path, code });

type PersonValidationError = ValidationError<
  | 'ERR_NOT_AN_OBJECT'
  | 'ERR_NOT_AN_INT'
  | 'ERR_NOT_POSITIVE'
  | 'ERR_NOT_A_STRING'
  | 'ERR_EMPTY_STRING'
>;

const okIfPerson = (value: unknown): Result<Person, PersonValidationError> =>
  Do(function* () {
    const object: JsonObject = yield* okIfObject(value).mapErr((error) =>
      validationError([], error),
    );

    const name = yield* okIfNotEmptyStr(object.name).mapErr((error) =>
      validationError(['name'], error),
    );

    const age = yield* okIfInt(object.age)
      .chain(okIfPositive)
      .mapErr((error) => validationError(['age'], error));

    return { name, age };
  });

console.log(okIfPerson({ name: 'John', age: 42 }));
// Ok { value: { name: 'John', age: 42 } }

console.log(okIfPerson({ name: 'John', age: -42 }));
// Err { error: { path: [ 'age' ], code: 'ERR_NOT_POSITIVE' } }

console.log(okIfPerson({ name: '', age: 42 }));
// Err { error: { path: [ 'name' ], code: 'ERR_EMPTY_STRING' } }

console.log(okIfPerson({ name: 42, age: 42 }));
// Err { error: { path: [ 'name' ], code: 'ERR_NOT_A_STRING' } }

console.log(okIfPerson({ name: 'John' }));
// Err { error: { path: [ 'age' ], code: 'ERR_NOT_AN_INT' } }

console.log(okIfPerson({ age: 42 }));
// Err { error: { path: [ 'name' ], code: 'ERR_NOT_A_STRING' } }

console.log(okIfPerson(''));
// Err { error: { path: [], code: 'ERR_NOT_AN_OBJECT' } }

console.log(okIfPerson(null));
// Err { error: { path: [], code: 'ERR_NOT_AN_OBJECT' } }

console.log(okIfPerson(undefined));
// Err { error: { path: [], code: 'ERR_NOT_AN_OBJECT' } }

const okIfPerson2 = (
  value: unknown,
  path: string[] = ['person'],
): Result<Person, PersonValidationError> =>
  Do(function* okIfPersonJob() {
    const obj: JsonObject = yield* okIfObject(value) //
      .mapErr((error) => validationError(path, error));

    const name = yield* okIfNotEmptyStr(obj.name) //
      .mapErr((error) => validationError([...path, 'name'], error));

    const age = yield* okIfInt(obj.age)
      .chain(okIfPositive)
      .mapErr((error) => validationError([...path, 'age'], error));

    return { name, age };
  });
