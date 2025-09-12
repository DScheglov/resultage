import { describe, expect, it, jest } from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { rTry } from './try';
import { ok } from './Ok';
import { err } from './Err';
import { Result } from './types';

describe('rTry', () => {
  describe('with non-function values', () => {
    it('should return Ok for a string value', () => {
      const result = rTry('hello');
      expect(result).toEqual(ok('hello'));

      type Check = Expect<Equal<typeof result, Result<string, unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });

    it('should return Ok for a number value', () => {
      const result = rTry(42);
      expect(result).toEqual(ok(42));

      type Check = Expect<Equal<typeof result, Result<number, unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });

    it('should return Ok for null', () => {
      const result = rTry(null);
      expect(result).toEqual(ok(null));

      type Check = Expect<Equal<typeof result, Result<null, unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });

    it('should return Ok for undefined', () => {
      const result = rTry(undefined);
      expect(result).toEqual(ok(undefined));

      type Check = Expect<Equal<typeof result, Result<undefined, unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });

    it('should return Ok for an object', () => {
      const obj = { name: 'test', value: 42 };
      const result = rTry(obj);
      expect(result).toEqual(ok(obj));

      type Check = Expect<Equal<typeof result, Result<typeof obj, unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });

    it('should return Ok for an array', () => {
      const arr = [1, 2, 3];
      const result = rTry(arr);
      expect(result).toEqual(ok(arr));

      type Check = Expect<Equal<typeof result, Result<number[], unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });

    it('should return Ok for a boolean', () => {
      const result = rTry(true);
      expect(result).toEqual(ok(true));

      type Check = Expect<Equal<typeof result, Result<boolean, unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });
  });

  describe('with promises', () => {
    it('should handle a resolved promise', async () => {
      const promise = Promise.resolve('success');
      const result = await rTry(promise);
      expect(result).toEqual(ok('success'));

      type Check = Expect<Equal<typeof result, Result<string, unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });

    it('should handle a rejected promise', async () => {
      const promise = Promise.reject(new Error('failure'));
      const result = await rTry(promise);
      expect(result).toEqual(err(new Error('failure')));

      expect(result.isErr).toBe(true);
    });

    it('should handle a rejected promise with string error', async () => {
      const promise = Promise.reject('string error');
      const result = await rTry(promise);
      expect(result).toEqual(err('string error'));
    });

    it('should handle a rejected promise with null error', async () => {
      const promise = Promise.reject(null);
      const result = await rTry(promise);
      expect(result).toEqual(err(null));
    });

    it('should handle a rejected promise with undefined error', async () => {
      const promise = Promise.reject(undefined);
      const result = await rTry(promise);
      expect(result).toEqual(err(undefined));
    });

    it('should handle a resolved promise with complex data', async () => {
      const data = { users: [{ id: 1, name: 'John' }], total: 1 };
      const promise = Promise.resolve(data);
      const result = await rTry(promise);
      expect(result).toEqual(ok(data));
    });
  });

  describe('with synchronous functions without arguments', () => {
    it('should handle a function that returns a value', () => {
      const fn = () => 'hello world';
      const result = rTry(fn);
      expect(result).toEqual(ok('hello world'));

      type Check = Expect<Equal<typeof result, Result<string, unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });

    it('should handle a function that throws an error', () => {
      const fn = () => {
        throw new Error('something went wrong');
      };
      const result = rTry(fn);
      expect(result).toEqual(err(new Error('something went wrong')));

      expect(result.isErr).toBe(true);
    });

    it('should handle a function that throws a string', () => {
      const fn = () => {
        throw 'string error';
      };
      const result = rTry(fn);
      expect(result).toEqual(err('string error'));
    });

    it('should handle a function that throws null', () => {
      const fn = () => {
        throw null;
      };
      const result = rTry(fn);
      expect(result).toEqual(err(null));
    });

    it('should handle a function that throws undefined', () => {
      const fn = () => {
        throw undefined;
      };
      const result = rTry(fn);
      expect(result).toEqual(err(undefined));
    });

    it('should handle a function that throws an object', () => {
      const errorObj = { code: 'ERR_001', message: 'Custom error' };
      const fn = () => {
        throw errorObj;
      };
      const result = rTry(fn);
      expect(result).toEqual(err(errorObj));
    });

    it('should handle a function that returns undefined', () => {
      const fn = () => undefined;
      const result = rTry(fn);
      expect(result).toEqual(ok(undefined));
    });

    it('should handle a function that returns null', () => {
      const fn = () => null;
      const result = rTry(fn);
      expect(result).toEqual(ok(null));
    });

    it('should handle a function that returns false', () => {
      const fn = () => false;
      const result = rTry(fn);
      expect(result).toEqual(ok(false));
    });

    it('should handle a function that returns 0', () => {
      const fn = () => 0;
      const result = rTry(fn);
      expect(result).toEqual(ok(0));
    });

    it('should handle a function with complex return type', () => {
      const fn = () => ({
        id: 1,
        name: 'test',
        items: [1, 2, 3],
        metadata: { created: new Date(), valid: true },
      });
      const result = rTry(fn);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value.id).toBe(1);
        expect(result.value.name).toBe('test');
        expect(result.value.items).toEqual([1, 2, 3]);
        expect(result.value.metadata.valid).toBe(true);
      }
    });

    it('should handle a function that returns a function', () => {
      const fn = () => () => 'nested function';
      const result = rTry(fn);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(typeof result.value).toBe('function');
        expect(result.value()).toBe('nested function');
      }
    });

    it('should handle functions with no arguments that use this context', () => {
      const obj = {
        value: 42,
        getValue() {
          return this.value;
        },
      };
      const result = rTry(obj.getValue.bind(obj));
      expect(result).toEqual(ok(42));
    });

    it('should handle a function that causes stack overflow', () => {
      const infiniteRecursion = (): never => infiniteRecursion();
      const result = rTry(infiniteRecursion);

      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error).toBeInstanceOf(RangeError);
        expect((result.error as RangeError).message).toMatch(/stack|call/i);
      }
    });
  });

  describe('with asynchronous functions without arguments', () => {
    it('should handle a function that returns a resolved promise', async () => {
      const fn = () => Promise.resolve('async success');
      const result = await rTry(fn);
      expect(result).toEqual(ok('async success'));

      type Check = Expect<Equal<typeof result, Result<string, unknown>>>;
      const check: Check = true;
      expect(check).toBe(true);
    });

    it('should handle a function that returns a rejected promise', async () => {
      const fn = () => Promise.reject(new Error('async error'));
      const result = await rTry(fn);
      expect(result).toEqual(err(new Error('async error')));

      expect(result.isErr).toBe(true);
    });

    it('should handle a function that returns a promise with complex data', async () => {
      const data = {
        users: [
          { id: 1, name: 'Alice', roles: ['admin'] },
          { id: 2, name: 'Bob', roles: ['user'] },
        ],
        pagination: { page: 1, total: 2 },
      };
      const fn = () => Promise.resolve(data);
      const result = await rTry(fn);
      expect(result).toEqual(ok(data));
    });

    it('should handle a function that returns a promise rejected with string', async () => {
      const fn = () => Promise.reject('async string error');
      const result = await rTry(fn);
      expect(result).toEqual(err('async string error'));
    });

    it('should handle a function that returns a promise rejected with null', async () => {
      const fn = () => Promise.reject(null);
      const result = await rTry(fn);
      expect(result).toEqual(err(null));
    });

    it('should handle a function that returns a promise rejected with undefined', async () => {
      const fn = () => Promise.reject(undefined);
      const result = await rTry(fn);
      expect(result).toEqual(err(undefined));
    });

    it('should handle a function that returns a promise of a function', async () => {
      const fn = () => Promise.resolve(() => 'promised function');
      const result = await rTry(fn);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(typeof result.value).toBe('function');
        expect(result.value()).toBe('promised function');
      }
    });

    it('should handle an async function that throws synchronously', async () => {
      const fn = () => {
        throw new Error('sync error in async fn');
        return Promise.resolve('never reached');
      };
      const result = await rTry(fn);
      expect(result).toEqual(err(new Error('sync error in async fn')));
    });
  });

  describe('functions with arguments using generic overload (runtime behavior)', () => {
    // Note: These tests use type assertions because the TypeScript overloads
    // don't expose the generic signature, but the runtime implementation works

    it('should handle a function with arguments that returns a value', () => {
      const fn = (a: number, b: number) => a + b;
      const result = (rTry as any)(fn, 5, 3);
      expect(result).toEqual(ok(8));
      expect(result.isOk).toBe(true);
    });

    it('should handle a function with arguments that throws an error', () => {
      const fn = (msg: string) => {
        throw new Error(msg);
      };
      const result = (rTry as any)(fn, 'custom error message');
      expect(result).toEqual(err(new Error('custom error message')));
    });

    it('should handle a function with variable arguments', () => {
      const sum = (...numbers: number[]) => numbers.reduce((a, b) => a + b, 0);
      const result = (rTry as any)(sum, 1, 2, 3, 4, 5);
      expect(result).toEqual(ok(15));
    });

    it('should handle a function that modifies its arguments', () => {
      const arr = [1, 2, 3];
      const fn = (array: number[]) => {
        array.push(4);
        return array.length;
      };
      const result = (rTry as any)(fn, arr);
      expect(result).toEqual(ok(4));
      expect(arr).toEqual([1, 2, 3, 4]); // array was modified
    });

    it('should handle recursive functions', () => {
      const factorial = (n: number): number => {
        if (n <= 1) return 1;
        return n * factorial(n - 1);
      };
      const result = (rTry as any)(factorial, 5);
      expect(result).toEqual(ok(120));
    });

    it('should handle functions with union return types', () => {
      const unionFn = (flag: boolean): string | number => {
        return flag ? 'string' : 42;
      };

      const result1 = (rTry as any)(unionFn, true);
      const result2 = (rTry as any)(unionFn, false);

      expect(result1).toEqual(ok('string'));
      expect(result2).toEqual(ok(42));
    });

    it('should handle asynchronous functions with arguments that return resolved promises', async () => {
      const fn = (a: number, b: number) => Promise.resolve(a * b);
      const result = await (rTry as any)(fn, 4, 5);
      expect(result).toEqual(ok(20));
      expect(result.isOk).toBe(true);
    });

    it('should handle asynchronous functions with arguments that return rejected promises', async () => {
      const fn = (msg: string) => Promise.reject(new Error(msg));
      const result = await (rTry as any)(fn, 'async failure');
      expect(result).toEqual(err(new Error('async failure')));
    });
  });

  describe('edge cases and complex scenarios', () => {
    it('should handle nested try operations', () => {
      const innerFn = () => 'inner success';
      const outerFn = () => {
        const innerResult = rTry(innerFn);
        if (innerResult.isOk) {
          return `outer: ${innerResult.value}`;
        }
        throw new Error('inner failed');
      };
      const result = rTry(outerFn);
      expect(result).toEqual(ok('outer: inner success'));
    });

    it('should handle async nested try operations', async () => {
      const innerFn = () => Promise.resolve('inner async success');
      const outerFn = async () => {
        const innerResult = await rTry(innerFn);
        if (innerResult.isOk) {
          return `outer: ${innerResult.value}`;
        }
        throw new Error('inner failed');
      };
      const result = await rTry(outerFn);
      expect(result).toEqual(ok('outer: inner async success'));
    });

    it('should preserve the exact error thrown', () => {
      const customError = new TypeError('Type mismatch');
      customError.stack = 'custom stack trace';
      const fn = () => {
        throw customError;
      };
      const result = rTry(fn);
      expect(result.isErr).toBe(true);
      if (result.isErr) {
        expect(result.error).toBe(customError);
        // Type assertion since error is unknown
        expect((result.error as TypeError).message).toBe('Type mismatch');
        expect((result.error as TypeError).stack).toBe('custom stack trace');
      }
    });
  });

  describe('side effects and mocking', () => {
    it('should not call the function if an error is thrown during argument evaluation', () => {
      const mockFn = jest.fn(() => 'success');
      const throwingArg = () => {
        throw new Error('arg error');
      };

      expect(() => (rTry as any)(mockFn, throwingArg())).toThrow();
      expect(mockFn).not.toHaveBeenCalled();
    });

    it('should call the function exactly once', () => {
      const mockFn = jest.fn(() => 'success');
      const result = rTry(mockFn);

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result).toEqual(ok('success'));
    });

    it('should call the function with correct arguments', () => {
      const mockFn = jest.fn((a: string, b: number) => `${a}-${b}`);
      const result = (rTry as any)(mockFn, 'test', 123);

      expect(mockFn).toHaveBeenCalledWith('test', 123);
      expect(result).toEqual(ok('test-123'));
    });

    it('should handle functions with side effects that succeed', () => {
      let sideEffect = 0;
      const fn = () => {
        sideEffect = 42;
        return 'success';
      };
      const result = rTry(fn);

      expect(result).toEqual(ok('success'));
      expect(sideEffect).toBe(42);
    });

    it('should handle functions with side effects that throw', () => {
      let sideEffect = 0;
      const fn = () => {
        sideEffect = 42;
        throw new Error('after side effect');
      };
      const result = rTry(fn);

      expect(result).toEqual(err(new Error('after side effect')));
      expect(sideEffect).toBe(42); // side effect should still have occurred
    });
  });

  describe('performance and stress scenarios', () => {
    it('should handle a function that returns a large object', () => {
      const fn = () => {
        const largeObj: Record<string, number> = {};
        for (let i = 0; i < 1000; i++) {
          largeObj[`key${i}`] = i;
        }
        return largeObj;
      };
      const result = rTry(fn);

      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(Object.keys(result.value)).toHaveLength(1000);
        expect(result.value.key999).toBe(999);
      }
    });
  });

  describe('type safety and inference', () => {
    it('should infer correct types for simple functions', () => {
      const stringFn = () => 'hello';
      const numberFn = () => 42;
      const booleanFn = () => true;

      const stringResult = rTry(stringFn);
      const numberResult = rTry(numberFn);
      const booleanResult = rTry(booleanFn);

      type StringCheck = Expect<
        Equal<typeof stringResult, Result<string, unknown>>
      >;
      type NumberCheck = Expect<
        Equal<typeof numberResult, Result<number, unknown>>
      >;
      type BooleanCheck = Expect<
        Equal<typeof booleanResult, Result<boolean, unknown>>
      >;

      const stringCheck: StringCheck = true;
      const numberCheck: NumberCheck = true;
      const booleanCheck: BooleanCheck = true;

      expect(stringCheck && numberCheck && booleanCheck).toBe(true);
    });

    it('should infer correct types for async functions', async () => {
      const asyncStringFn = () => Promise.resolve('hello');
      const asyncNumberFn = () => Promise.resolve(42);

      const stringResult = rTry(asyncStringFn);
      const numberResult = rTry(asyncNumberFn);

      type StringCheck = Expect<
        Equal<typeof stringResult, Promise<Result<string, unknown>>>
      >;
      type NumberCheck = Expect<
        Equal<typeof numberResult, Promise<Result<number, unknown>>>
      >;

      const stringCheck: StringCheck = true;
      const numberCheck: NumberCheck = true;

      expect(stringCheck && numberCheck).toBe(true);

      const resolvedString = await stringResult;
      const resolvedNumber = await numberResult;

      expect(resolvedString).toEqual(ok('hello'));
      expect(resolvedNumber).toEqual(ok(42));
    });

    it('should handle values passed directly', () => {
      expect(rTry('string')).toEqual(ok('string'));
      expect(rTry(123)).toEqual(ok(123));
      expect(rTry(true)).toEqual(ok(true));
      expect(rTry(null)).toEqual(ok(null));
      expect(rTry(undefined)).toEqual(ok(undefined));
      expect(rTry({ a: 1 })).toEqual(ok({ a: 1 }));
      expect(rTry([1, 2, 3])).toEqual(ok([1, 2, 3]));
    });
  });

  describe('error behavior coverage', () => {
    it('should handle various error types thrown by functions', () => {
      const errorTypes = [
        () => {
          throw new Error('Error');
        },
        () => {
          throw new TypeError('TypeError');
        },
        () => {
          throw new RangeError('RangeError');
        },
        () => {
          throw new SyntaxError('SyntaxError');
        },
        () => {
          throw 'string error';
        },
        () => {
          throw 42;
        },
        () => {
          throw { custom: 'error' };
        },
        () => {
          throw null;
        },
        () => {
          throw undefined;
        },
        () => {
          throw false;
        },
      ];

      errorTypes.forEach((fn) => {
        const result = rTry(fn);
        expect(result.isErr).toBe(true);
        // We can't easily check the exact error content due to type constraints
        // but we can verify that an error was caught
      });
    });

    it('should handle promise rejections with various error types', async () => {
      const errorPromises = [
        Promise.reject(new Error('Error')),
        Promise.reject('string error'),
        Promise.reject(42),
        Promise.reject({ custom: 'error' }),
        Promise.reject(null),
        Promise.reject(undefined),
        Promise.reject(false),
      ];

      for (const promise of errorPromises) {
        const result = await rTry(promise);
        expect(result.isErr).toBe(true);
      }
    });

    it('should handle functions that return complex nested structures', () => {
      const fn = () => ({
        data: {
          users: [
            { id: 1, profile: { name: 'Alice', settings: { theme: 'dark' } } },
            { id: 2, profile: { name: 'Bob', settings: { theme: 'light' } } },
          ],
          meta: {
            total: 2,
            pagination: { page: 1, limit: 10 },
          },
        },
        status: 'success',
      });

      const result = rTry(fn);
      expect(result.isOk).toBe(true);
      if (result.isOk) {
        expect(result.value.data.users).toHaveLength(2);
        expect(result.value.data.users[0].profile.name).toBe('Alice');
        expect(result.value.status).toBe('success');
      }
    });

    it('should work correctly with class methods', () => {
      class Calculator {
        constructor(private value: number) {}

        add(n: number) {
          return this.value + n;
        }

        divide(n: number) {
          if (n === 0) throw new Error('Division by zero');
          return this.value / n;
        }
      }

      const calc = new Calculator(10);

      const addResult = (rTry as any)(calc.add.bind(calc), 5);
      expect(addResult).toEqual(ok(15));

      const divideResult = (rTry as any)(calc.divide.bind(calc), 0);
      expect(divideResult.isErr).toBe(true);

      const divideSuccessResult = (rTry as any)(calc.divide.bind(calc), 2);
      expect(divideSuccessResult).toEqual(ok(5));
    });
  });
});
