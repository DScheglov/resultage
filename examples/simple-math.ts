import { Result, ok, err } from '@cardellini/ts-result';

const div = (b: number) => (a: number): Result<number, 'ERR_DIV_BY_ZERO'> =>
  b === 0 ? err('ERR_DIV_BY_ZERO') : ok(a / b);

const sqrt = (x: number): Result<number, 'ERR_NEGATIVE_NUMBER'> =>
  x < 0 ? err('ERR_NEGATIVE_NUMBER') : ok(Math.sqrt(x));

const formula1 = (x: number) => div(2)(x).chain(sqrt);

const formula2 = (x: number) => ok(x).chain(div(2)).chain(sqrt);

type Chain = Result<number, "ERR_DIV_BY_ZERO">["chain"];

const formula5 = (x: number, shouldDivide: boolean) =>
  ok(x)
    .chain(sqrt)
    .chain(shouldDivide ? div(2) : ok);