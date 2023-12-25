import {
  describe, it, expect, jest,
} from '@jest/globals';
import { ok } from './Ok';
import { err } from './Err';
import {
  reduce, collect, partition, sequence,
} from './lists';
import { isErr, isOk } from './guards';

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

  describe('collect', () => {
    it('returns the folded result', () => {
      const results = [ok(1), ok(2), ok(3)];
      expect(collect(results)).toEqual(ok([1, 2, 3]));
    });

    it('returns the first err', () => {
      const results = [ok(1), err(2), ok(3)];
      expect(collect(results)).toEqual(err(2));
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

  describe('sequence', () => {
    it('returns the array of ok-s from IO<OK<T>>[]', async () => {
      const results = [() => ok(1), () => ok(2), () => ok(3)];
      await expect(sequence(results)).resolves.toEqual(ok([1, 2, 3]));
    });

    it('returns the first err', async () => {
      const ios = [() => ok(1), () => err(2), () => ok(3)];
      await expect(sequence(ios)).resolves.toEqual(err(2));
    });

    it('returns the array of ok-s from Task<OK<T>>[]', async () => {
      const tasks = [
        () => Promise.resolve(ok(1)),
        () => Promise.resolve(ok(2)),
        () => Promise.resolve(ok(3)),
      ];
      await expect(sequence(tasks)).resolves.toEqual(ok([1, 2, 3]));
    });

    it('returns the first err', async () => {
      const tasks = [
        () => Promise.resolve(ok(1)),
        () => Promise.resolve(err(2)),
        () => Promise.resolve(ok(3)),
      ];
      await expect(sequence(tasks)).resolves.toEqual(err(2));
    });

    it('doesn\'t run the next task if the previous one is err', async () => {
      expect.assertions(4);
      const tasks = [
        jest.fn(() => Promise.resolve(ok(1))),
        jest.fn(() => Promise.resolve(err(2))),
        jest.fn(() => Promise.resolve(ok(3))),
      ];

      await expect(sequence(tasks)).resolves.toEqual(err(2));

      expect(tasks[0]).toHaveBeenCalledTimes(1);
      expect(tasks[1]).toHaveBeenCalledTimes(1);
      expect(tasks[2]).not.toHaveBeenCalled();
    });
  });
});
