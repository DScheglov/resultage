import {
  describe, it, expect, jest,
} from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { pipe } from './fn/pipe';
import { identity } from './fn/identity';
import { compose2 } from './fn/compose';
import { Err, Ok, Result } from './types';
import * as R from './sync-methods';
import * as okIf from './conditional';
import * as Guards from './guards';
import { ok } from './Ok';
import { err } from './Err';

describe('Result', () => {
  describe('isResult', () => {
    it('should return true for an Ok result', () => {
      expect(Guards.isResult(ok('foo'))).toBe(true);
    });

    it('should return true for an Err result', () => {
      expect(Guards.isResult(err('foo'))).toBe(true);
    });

    it('should narrow type in if statement', () => {
      expect.assertions(1); // ensure that both if and else branches are executed
      const result: string | Result<string, 'foo'> = err('foo');

      if (Guards.isResult(result)) {
        type Check = Expect<Equal<typeof result, Result<string, 'foo'>>>;
        const check: Check = true;
        expect(check).toBe(true);
      }
    });

    it('should return false for a string', () => {
      expect(Guards.isResult('foo')).toBe(false);
    });

    it('should narrow type for non-result value', () => {
      expect.assertions(1); // ensure that both if and else branches are executed
      const result: string | Result<string, 'foo'> = 'foo';

      if (!Guards.isResult(result)) {
        type Check = Expect<Equal<typeof result, string>>;
        const check: Check = true;
        expect(check).toBe(true);
      }
    });
  });

  describe('isOk', () => {
    it('should return true for an Ok result', () => {
      expect(Guards.isOk(ok('foo'))).toBe(true);
    });

    it('should return false for an Err result', () => {
      expect(Guards.isOk(err('foo'))).toBe(false);
    });

    it('should narrow type in if statement', () => {
      expect.assertions(2); // ensure that both if and else branches are executed
      const result: Result<'foo', string> = ok('foo');

      type FirstCheck = Expect<Equal<typeof result, Result<'foo', string>>>;
      const check1: FirstCheck = true;
      expect(check1).toBe(true);

      if (Guards.isOk(result)) {
        type Check = Expect<Equal<typeof result, Ok<'foo'>>>;
        const check: Check = true;
        expect(check).toBe(true);
      }
    });

    it('(as method) should narrow type in if statement', () => {
      expect.assertions(2); // ensure that both if and else branches are executed
      const result: Result<'foo', string> = ok('foo');

      type FirstCheck = Expect<Equal<typeof result, Result<'foo', string>>>;
      const check1: FirstCheck = true;
      expect(check1).toBe(true);

      if (result.isOk()) {
        type Check = Expect<Equal<typeof result, Ok<'foo'>>>;
        const check: Check = true;
        expect(check).toBe(true);
      }
    });
  });

  describe('isErr', () => {
    it('should return true for an Err result', () => {
      expect(Guards.isErr(err('foo'))).toBe(true);
    });

    it('should return false for an Ok result', () => {
      expect(Guards.isErr(ok('foo'))).toBe(false);
    });

    it('should narrow type in if statement', () => {
      expect.assertions(2); // ensure that both if and else branches are executed
      const result: Result<string, 'foo'> = err('foo');

      type FirstCheck = Expect<Equal<typeof result, Result<string, 'foo'>>>;

      const check1: FirstCheck = true;
      expect(check1).toBe(true);

      if (Guards.isErr(result)) {
        type Check = Expect<Equal<typeof result, Err<'foo'>>>;
        const check: Check = true;
        expect(check).toBe(true);
      }
    });

    it('(as method) should narrow type in if statement', () => {
      expect.assertions(2); // ensure that both if and else branches are executed
      const result: Result<string, 'foo'> = err('foo');

      type FirstCheck = Expect<Equal<typeof result, Result<string, 'foo'>>>;

      const check1: FirstCheck = true;
      expect(check1).toBe(true);

      if (result.isErr()) {
        type Check = Expect<Equal<typeof result, Err<'foo'>>>;
        const check: Check = true;
        expect(check).toBe(true);
      }
    });
  });

  describe('map', () => {
    it('should map an Ok result', () => {
      expect(
        pipe(
          'foo',
          ok,
          R.map((s: string) => s.length),
        ),
      ).toEqual(ok(3));
    });

    it('should not map an Err result', () => {
      expect(
        pipe(
          'foo',
          err,
          R.map((s: string) => s.length),
        ),
      ).toEqual(err('foo'));
    });

    it('should return the same Ok result for identity', () => {
      expect(
        pipe(
          'foo',
          ok,
          R.map(identity),
        ),
      ).toEqual(ok('foo'));
    });

    it('should return the same Err result for identity', () => {
      expect(
        pipe(
          'foo',
          err,
          R.map(identity),
        ),
      ).toEqual(err('foo'));
    });

    it('should map Ok twice with the same result as single map with composed functions', () => {
      const len = (s: string) => s.length;
      const mul = (n: number) => (m: number) => n * m;
      expect(
        pipe(
          'foo',
          ok,
          R.map(len),
          R.map(mul(2)),
        ),
      ).toEqual(
        pipe(
          'foo',
          ok,
          R.map(compose2(mul(2), len)),
        ),
      );
    });

    it('should map Err twice with the same result as single map with composed functions', () => {
      const len = (s: string) => s.length;
      const mul = (n: number) => (m: number) => n * m;
      expect(
        pipe(
          'foo',
          err,
          R.map(len),
          R.map(mul(2)),
        ),
      ).toEqual(
        pipe(
          'foo',
          err,
          R.map(compose2(mul(2), len)),
        ),
      );
    });
  });

  describe('mapErr', () => {
    it('should not map an Ok result', () => {
      expect(
        pipe(
          'foo',
          ok,
          R.mapErr((s: string) => s.length),
        ),
      ).toEqual(ok('foo'));
    });

    it('should map an Err result', () => {
      expect(R.mapErr((s: string) => s.length)(err('foo'))).toEqual(err(3));
    });

    it('should return the same Ok result for identity', () => {
      expect(
        pipe(
          'foo',
          ok,
          R.mapErr(identity),
        ),
      ).toEqual(ok('foo'));
    });

    it('should return the same Err result for identity', () => {
      expect(
        pipe(
          'foo',
          err,
          R.mapErr(identity),
        ),
      ).toEqual(err('foo'));
    });

    it('should map Err twice with the same result as single map with composed functions', () => {
      const len = (s: string) => s.length;
      const mul = (n: number) => (m: number) => n * m;
      expect(
        pipe(
          'foo',
          err,
          R.mapErr(len),
          R.mapErr(mul(2)),
        ),
      ).toEqual(
        pipe(
          'foo',
          err,
          R.mapErr(compose2(mul(2), len)),
        ),
      );
    });

    it('should map Ok twice with the same result as single map with composed functions', () => {
      const len = (s: string) => s.length;
      const mul = (n: number) => (m: number) => n * m;
      expect(
        pipe(
          'foo',
          ok,
          R.mapErr(len),
          R.mapErr(mul(2)),
        ),
      ).toEqual(
        pipe(
          'foo',
          ok,
          R.mapErr(compose2(mul(2), len)),
        ),
      );
    });
  });

  describe('chain', () => {
    it('should chain an Ok result', () => {
      expect(
        pipe(
          'foo',
          ok,
          R.chain((s: string) => ok(s.length)),
        ),
      ).toEqual(ok(3));
    });

    it('should not chain an Err result', () => {
      expect(
        pipe(
          'foo',
          err,
          R.chain((s: string) => ok(s.length)),
        ),
      ).toEqual(err('foo'));
    });

    it('should chain Ok with okOk', () => {
      expect(
        pipe(
          'foo',
          ok,
          R.chain(ok),
        ),
      ).toEqual(ok('foo'));
    });

    it('should chain Err with okOk', () => {
      expect(
        pipe(
          'foo',
          err,
          R.chain(ok),
        ),
      ).toEqual(err('foo'));
    });

    it('should chain Ok with f and g with the same result as chain Ok with result f chained with g', () => {
      const len = (s: string) => ok(s.length);
      const mul = (n: number) => (m: number) => ok(n * m);
      expect(
        pipe(
          'foo',
          ok,
          R.chain(len),
          R.chain(mul(2)),
        ),
      ).toEqual(
        pipe(
          'foo',
          ok,
          R.chain(
            (value) => pipe(value, len, R.chain(mul(2))),
          ),
        ),
      );
    });
  });

  describe('chainErr', () => {
    it('should not chain an Ok result', () => {
      expect(
        pipe(
          'foo',
          ok,
          R.chainErr((s: string) => err(s.length)),
        ),
      ).toEqual(ok('foo'));
    });

    it('should chain an Err result', () => {
      expect(
        pipe(
          'foo',
          err,
          R.chainErr((s: string) => err(s.length)),
        ),
      ).toEqual(err(3));
    });

    it('should chain Ok with err', () => {
      expect(
        pipe(
          'foo',
          ok,
          R.chainErr(err),
        ),
      ).toEqual(ok('foo'));
    });

    it('should chain Err with err', () => {
      expect(
        pipe(
          'foo',
          err,
          R.chainErr(err),
        ),
      ).toEqual(err('foo'));
    });

    it('should chain Err with f and g with the same result as chain Err with result f chained with g', () => {
      const len = (s: string) => err(s.length);
      const mul = (n: number) => (m: number) => err(n * m);
      expect(
        pipe(
          'foo',
          err,
          R.chainErr(len),
          R.chainErr(mul(2)),
        ),
      ).toEqual(
        pipe(
          'foo',
          err,
          R.chainErr(
            (value) => pipe(value, len, R.chainErr(mul(2))),
          ),
        ),
      );
    });
  });

  describe('unwrap', () => {
    it('unpacks an Ok result', () => {
      expect(
        pipe('foo', ok, R.unwrap),
      ).toBe('foo');
    });

    it('throw a TypeError with cause equals error in attempt to unpack an Err result', () => {
      expect(
        () => pipe('foo', err, R.unwrap),
      ).toThrowError(new TypeError('Cannot unpack an Err result', { cause: 'foo' }));
    });
  });

  describe('unwrapOr', () => {
    it('should unpack an Ok result', () => {
      expect(
        pipe('foo', ok, R.unwrapOr('bar')),
      ).toBe('foo');
    });

    it('should return the fallback for an Err result', () => {
      expect(
        pipe('foo', err, R.unwrapOr('bar')),
      ).toBe('bar');
    });
  });

  describe('unwrapOrThrow', () => {
    it('should unpack an Ok result', () => {
      expect(
        pipe('foo', ok, R.unwrapOrThrow),
      ).toBe('foo');
    });

    it('throw an error with cause equals error in attempt to unpack an Err result', () => {
      expect(
        () => pipe('foo', err, R.unwrapOrThrow),
      ).toThrowError('foo');
    });

    it('throw an error with cause equals error in attempt to unpack an Err result', () => {
      expect.assertions(1);
      try {
        pipe('foo', err, R.unwrapOrThrow);
      } catch (err) {
        expect(err).toBe('foo');
      }
    });
  });

  describe('unwrapOrElse', () => {
    it('should unpack an Ok result', () => {
      expect(
        pipe('foo', ok, R.unwrapOrElse(() => 'bar')),
      ).toBe('foo');
    });

    it('should return the fallback for an Err result', () => {
      expect(
        pipe('foo', err, R.unwrapOrElse(() => 'bar')),
      ).toBe('bar');
    });
  });

  describe('unwrapErr', () => {
    it('unpacks an Err result', () => {
      expect(
        pipe('foo', err, R.unwrapErr),
      ).toBe('foo');
    });

    it('throw a TypeError with cause equals data in attempt to unpack an Ok result', () => {
      expect(
        () => pipe('foo', ok, R.unwrapErr),
      ).toThrowError(new TypeError('Cannot unpack an Ok result', { cause: 'foo' }));
    });
  });

  describe('unwrapErrOr', () => {
    it('should unpack an Err result', () => {
      expect(
        pipe('foo', err, R.unwrapErrOr('bar')),
      ).toBe('foo');
    });

    it('should return the fallback for an Ok result', () => {
      expect(
        pipe('foo', ok, R.unwrapErrOr('bar')),
      ).toBe('bar');
    });
  });

  describe('unwrapErrOrElse', () => {
    it('should unpack an Err result', () => {
      expect(
        pipe('foo', err, R.unwrapErrOrElse(() => 'bar')),
      ).toBe('foo');
    });

    it('should return the fallback for an Ok result', () => {
      expect(
        pipe('foo', ok, R.unwrapErrOrElse(() => 'bar')),
      ).toBe('bar');
    });
  });

  describe('unpack', () => {
    it('should unpack an Ok result', () => {
      expect(
        pipe('foo', ok, R.unpack),
      ).toBe('foo');
    });

    it('should unpack an Err result', () => {
      expect(
        pipe('foo', err, R.unpack),
      ).toBe('foo');
    });
  });

  describe('tap', () => {
    it('should tap an Ok result', () => {
      const fn = jest.fn();
      expect(
        pipe('foo', ok, R.tap(fn)),
      ).toEqual(ok('foo'));
      expect(fn).toBeCalledWith('foo');
    });

    it('should not tap an Err result', () => {
      const fn = jest.fn();
      expect(
        pipe('foo', err, R.tap(fn)),
      ).toEqual(err('foo'));
      expect(fn).not.toBeCalled();
    });
  });

  describe('tapErr', () => {
    it('should not tap an Ok result', () => {
      const fn = jest.fn();
      expect(
        pipe('foo', ok, R.tapErr(fn)),
      ).toEqual(ok('foo'));
      expect(fn).not.toBeCalled();
    });

    it('should tap an Err result', () => {
      const fn = jest.fn();
      expect(
        pipe('foo', err, R.tapErr(fn)),
      ).toEqual(err('foo'));
      expect(fn).toBeCalledWith('foo');
    });
  });

  describe('match', () => {
    const effect = (value: number): Result<number, 'INVALID_VALUE'> => (
      value > 0 ? ok(value) : err('INVALID_VALUE' as const)
    );

    it('allows to match an Ok result', () => {
      expect(
        pipe(
          42,
          effect,
          R.match(
            (value) => value * 2,
            (error) => error,
          ),
        ),
      ).toBe(84);
    });

    it('allows to match an Err result', () => {
      expect(
        pipe(
          -42,
          effect,
          R.match(
            (value) => value * 2,
            (error) => error,
          ),
        ),
      ).toBe('INVALID_VALUE');
    });

    it('allows to throw error for an Err result', () => {
      expect(() =>
        pipe(
          -42,
          effect,
          R.match(
            (value) => value * 2,
            (error) => {
              throw new Error(error);
            },
          ),
        )).toThrowError(new Error('INVALID_VALUE'));
    });
  });

  describe('expectExists', () => {
    it.each([
      1, {}, [], true, false, 0, '',
    ])('should return Ok result for %j', (value) => {
      expect(
        pipe(
          value,
          okIf.expectExists(() => 'NOT_EXISTS' as const),
        ),
      ).toEqual(ok(value));
    });

    it.each([null, undefined])('should an Err result for %s', (value) => {
      expect(
        pipe(
          value,
          okIf.expectExists(() => 'NOT_EXISTS' as const),
        ),
      ).toEqual(err('NOT_EXISTS'));
    });

    it('produces a correct type', () => {
      const result = pipe(
        1 as const,
        okIf.expectExists(() => 'NOT_EXISTS' as const),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      type Check = Expect<Equal<typeof result, Result<1, 'NOT_EXISTS'>>>;
      expect(result).toEqual(ok(1));
    });
  });

  describe('okIfExists', () => {
    it.each([
      1, {}, [], true, false, 0, '',
    ])('should return Ok result for %j', (value) => {
      expect(
        okIf.okIfExists(value, () => 'NOT_EXISTS' as const),
      ).toEqual(ok(value));
    });

    it.each([null, undefined])('should an Err result for %s', (value) => {
      expect(
        okIf.okIfExists(value, () => 'NOT_EXISTS' as const),
      ).toEqual(err('NOT_EXISTS'));
    });
  });

  describe('okIf', () => {
    const isNotLargerThen = (max: number) => (n: number): boolean => n <= max;
    const ERR_BIG_NUMBER = 'ERR_BIG_NUMBER' as const;
    const isNotSmallerThen = (min: number) => (n: number): boolean => n >= min;
    const ERR_SMALL_NUMBER = 'ERR_SMALL_NUMBER' as const;

    const numError =
      (code: typeof ERR_BIG_NUMBER | typeof ERR_SMALL_NUMBER) =>
        (value: number) => ({
          code,
          value,
        });

    const ensureRange = (min: number, max: number) => (value: number) => pipe(
      ok(value),
      R.chain(
        okIf.expect(isNotLargerThen(max), numError(ERR_BIG_NUMBER)),
      ),
      R.chain(
        okIf.expect(isNotSmallerThen(min), numError(ERR_SMALL_NUMBER)),
      ),
    );

    it('should filter an Ok result', () => {
      expect(
        pipe(
          100,
          ensureRange(0, 1000),
        ),
      ).toEqual(ok(100));
    });

    it('should filter an Err result ERR_BIG_NUMBER', () => {
      expect(
        pipe(
          1001,
          ensureRange(0, 1000),
        ),
      ).toEqual(err(numError(ERR_BIG_NUMBER)(1001)));
    });

    it('should filter an Err result ERR_SMALL_NUMBER', () => {
      expect(
        pipe(
          -1,
          ensureRange(0, 1000),
        ),
      ).toEqual(err(numError(ERR_SMALL_NUMBER)(-1)));
    });

    const isHello = (value: string): value is 'hello' => value === 'hello';

    it('should narrow type', () => {
      const result = pipe(
        'hello',
        okIf.expect(isHello, 'ERR_NOT_HELLO' as const),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      type Check = Expect<Equal<typeof result, Result<'hello', 'ERR_NOT_HELLO'>>>;
      expect(result).toEqual(ok('hello'));
    });

    it('should return Err if type narrowing failed', () => {
      const result = pipe(
        'world',
        okIf.expect(isHello, 'ERR_NOT_HELLO' as const),
      );

      const check: Expect<
        Equal<typeof result, Result<'hello', 'ERR_NOT_HELLO'>>
      > = true;

      expect(check).toBe(true);
      expect(result).toEqual(err('ERR_NOT_HELLO'));
    });
  });

  describe('apply', () => {
    it('should apply an Ok result', () => {
      expect(
        pipe(
          'foo',
          ok,
          R.apply(ok((s: string) => s.length)),
        ),
      ).toEqual(ok(3));
    });

    it('should not apply an Err result', () => {
      expect(
        pipe(
          'foo',
          err,
          R.apply(ok((s: string) => s.length)),
        ),
      ).toEqual(err('foo'));
    });

    it('should apply Ok with f and g with the same result as apply Ok with result f applied to result g', () => {
      const len = (s: string) => s.length;
      const mul = (n: number) => (m: number) => n * m;
      /*
      v.apply(
        u.apply(
          a.map(
            f => g => x => f(g(x))
          )
        )
      ) is equivalent to v.apply(u).apply(a)
      */

      const v = ok('foo');
      const u = ok(len);
      const a = ok(mul(2));

      expect(
        pipe(
          v,
          R.apply(u),
          R.apply(a),
        ),
      ).toEqual(
        v.apply(
          u.apply(
            a.map(
              (f) => (g) => (x) => f(g(x)),
            ),
          ),
        ),
      );
    });
  });
});
