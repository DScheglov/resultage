import { describe, it, expect } from '@jest/globals';
import { Result, err, ok } from './base';
import { Do } from './do-gen';

describe('resultDo', () => {
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

  const qer = (a: number, b: number, c: number): Result<[number] | [number, number], QeErrCode> =>
    Do(function* qerJob(_) {
      if (a === 0) return ler(b, c).map((x) => [x] as [number]);

      const d = yield* _(sqrt(b * b - 4 * a * c)
        .mapErr(() => 'ERR_NO_REAL_ROOTS' as const));

      const a2 = 2 * a;

      return [(-b + d) / a2, (-b - d) / a2];
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
