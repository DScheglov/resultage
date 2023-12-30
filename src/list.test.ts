import {
  describe, it, expect, jest,
} from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { asyncOk, ok } from './Ok';
import { asyncErr, err } from './Err';
import {
  reduce, collect, partition, sequenceAsync, collectAsync, sequence, reduceErr, collectErr, separate,
} from './lists';
import { isErr, isOk } from './guards';
import { AsyncResult, Result } from './types';

describe('result::lists', () => {
  describe('reduce', () => {
    it('returns the reduced result', () => {
      const results = [ok(1), ok(2), ok(3)];
      expect(reduce(results, (acc, x) => acc + x, 0)).toEqual(ok(6));
    });

    it('returns the first err', () => {
      const results = [ok(1), err(2), ok(3)];
      expect(reduce(results, (acc, x) => acc + x, 0)).toEqual(err(2));
    });
  });

  describe('reduceErr', () => {
    it('returns the reduced result', () => {
      const results = [err(1), err(2), err(3)];
      expect(reduceErr(results, (acc, x) => acc + x, 0)).toEqual(err(6));
    });

    it('returns the first ok', () => {
      const results = [err(1), ok(2), err(3)];
      expect(reduceErr(results, (acc, x) => acc + x, 0)).toEqual(ok(2));
    });
  });

  describe('collect', () => {
    it('returns the folded result', () => {
      const results = [ok(1), ok(2), ok(3)];
      const collected = collect(results);
      expect(collected).toEqual(ok([1, 2, 3]));
    });

    it('returns the first err', () => {
      const results = [ok(1), err(2), ok(3)];
      const collected = collect(results);
      expect(collected).toEqual(err(2));
    });

    it('works for tuples oks', () => {
      const results = [ok(1), ok('abc'), ok(3)] as const;
      const collected = collect(results);
      const check: Expect<Equal<
      typeof collected,
        Result<[number, string, number], never>
      >> = true;
      expect(check).toBe(true);
      expect(collected).toEqual(ok([1, 'abc', 3]));
    });

    it('works for tuples with results', () => {
      const sqrt = (x: number): Result<number, 'ERR_SQRT'> =>
        (x < 0 ? err('ERR_SQRT') : ok(Math.sqrt(x)));

      const results = [ok(1), sqrt(-4), ok(9)] as const;
      const collected = collect(results);

      const check: Expect<Equal<
        typeof collected,
        Result<[number, number, number], 'ERR_SQRT'>
      >> = true;
      expect(check).toBe(true);
      expect(collected).toEqual(err('ERR_SQRT'));
    });

    it('works for tuples with err', () => {
      const results = [ok(1), err(2), ok(3)] as const;
      const collected = collect(results);
      expect(collected).toEqual(err(2));
    });
  });

  describe('collectErr', () => {
    it('returns the folded result', () => {
      const results = [err(1), err(2), err(3)];
      const collected = collectErr(results);
      expect(collected).toEqual(err([1, 2, 3]));
    });

    it('returns the first ok', () => {
      const results = [err(1), ok(2), err(3)];
      const collected = collectErr(results);
      expect(collected).toEqual(ok(2));
    });

    it('works for tuples oks', () => {
      const results = [err(1), err('abc'), err(3)] as const;
      const collected = collectErr(results);
      const check: Expect<Equal<
        typeof collected,
        Result<never, [number, string, number]>
      >> = true;
      expect(check).toBe(true);
      expect(collected).toEqual(err([1, 'abc', 3]));
    });

    it('works for tuples with results', () => {
      const sqrt = (x: number): Result<number, 'ERR_SQRT'> =>
        (x < 0 ? err('ERR_SQRT') : ok(Math.sqrt(x)));

      const results = [err(1), sqrt(-4), err(9)] as const;
      const collected = collectErr(results);

      const check: Expect<Equal<
        typeof collected,
        Result<number, [number, 'ERR_SQRT', number]>
      >> = true;
      expect(check).toBe(true);
      expect(collected).toEqual(err([1, 'ERR_SQRT', 9]));
    });

    it('works for tuples with err', () => {
      const results = [err(1), err(2), err(3)] as const;
      const collected = collectErr(results);
      expect(collected).toEqual(err([1, 2, 3]));
    });
  });

  describe('partition', () => {
    it('returns the same array of ok-s and empty list', () => {
      const results = [ok(1), ok(2), ok(3)];
      expect(partition(results, isOk)).toEqual([results, []]);
    });

    it('returns the separated ok-s and err-s', () => {
      const results = [ok(1), err(2), ok(3)];
      expect(partition(results, isOk)).toEqual([[ok(1), ok(3)], [err(2)]]);
    });

    it('returns the empty list of ok-s and the same array of err-s', () => {
      const results = [err(1), err(2), err(3)];
      expect(partition(results, isOk)).toEqual([[], results]);
    });

    it('returns the same list of err-s and empty list of ok-s', () => {
      const results = [err(1), err(2), err(3)];
      expect(partition(results, isErr)).toEqual([results, []]);
    });
  });

  describe('separate', () => {
    it('returns the same array of ok-s and empty list', () => {
      const results = [ok(1), ok(2), ok(3)];
      const [oks, errs] = separate(results);
      expect(oks).toEqual(ok([1, 2, 3]));
      expect(errs).toEqual(err([]));
    });

    it('returns the separated ok-s and err-s', () => {
      const results = [ok(1), err(2), ok('abc')];
      const [oks, errs] = separate(results);
      expect(oks).toEqual(ok([1, 'abc']));
      expect(errs).toEqual(err([2]));
    });
  });

  describe('collectAsync', () => {
    it('returns the folded result', async () => {
      const results = [asyncOk(1), ok(2), ok(3)];
      const collected = await collectAsync(results);
      expect(collected).toEqual(ok([1, 2, 3]));
    });

    it('returns the first err', async () => {
      const results = [ok(1), asyncErr(2), ok(3)];
      const collected = await collectAsync(results);
      expect(collected).toEqual(err(2));
    });

    it('works for tuples oks', async () => {
      const results = [ok(1), ok('abc'), ok(3)] as const;
      const collected = await collectAsync(results);
      const check: Expect<Equal<
      typeof collected,
        Result<[number, string, number], never>
      >> = true;
      expect(check).toBe(true);
      expect(collected).toEqual(ok([1, 'abc', 3]));
    });

    it('works for tuples with results', async () => {
      const sqrt = async (x: number): AsyncResult<number, 'ERR_SQRT'> =>
        (x < 0 ? err('ERR_SQRT') : ok(Math.sqrt(x)));

      const results = [ok(1), sqrt(-4), ok(9)] as const;
      const collected = await collectAsync(results);

      const check: Expect<Equal<
        typeof collected,
        Result<[number, number, number], 'ERR_SQRT'>
      >> = true;
      expect(check).toBe(true);
      expect(collected).toEqual(err('ERR_SQRT'));
    });

    it('works for tuples with err', async () => {
      const results = [asyncOk(1), asyncErr(2), asyncOk(3)] as const;
      const collected = await collectAsync(results);
      expect(collected).toEqual(err(2));
    });
  });

  describe('sequence', () => {
    it('returns the array of ok-s from IO<OK<T>>[]', () => {
      const tasks = [() => ok(1), () => ok(2), () => ok(3)];
      const results = sequence(tasks);
      const check: Expect<Equal<
        typeof results,
        Result<number[], never>
      >> = true;
      expect(check).toBe(true);
      expect(results).toEqual(ok([1, 2, 3]));
    });

    it('returns the first err', () => {
      const ios = [() => ok(1), () => err(2), () => ok(3)];
      expect(sequence(ios)).toEqual(err(2));
    });

    it('works for tuples of oks', () => {
      const tasks = [() => ok(1), () => ok('abc'), () => ok(3)] as const;
      const results = sequence(tasks);
      const check: Expect<Equal<
        typeof results,
        Result<[number, string, number], never>
      >> = true;
      expect(check).toBe(true);
      expect(results).toEqual(ok([1, 'abc', 3]));
    });

    it('doesn\'t run the next task if the previous one is err', () => {
      const tasks = [
        jest.fn(() => ok(1)),
        jest.fn(() => err(2)),
        jest.fn(() => ok(3)),
      ];

      expect(sequence(tasks)).toEqual(err(2));

      expect(tasks[0]).toHaveBeenCalledTimes(1);
      expect(tasks[1]).toHaveBeenCalledTimes(1);
      expect(tasks[2]).not.toHaveBeenCalled();
    });
  });

  describe('sequenceAsync', () => {
    it('returns the array of ok-s from IO<OK<T>>[]', async () => {
      const tasks = [() => ok(1), () => ok(2), () => ok(3)];
      const results = sequenceAsync(tasks);
      const check: Expect<Equal<
        typeof results,
        AsyncResult<number[], never>
      >> = true;
      expect(check).toBe(true);
      await expect(results).resolves.toEqual(ok([1, 2, 3]));
    });

    it('returns the first err', async () => {
      const ios = [() => ok(1), () => err(2), () => ok(3)];
      await expect(sequenceAsync(ios)).resolves.toEqual(err(2));
    });

    it('returns the array of ok-s from Task<OK<T>>[]', async () => {
      const tasks = [
        () => Promise.resolve(ok(1)),
        () => Promise.resolve(ok(2)),
        () => Promise.resolve(ok(3)),
      ];
      await expect(sequenceAsync(tasks)).resolves.toEqual(ok([1, 2, 3]));
    });

    it('returns the first err', async () => {
      const tasks = [
        () => Promise.resolve(ok(1)),
        () => Promise.resolve(err(2)),
        () => Promise.resolve(ok(3)),
      ];
      await expect(sequenceAsync(tasks)).resolves.toEqual(err(2));
    });

    it('doesn\'t run the next task if the previous one is err', async () => {
      expect.assertions(4);
      const tasks = [
        jest.fn(() => Promise.resolve(ok(1))),
        jest.fn(() => Promise.resolve(err(2))),
        jest.fn(() => Promise.resolve(ok(3))),
      ];

      await expect(sequenceAsync(tasks)).resolves.toEqual(err(2));

      expect(tasks[0]).toHaveBeenCalledTimes(1);
      expect(tasks[1]).toHaveBeenCalledTimes(1);
      expect(tasks[2]).not.toHaveBeenCalled();
    });

    it('works for tuples of oks', async () => {
      const tasks = [() => ok(1), () => ok('abc'), () => ok(3)] as const;
      const results = sequenceAsync(tasks);
      const check: Expect<Equal<
        typeof results,
        AsyncResult<[number, string, number], never>
      >> = true;
      expect(check).toBe(true);
      await expect(results).resolves.toEqual(ok([1, 'abc', 3]));
    });
  });
});
