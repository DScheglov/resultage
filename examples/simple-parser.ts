import { Result, ok, err, Do } from '@cardellini/ts-result';

type JsonObject = Record<string, unknown>;

const okIfObject = (value: unknown): Result<JsonObject, 'ERR_NOT_AN_OBJECT'> =>
  typeof value === 'object' && value !== null
    ? ok(value as JsonObject)
    : err('ERR_NOT_AN_OBJECT');

const okIfInt = (value: unknown): Result<number, 'ERR_NOT_AN_INT'> =>
  Number.isInteger(value) ? ok(value as number) : err('ERR_NOT_AN_INT');

const okIfString = (value: unknown): Result<string, 'ERR_NOT_A_STRING'> =>
  typeof value === 'string' ? ok(value) : err('ERR_NOT_A_STRING');

type Person = {
  name: string;
  age: number;
};

const okIfPerson = (
  value: unknown,
): Result<
  Person,
  'ERR_NOT_AN_OBJECT' | 'ERR_NOT_AN_INT' | 'ERR_NOT_A_STRING'
> =>
  Do(function* () {
    const obj = yield* okIfObject(value);
    const name = yield* okIfString(obj.name);
    const age = yield* okIfInt(obj.age);

    return { name, age };
  });

const person: Person = okIfPerson({ name: 'John', age: 42 }).unwrap();

console.log(person);
