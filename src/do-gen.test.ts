import { describe, it, expect } from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { Result, err, ok } from './base';
import { Do } from './do-gen';

describe('resultDo', () => {
  describe('case sqrt', () => {
    const sqrt = (x: number): Result<number, 'ERR_NEGATIVE_NUMBER'> =>
      (x < 0 ? err('ERR_NEGATIVE_NUMBER') : ok(Math.sqrt(x)));

    type LeErrCode =
      | 'ERR_NO_ROOTS'
      | 'ERR_INFINITE_ROOTS';

    type QeErrCode =
      | LeErrCode
      | 'ERR_NO_REAL_ROOTS';

    const ler = (a: number, b: number): Result<number, LeErrCode> => (
      a === 0 && b === 0 ? err('ERR_INFINITE_ROOTS') :
      a === 0 ? err('ERR_NO_ROOTS') :
      ok(-b / a)
    );

    const qer = (a: number, b: number, c: number) =>
      Do(function* qerJob(_) {
        if (a === 0) return ler(b, c).map((x) => [x] as [number]);

        const d = yield* _(sqrt(b * b - 4 * a * c)
          .mapErr(() => 'ERR_NO_REAL_ROOTS' as const));

        const a2 = 2 * a;

        return [(-b + d) / a2, (-b - d) / a2] as [number, number];
      });

    it('allows to avoid explicit typing', () => {
      const check: Expect<Equal<
        typeof qer,
        (a: number, b: number, c: number) => Result<[number] | [number, number], QeErrCode>
      >> = true;

      expect(check).toBe(true);
    });

    it('returns Ok([1, -1]) for qer(1, 0, -1)', () => {
      expect(qer(1, 0, -1)).toEqual(ok([1, -1]));
    });

    it('returns Ok([1]) for qer(0, -1, 1)', () => {
      expect(qer(0, -1, 1)).toEqual(ok([1]));
    });

    it('returns Err("ERR_NO_REAL_ROOTS") for qer(1, 0, 1)', () => {
      expect(qer(1, 0, 1)).toEqual(err('ERR_NO_REAL_ROOTS'));
    });

    it('returns Err("ERR_NO_ROOTS") for qer(0, 0, 1)', () => {
      expect(qer(0, 0, 1)).toEqual(err('ERR_NO_ROOTS'));
    });

    it('returns Err("ERR_INFINITE_ROOTS") for qer(0, 0, 0)', () => {
      expect(qer(0, 0, 0)).toEqual(err('ERR_INFINITE_ROOTS'));
    });
  });

  describe('case parse person', () => {
    type Person = {
      name: string;
      age: number;
    };

    type JsonObject = Record<string, unknown>;

    const okIfObject = (value: unknown): Result<JsonObject, 'ERR_NOT_AN_OBJECT'> =>
      (typeof value === 'object' && value !== null
        ? ok(value as JsonObject)
        : err('ERR_NOT_AN_OBJECT'));

    const okIfInt = (value: unknown): Result<number, 'ERR_NOT_AN_INT'> =>
      (Number.isInteger(value)
        ? ok(value as number)
        : err('ERR_NOT_AN_INT'));

    const okIfPositive = (value: number): Result<number, 'ERR_NOT_POSITIVE'> =>
      (value > 0 ? ok(value) : err('ERR_NOT_POSITIVE'));

    const okIfNotEmptyStr = (value: unknown): Result<
      string,
      'ERR_NOT_A_STRING' | 'ERR_EMPTY_STRING'
    > =>
      (typeof value !== 'string' ? err('ERR_NOT_A_STRING') :
      value.length === 0 ? err('ERR_EMPTY_STRING') :
      ok(value));

    type ValidationError<E extends string> = { path: string[]; code: E; };

    const validationError = <E extends string>(
      path: string[], code: E,
    ): ValidationError<E> => ({ path, code });

    type PersonValidationError = ValidationError<
      | 'ERR_NOT_AN_OBJECT'
      | 'ERR_NOT_AN_INT'
      | 'ERR_NOT_POSITIVE'
      | 'ERR_NOT_A_STRING'
      | 'ERR_EMPTY_STRING'
    >;

    const okIfPerson = (value: unknown): Result<Person, PersonValidationError> =>
      Do(function* (_) { // eslint-disable-line func-names
        const object = yield* _(okIfObject(value)
          .mapErr((error) => validationError([], error)));

        const name = yield* _(okIfNotEmptyStr(object.name)
          .mapErr((error) => validationError(['name'], error)));

        const age = yield* _(okIfInt(object.age)
          .chain(okIfPositive)
          .mapErr((error) => validationError(['age'], error)));

        return { name, age };
      });

    const okIfPerson2 = (value: unknown): Result<Person, 'ERR_NOT_A_PERSON'> =>
      Do(function* okIfPersonJob(unwrap) {
        const obj = yield* unwrap(okIfObject(value));
        const name = yield* unwrap(okIfNotEmptyStr(obj.name));
        const someInt = yield* unwrap(okIfInt(obj.age));
        const age = yield* unwrap(okIfPositive(someInt));

        return { name, age };
      }).mapErr(() => 'ERR_NOT_A_PERSON');

    const okIfPerson3 = (value: unknown): Result<Person, PersonValidationError> =>
      Do(function* () { // eslint-disable-line func-names
        const object = yield* okIfObject(value)
          .mapErr((error) => validationError([], error))
          .unwrapGen();

        const name = yield* okIfNotEmptyStr(object.name)
          .mapErr((error) => validationError(['name'], error))
          .unwrapGen();

        const age = yield* okIfInt(object.age)
          .chain(okIfPositive)
          .mapErr((error) => validationError(['age'], error))
          .unwrapGen();

        return { name, age };
      });

    it.each([
      [{ name: 'John', age: 42 }, ok({ name: 'John', age: 42 })],
      [{ name: 'John', age: -42 }, err({ path: ['age'], code: 'ERR_NOT_POSITIVE' })],
      [{ name: '', age: 42 }, err({ path: ['name'], code: 'ERR_EMPTY_STRING' })],
      [{ name: 42, age: 42 }, err({ path: ['name'], code: 'ERR_NOT_A_STRING' })],
      [{ name: 'John' }, err({ path: ['age'], code: 'ERR_NOT_AN_INT' })],
      [{ age: 42 }, err({ path: ['name'], code: 'ERR_NOT_A_STRING' })],
      ['', err({ path: [], code: 'ERR_NOT_AN_OBJECT' })],
    ])('returns %p for (%p)', (value, expected) => {
      expect(okIfPerson(value)).toEqual(expected);
    });

    it.each([
      [{ name: 'John', age: 42 }, ok({ name: 'John', age: 42 })],
      [{ name: 'John', age: -42 }, err({ path: ['age'], code: 'ERR_NOT_POSITIVE' })],
      [{ name: '', age: 42 }, err({ path: ['name'], code: 'ERR_EMPTY_STRING' })],
      [{ name: 42, age: 42 }, err({ path: ['name'], code: 'ERR_NOT_A_STRING' })],
      [{ name: 'John' }, err({ path: ['age'], code: 'ERR_NOT_AN_INT' })],
      [{ age: 42 }, err({ path: ['name'], code: 'ERR_NOT_A_STRING' })],
      ['', err({ path: [], code: 'ERR_NOT_AN_OBJECT' })],
    ])('v3 returns %p for (%p)', (value, expected) => {
      expect(okIfPerson3(value)).toEqual(expected);
    });
  });
});
