/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  describe, it, expect, jest,
} from '@jest/globals';
import type { Equal, Expect } from '@type-challenges/utils';
import { pipe } from './fn/pipe';
import { identity } from './fn/identity';
import { compose } from './fn/compose';
import * as M from './async-methods';
import * as R from './sync-methods';
import { ok, asyncOk } from './Ok';
import { err, asyncErr } from './Err';
import type { AsyncResult } from './types';

const resolved = <T>(value: T): Promise<T> => Promise.resolve(value);

describe('AsyncResult', () => {
  describe('asyncOk', () => {
    it('should return an AsyncOk', async () => {
      const value = await asyncOk(1);
      expect(value).toEqual(ok(1));
    });

    it('should return an AsyncOk for a promise', async () => {
      const value = await asyncOk(Promise.resolve(1));
      expect(value).toEqual(ok(1));
    });
  });

  describe('asyncErr', () => {
    it('should return an AsyncErr', async () => {
      const value = await asyncErr(1);
      expect(value).toEqual(err(1));
    });

    it('should return an AsyncErr for a promise', async () => {
      const value = await asyncErr(Promise.resolve(1));
      expect(value).toEqual(err(1));
    });
  });

  describe('map', () => {
    it('should map an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenMap((x: number) => x + 1),
    )).resolves.toEqual(ok(2)));

    it('should map an AsyncErr', async () =>
      expect(pipe(
        1,
        asyncErr,
        M.thenMap((x: number) => x + 1),
      )).resolves.toEqual(err(1)));

    it('should map an AsyncOk to the same AsyncOk with identity', () => expect(pipe(
      1,
      asyncOk,
      M.thenMap(identity),
    )).resolves.toEqual(ok(1)));

    it('should map twice with the same result as mapping once with composition', async () => {
      const f = (x: number) => x + 1;
      const g = (x: number) => x * 2;
      const value1 = await pipe(
        1,
        asyncOk,
        M.thenMap(f),
        M.thenMap(g),
      );

      const value2 = await pipe(
        1,
        asyncOk,
        M.thenMap(compose(g, f)),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(ok(4));
    });
  });

  describe('mapErr', () => {
    it('should not map an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenMapErr((x: number) => x + 1),
    )).resolves.toEqual(ok(1)));

    it('should map an AsyncErr', async () =>
      expect(pipe(
        1,
        asyncErr,
        M.thenMapErr((x: number) => x + 1),
      )).resolves.toEqual(err(2)));

    it('should map an AsyncErr to the same AsyncErr with identity', () => expect(pipe(
      1,
      asyncErr,
      M.thenMapErr(identity),
    )).resolves.toEqual(err(1)));

    it('should map twice with the same result as mapping once with composition', async () => {
      const f = (x: number) => x + 1;
      const g = (x: number) => x * 2;

      const value1 = await pipe(
        1,
        asyncErr,
        M.thenMapErr(f),
        M.thenMapErr(g),
      );

      const value2 = await pipe(
        1,
        asyncErr,
        M.thenMapErr(compose(g, f)),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(err(4));
    });
  });

  describe('flip', () => {
    it('should flip an Ok<Promise<T>> to Promise<Ok<T>>', async () => expect(pipe(
      ok(resolved(1)),
      M.flip,
    )).resolves.toEqual(ok(1)));

    it('should flip an Ok<T> to Promise<Ok<T>>', async () => expect(pipe(
      ok(1),
      M.flip,
    )).resolves.toEqual(ok(1)));

    it('should flip an Err<Promise<E>> to Promise<Err<E>>', async () => expect(pipe(
      err(resolved(1)),
      M.flip,
    )).resolves.toEqual(err(1)));

    it('should flip an Err<E> to Promise<Err<E>>', async () => expect(pipe(
      err(1),
      M.flip,
    )).resolves.toEqual(err(1)));
  });

  describe('chain', () => {
    it('should chain an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenChain((x: number) => ok(x + 1)),
    )).resolves.toEqual(ok(2)));

    it('should not chain an AsyncErr', async () =>
      expect(pipe(
        1,
        asyncErr,
        M.thenChain((x: number) => ok(x + 1)),
      )).resolves.toEqual(err(1)));

    it('should chain an AsyncOk to the same AsyncOk with asyncOK', () => expect(pipe(
      1,
      asyncOk,
      M.thenChain(asyncOk),
    )).resolves.toEqual(ok(1)));

    it('should chain twice with the same result as chaining with chained result (sync)', async () => {
      const f = (x: number) => ok(x + 1);
      const g = (x: number) => ok(x * 2);

      const value1 = await pipe(
        1,
        asyncOk,
        M.thenChain(f),
        M.thenChain(g),
      );

      const value2 = await pipe(
        1,
        asyncOk,
        M.thenChain(
          (result) => pipe(
            result,
            f,
            M.from,
            M.thenChain(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(ok(4));
    });

    it('should chain twice with the same result as chaining with sync chained result (sync)', async () => {
      const f = (x: number) => ok(x + 1);
      const g = (x: number) => ok(x * 2);

      const value1 = await pipe(
        1,
        asyncOk,
        M.thenChain(f),
        M.thenChain(g),
      );

      const value2 = await pipe(
        1,
        asyncOk,
        M.thenChain(
          (result) => pipe(
            result,
            f,
            R.chain(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(ok(4));
    });

    it('should chain twice with the same result as chaining with chained result (async)', async () => {
      const f = (x: number) => asyncOk(x + 1);
      const g = (x: number) => asyncOk(x * 2);

      const value1 = await pipe(
        1,
        asyncOk,
        M.thenChain(f),
        M.thenChain(g),
      );

      const value2 = await pipe(
        1,
        asyncOk,
        M.thenChain(
          (result) => pipe(
            result,
            f,
            M.thenChain(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(ok(4));
    });

    it('should chain twice with the same result as chaining with chained result (async, sync)', async () => {
      const f = (x: number) => asyncOk(x + 1);
      const g = (x: number) => ok(x * 2);

      const value1 = await pipe(
        1,
        asyncOk,
        M.thenChain(f),
        M.thenChain(g),
      );

      const value2 = await pipe(
        1,
        asyncOk,
        M.thenChain(
          (result) => pipe(
            result,
            f,
            M.thenChain(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(ok(4));
    });

    it('should chain twice with the same result as chaining with chained result (sync, async)', async () => {
      const f = (x: number) => ok(x + 1);
      const g = (x: number) => asyncOk(x * 2);

      const value1 = await pipe(
        1,
        asyncOk,
        M.thenChain(f),
        M.thenChain(g),
      );

      const value2 = await pipe(
        1,
        asyncOk,
        M.thenChain(
          (result) => pipe(
            result,
            f,
            M.from,
            M.thenChain(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(ok(4));
    });

    it('should chain ok to err (sync)', async () => {
      const fn = (x: number) => (x > 0 ? ok(x) : err('INVALID_VALUE' as const));
      const value1 = await pipe(
        1,
        asyncOk,
        M.thenChain(fn),
      );
      const value2 = await pipe(
        -1,
        asyncOk,
        M.thenChain(fn),
      );
      expect(value1).toEqual(ok(1));
      expect(value2).toEqual(err('INVALID_VALUE'));
    });

    it('should chain ok to err (async)', async () => {
      const fn = (x: number): AsyncResult<number, 'INVALID_VALUE'> => (
        x > 0
          ? asyncOk(x)
          : asyncErr('INVALID_VALUE' as const)
      );

      const value1 = await pipe(
        1,
        asyncOk,
        M.thenChain(fn),
      );
      const value2 = await pipe(
        -1,
        asyncOk,
        M.thenChain(fn),
      );
      expect(value1).toEqual(ok(1));
      expect(value2).toEqual(err('INVALID_VALUE'));
    });
  });

  describe('chainErr', () => {
    it('should not chain an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenChainErr((x: number) => err(x + 1)),
    )).resolves.toEqual(ok(1)));

    it('should chain an AsyncErr', async () =>
      expect(pipe(
        1,
        asyncErr,
        M.thenChainErr((x: number) => err(x + 1)),
      )).resolves.toEqual(err(2)));

    it('should chain an AsyncErr to the same AsyncErr with asyncErr', () => expect(pipe(
      1,
      asyncErr,
      M.thenChainErr(asyncErr),
    )).resolves.toEqual(err(1)));

    it('should chain twice with the same result as chaining with chained result (sync)', async () => {
      const f = (x: number) => err(x + 1);
      const g = (x: number) => err(x * 2);

      const value1 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(f),
        M.thenChainErr(g),
      );

      const value2 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(
          (result) => pipe(
            result,
            f,
            M.from,
            M.thenChainErr(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(err(4));
    });

    it('should chain twice with the same result as chaining with sync chained result (sync)', async () => {
      const f = (x: number) => err(x + 1);
      const g = (x: number) => err(x * 2);

      const value1 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(f),
        M.thenChainErr(g),
      );

      const value2 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(
          (result) => pipe(
            result,
            f,
            R.chainErr(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(err(4));
    });

    it('should chain twice with the same result as chaining with chained result (async)', async () => {
      const f = (x: number) => asyncErr(x + 1);
      const g = (x: number) => asyncErr(x * 2);

      const value1 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(f),
        M.thenChainErr(g),
      );

      const value2 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(
          (result) => pipe(
            result,
            f,
            M.thenChainErr(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(err(4));
    });

    it('should chain twice with the same result as chaining with chained result (async, sync)', async () => {
      const f = (x: number) => asyncErr(x + 1);
      const g = (x: number) => err(x * 2);

      const value1 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(f),
        M.thenChainErr(g),
      );

      const value2 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(
          (result) => pipe(
            result,
            f,
            M.thenChainErr(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(err(4));
    });

    it('should chain twice with the same result as chaining with chained result (sync, async)', async () => {
      const f = (x: number) => err(x + 1);
      const g = (x: number) => asyncErr(x * 2);

      const value1 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(f),
        M.thenChainErr(g),
      );

      const value2 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(
          (result) => pipe(
            result,
            f,
            M.from,
            M.thenChainErr(g),
          ),
        ),
      );

      expect(value1).toEqual(value2);
      expect(value1).toEqual(err(4));
    });

    it('should chain err to ok (sync)', async () => {
      const fn = (x: number) => (x > 0 ? ok(x) : err('INVALID_VALUE' as const));
      const value1 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(fn),
      );
      const value2 = await pipe(
        -1,
        asyncErr,
        M.thenChainErr(fn),
      );
      expect(value1).toEqual(ok(1));
      expect(value2).toEqual(err('INVALID_VALUE'));
    });

    it('should chain err to ok (async)', async () => {
      const fn = (x: number) => (x > 0 ? asyncOk(x) : asyncErr('INVALID_VALUE' as const));
      const value1 = await pipe(
        1,
        asyncErr,
        M.thenChainErr(fn),
      );
      const value2 = await pipe(
        -1,
        asyncErr,
        M.thenChainErr(fn),
      );
      expect(value1).toEqual(ok(1));
      expect(value2).toEqual(err('INVALID_VALUE'));
    });
  });

  describe('match', () => {
    const fn = (x: number): AsyncResult<number, 'INVALID_VALUE'> => (
      x > 0 ? asyncOk(x) : asyncErr('INVALID_VALUE' as const)
    );

    it('should match an AsyncOk', async () => {
      const value = await pipe(
        fn(42),
        M.thenMatch(
          (data) => data,
          (error) => error,
        ),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      type Check = Expect<Equal<typeof value, 'INVALID_VALUE' | number>>;
      expect(value).toBe(42);
    });

    it('should match an AsyncErr', async () => {
      const value = await pipe(
        fn(-42),
        M.thenMatch(
          (data) => data,
          (error) => error,
        ),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      type Check = Expect<Equal<typeof value, 'INVALID_VALUE' | number>>;
      expect(value).toBe('INVALID_VALUE');
    });
  });

  describe('unpack', () => {
    const fn = (x: number): AsyncResult<number, 'INVALID_VALUE'> => (
      x > 0 ? asyncOk(x) : asyncErr('INVALID_VALUE' as const)
    );

    it('should unpack an AsyncOk', async () => {
      const value = await M.thenUnpack(fn(42));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      type Check = Expect<Equal<typeof value, 'INVALID_VALUE' | number>>;
      expect(value).toBe(42);
    });

    it('should unpack an AsyncErr', async () => {
      const value = await M.thenUnpack(fn(-42));

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      type Check = Expect<Equal<typeof value, 'INVALID_VALUE' | number>>;
      expect(value).toBe('INVALID_VALUE');
    });
  });

  describe('unwrap', () => {
    it('should unpack an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenUnwrap,
    )).resolves.toBe(1));

    it('should unpack an AsyncErr', async () => expect(pipe(
      1,
      asyncErr,
      M.thenUnwrap,
    )).rejects.toEqual(new TypeError('Cannot unpack an Err result', { cause: 1 })));
  });

  describe('unwrapOr', () => {
    it('should unpack an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenUnwrapOr('bar'),
    )).resolves.toBe(1));

    it('should return the fallback for an AsyncErr', async () => expect(pipe(
      1,
      asyncErr,
      M.thenUnwrapOr('bar'),
    )).resolves.toBe('bar'));
  });

  describe('unwrapOrElse', () => {
    it('should unpack an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenUnwrapOrElse(() => 'bar'),
    )).resolves.toBe(1));

    it('should return the fallback for an AsyncErr', async () => expect(pipe(
      1,
      asyncErr,
      M.thenUnwrapOrElse(() => 'bar'),
    )).resolves.toBe('bar'));
  });

  describe('unwrapOrReject', () => {
    it('should unpack an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenUnwrapOrReject,
    )).resolves.toBe(1));

    it('should unpack an AsyncErr', async () => expect(pipe(
      1,
      asyncErr,
      M.thenUnwrapOrReject,
    )).rejects.toBe(1));
  });

  describe('unwrapErr', () => {
    it('should unpack an AsyncErr', async () => expect(pipe(
      1,
      asyncErr,
      M.thenUnwrapErr,
    )).resolves.toBe(1));

    it('should unpack an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenUnwrapErr,
    )).rejects.toEqual(new TypeError('Cannot unpack an Ok result', { cause: 1 })));
  });

  describe('unwrapErrOr', () => {
    it('should unpack an AsyncErr', async () => expect(pipe(
      1,
      asyncErr,
      M.thenUnwrapErrOr('bar'),
    )).resolves.toBe(1));

    it('should return the fallback for an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenUnwrapErrOr('bar'),
    )).resolves.toBe('bar'));
  });

  describe('unwrapErrOrElse', () => {
    it('should unpack an AsyncErr', async () => expect(pipe(
      1,
      asyncErr,
      M.thenUnwrapErrOrElse(() => 'bar'),
    )).resolves.toBe(1));

    it('should return the fallback for an AsyncOk', async () => expect(pipe(
      1,
      asyncOk,
      M.thenUnwrapErrOrElse(() => 'bar'),
    )).resolves.toBe('bar'));
  });

  describe('tap', () => {
    it('should tap an AsyncOk', async () => {
      const fn = jest.fn();
      await pipe(
        1,
        asyncOk,
        M.thenTap(fn),
      );
      expect(fn).toHaveBeenCalledWith(1);
    });

    it('should not tap an AsyncErr', async () => {
      const fn = jest.fn();
      await pipe(
        1,
        asyncErr,
        M.thenTap(fn),
      );
      expect(fn).not.toHaveBeenCalled();
    });
  });

  describe('tapErr', () => {
    it('should not tap an AsyncOk', async () => {
      const fn = jest.fn();
      await pipe(
        1,
        asyncOk,
        M.thenTapErr(fn),
      );
      expect(fn).not.toHaveBeenCalled();
    });

    it('should tap an AsyncErr', async () => {
      const fn = jest.fn();
      await pipe(
        1,
        asyncErr,
        M.thenTapErr(fn),
      );
      expect(fn).toHaveBeenCalledWith(1);
    });
  });

  describe('tapAndWait', () => {
    const deferred = <T>() => {
      let resolve: (value: T | PromiseLike<T>) => void;
      let reject: (reason?: any) => void;
      const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve: resolve!, reject: reject! };
    };

    const delay = (ms = 0) => new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

    it('should tap an AsyncOk', async () => {
      expect.assertions(3);
      const { promise, resolve } = deferred<void>();
      const fn = jest.fn<() => Promise<void>>().mockReturnValueOnce(promise);
      const inc = jest.fn((x: number) => x + 1);
      const asyncRes = pipe(
        1,
        asyncOk,
        M.thenTapAndWait(fn),
        M.thenMap(inc),
      );
      await delay();
      expect(fn).toHaveBeenCalledWith(1);
      expect(inc).not.toHaveBeenCalled();
      resolve(undefined);
      await promise;
      expect(await asyncRes).toEqual(ok(2));
    });

    it('should not tap an AsyncErr', async () => {
      expect.assertions(3);
      const { promise, resolve } = deferred<void>();
      const fn = jest.fn<() => Promise<void>>().mockReturnValueOnce(promise);
      const inc = jest.fn((x: number) => x + 1);
      const asyncRes = pipe(
        1,
        asyncErr,
        M.thenTapAndWait(fn),
        M.thenMapErr(inc),
      );
      await delay();
      expect(fn).not.toHaveBeenCalled();
      expect(inc).toHaveBeenCalledWith(1);
      resolve(undefined);
      await promise;
      expect(await asyncRes).toEqual(err(2));
    });
  });

  describe('tapErrAndWait', () => {
    const deferred = <T>() => {
      let resolve: (value: T | PromiseLike<T>) => void;
      let reject: (reason?: any) => void;
      const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
      return { promise, resolve: resolve!, reject: reject! };
    };

    const delay = (ms = 0) => new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

    it('should not tap an AsyncOk', async () => {
      expect.assertions(3);
      const { promise, resolve } = deferred<void>();
      const fn = jest.fn<() => Promise<void>>().mockReturnValueOnce(promise);
      const inc = jest.fn((x: number) => x + 1);
      const asyncRes = pipe(
        1,
        asyncOk,
        M.thenTapErrAndWait(fn),
        M.thenMap(inc),
      );
      await delay();
      expect(fn).not.toHaveBeenCalled();
      expect(inc).toHaveBeenCalledWith(1);
      resolve(undefined);
      await promise;
      expect(await asyncRes).toEqual(ok(2));
    });

    it('should tap an AsyncErr', async () => {
      expect.assertions(3);
      const { promise, resolve } = deferred<void>();
      const fn = jest.fn<() => Promise<void>>().mockReturnValueOnce(promise);
      const inc = jest.fn((x: number) => x + 1);
      const asyncRes = pipe(
        1,
        asyncErr,
        M.thenTapErrAndWait(fn),
        M.thenMapErr(inc),
      );
      await delay();
      expect(fn).toHaveBeenCalledWith(1);
      expect(inc).not.toHaveBeenCalled();
      resolve(undefined);
      await promise;
      expect(await asyncRes).toEqual(err(2));
    });
  });
});
