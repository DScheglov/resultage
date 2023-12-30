import { Result, ok, err, Do } from '@cardellini/ts-result';
import { Debug, Equal, Expect } from '@type-challenges/utils';

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
  Number.isInteger(value)
    ? ok(value as number)
    : err('ERR_NOT_AN_INT');

const okIfPositive = (value: number): Result<number, 'ERR_NOT_POSITIVE'> =>
  value > 0 ? ok(value) : err('ERR_NOT_POSITIVE');

const okIfNotEmptyStr = (value: unknown): Result<
  string,
  'ERR_NOT_A_STRING' | 'ERR_EMPTY_STRING'
> =>
  typeof value !== 'string' ? err('ERR_NOT_A_STRING') :
  value.length === 0 ? err('ERR_EMPTY_STRING') :
  ok(value);

const okIfPerson = (value: unknown): Result<Person, 'ERR_NOT_A_PERSON'> => {
  const objectValidation = okIfObject(value);

  if (objectValidation.isErr()) {
    return err('ERR_NOT_A_PERSON');
  }

  const object = objectValidation.unwrap();

  const nameValidation = okIfNotEmptyStr(object.name);

  if (nameValidation.isErr()) {
    return err('ERR_NOT_A_PERSON');
  }

  const ageValidation1 = okIfInt(object.age);

  if (ageValidation1.isErr()) {
    return err('ERR_NOT_A_PERSON');
  }

  const ageValidation2 = okIfPositive(ageValidation1.unwrap());

  if (ageValidation2.isErr()) {
    return err('ERR_NOT_A_PERSON');
  }

  return ok({
    name: nameValidation.unwrap(),
    age: ageValidation2.unwrap(),
  });
}

const okIfPerson2 =
  (value: unknown) => okIfObject(value).chain(
  (object) => okIfNotEmptyStr(object.name).chain(
  (name) => okIfInt(object.age).chain(
  (someInt) => okIfPositive(someInt).map(
  (age) => ({ name, age })
)))).mapErr(() => 'ERR_NOT_A_PERSON' as const);

const okIfPerson3 =
  (value: unknown) => okIfObject(value).chain(
  (object) => okIfNotEmptyStr(object.name).chain(
  (name) => okIfInt(object.age).chain(okIfPositive).map(
  (age) => ({ name, age })
))).mapErr(() => 'ERR_NOT_A_PERSON' as const)

const okIfPerson4 = (value: unknown): Result<Person, 'ERR_NOT_A_PERSON'> =>
  okIfObject(value)
    .chain(({ name, age }) => okIfNotEmptyStr(name).map(
      (validName) => ({ name: validName, age })
    ))
    .chain(({ name, age }) => okIfInt(age).chain(okIfPositive).map(
      (validAge) => ({ name, age: validAge })
    ))
    .mapErr(() => 'ERR_NOT_A_PERSON');

const check: Expect<Equal<typeof okIfPerson, typeof okIfPerson2>> = true;
const check2: Expect<Equal<typeof okIfPerson, typeof okIfPerson3>> = true;
const check3: Expect<Equal<typeof okIfPerson, typeof okIfPerson4>> = true;

const readField = <F extends string>(
  field: F
) => <R extends {}>(object: R): Result<unknown, 'ERR_MISSING_FIELD'> =>
  (field in object)
    ? ok((object as any)[field])
    : err('ERR_MISSING_FIELD');

const writeField = 
  <R extends {}, F extends string>(object: R, field: F) =>
  <T>(value: T): R & Record<F, T> => ({ 
    ...object,
    [field]: value
  } as R & Record<F, T>);

const validateField = <F extends string, T, E>(
  field: F,
  validator: (value: unknown) => Result<T, E>
) => <R extends {}>(object: R) =>
  ok(object)
    .chain(readField(field))
    .chain(validator)
    .map(writeField(object, field));

const okIfPerson5 = (value: unknown): Result<Person, 'ERR_NOT_A_PERSON'> =>
  okIfObject(value)
    .chain(validateField('name', okIfNotEmptyStr))
    .chain(validateField('age', value => okIfInt(value).chain(okIfPositive)))
    .mapErr(() => 'ERR_NOT_A_PERSON' as const);

const check4: Expect<Equal<typeof okIfPerson, typeof okIfPerson5>> = true;

console.log(okIfPerson({ name: 'John', age: 42 }))
// Ok { value: { name: 'John', age: 42 } }

console.log(okIfPerson({ name: 'John', age: -42 }))
// Err { error: 'ERR_NOT_A_PERSON' }


