import {
  describe, it, expect, jest,
} from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import {
  collectErrFromObject, collectFromObject, reduceObject, reduceObjectErr,
} from './objects';
import { ok } from './Ok';
import { err } from './Err';
import { Result } from './types';

describe('objects', () => {
  describe('reduceObject', () => {
    const mockReducer = (acc: number, result: number) => acc + result;

    it('returns initial value for an empty object', () => {
      const result = reduceObject({}, mockReducer, 0);
      expect(result.unwrap()).toBe(0);
    });

    it('correctly reduces an object with all Ok results', () => {
      const input = {
        a: ok(1),
        b: ok(2),
        c: ok(3),
      };
      const result = reduceObject(input, mockReducer, 0);

      const check: Expect<Equal<typeof result, Result<number, never>>> = true;
      expect(check).toBe(true);

      expect(result.unwrap()).toBe(6);
    });

    it('returns Err result if any result is an Err', () => {
      const input = {
        a: ok(1),
        b: err('Error' as const),
        c: ok(3),
      };
      const result = reduceObject(input, mockReducer, 0);
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr()).toBe('Error' as const);

      const check: Expect<Equal<typeof result, Result<number, 'Error'>>> = true;
      expect(check).toBe(true);
    });

    it('infers the correct type for the result', () => {
      const input = {
        a: ok(1) as Result<number, 'Error'>,
        b: ok(2) as Result<number, 'Error'>,
        c: ok(3) as Result<number, 'Error'>,
      };
      const result = reduceObject(input, mockReducer, 0);
      const check: Expect<Equal<typeof result, Result<number, 'Error'>>> = true;
      expect(check).toBe(true);
    });

    it('does\'t call reducer after the first Err result', () => {
      const input = {
        a: ok(1),
        b: err('Error' as const),
        c: ok(3),
      };
      const mockReducerSpy = jest.fn(mockReducer);
      reduceObject(input, mockReducerSpy, 0);
      expect(mockReducerSpy).toHaveBeenCalledTimes(1);
    });
  });
  describe('reduceObjectErr', () => {
    const mockReducer = <
      A extends string,
      E extends string,
    >(acc: A, error: E): `${A}${E}` => `${acc}${error}`;

    it('returns initial value as error for an empty object', () => {
      const result = reduceObjectErr({}, mockReducer, '');
      expect(result.unwrapErr()).toBe('');
    });

    it('correctly reduces an object with all Err results', () => {
      const input = {
        a: err('Error1' as const),
        b: err('Error2' as const),
        c: err('Error3' as const),
      };
      const result = reduceObjectErr(input, mockReducer, '');
      expect(result.unwrapErr()).toBe('Error1Error2Error3');
    });

    it('returns Ok result if any result is Ok', () => {
      const input = {
        a: err('Error' as const),
        b: ok(2),
        c: err('Error' as const),
      };
      const result = reduceObjectErr(input, mockReducer, '');
      expect(result.isOk).toBe(true);
      expect(result.unwrap()).toBe(2);
    });

    it('does not call reducer after the first Ok result', () => {
      const input = {
        a: err('Error'),
        b: ok(2),
        c: err('Error'),
      };
      const mockReducerSpy = jest.fn(mockReducer);
      reduceObjectErr(input, mockReducerSpy, '');
      expect(mockReducerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('collectFromObject', () => {
    it('collects all Ok values from the object', () => {
      const input = {
        a: ok(1),
        b: ok('two'),
        c: ok(true),
      };
      const result = collectFromObject(input);
      expect(result.isOk).toBe(true);
      expect(result.unwrap()).toEqual({ a: 1, b: 'two', c: true });
    });

    it('returns Err if any value is an Err', () => {
      const input = {
        a: ok(1),
        b: err('Error'),
        c: ok(true),
      };
      const result = collectFromObject(input);
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr()).toBe('Error');
    });

    it('returns an empty object for an empty input object', () => {
      const result = collectFromObject({});
      expect(result.unwrap()).toEqual({});
    });

    it('infers the correct type for the result', () => {
      const input = {
        a: ok(1) as Result<number, 'Error'>,
        b: ok('two') as Result<string, 'Error'>,
        c: ok(true) as Result<boolean, 'Error'>,
      };
      const result = collectFromObject(input);
      const check: Expect<Equal<
        typeof result,
        Result<{ a: number; b: string; c: boolean; }, 'Error'>
      >> = true;
      expect(check).toBe(true);
    });
  });

  describe('collectErrFromObject', () => {
    it('returns an empty object for an empty input object', () => {
      const result = collectErrFromObject({});
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr()).toEqual({});
    });

    it('returns err object with all Err values from the object', () => {
      const input = {
        a: err('Error1'),
        b: err('Error2'),
        c: err('Error3'),
      };
      const result = collectErrFromObject(input);
      expect(result.isErr).toBe(true);
      expect(result.unwrapErr()).toEqual({
        a: 'Error1',
        b: 'Error2',
        c: 'Error3',
      });
    });
  });
});
