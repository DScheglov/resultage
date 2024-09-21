import { err, ok, Result } from 'okerr-ts';

const okIfOdd = (value: number): Result<number, string> =>
  value % 2 === 1 ? ok(value) : err('Value is not odd');

const getOdd = (value: number): number =>
  okIfOdd(value)
    .chainErr(() => ok(value + 1))
    .unwrap();

console.log(getOdd(1)); // 1
