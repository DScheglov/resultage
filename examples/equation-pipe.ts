/* eslint-disable max-len, object-curly-newline, func-names */
import { Result, err, ok } from '../src/base';
import { map, mapErr } from '../src/sync-methods';
import { assertNever, pipe, asConst } from '../src/fn';

const sqrt = (x: number): Result<number, 'ERR_NEGATIVE_NUMBER'> => (
  x < 0
    ? err('ERR_NEGATIVE_NUMBER')
    : ok(Math.sqrt(x))
);

type LinierEquationError =
  | 'ERR_NO_ROOTS'
  | 'ERR_INFINITE_ROOTS';

type QuadraticEquationError =
  | LinierEquationError
  | 'ERR_NO_REAL_ROOTS';

const linierEquation =
  (a: number, b: number): Result<number, LinierEquationError> => (
    a === 0 && b === 0 ? err('ERR_INFINITE_ROOTS') :
    a === 0 ? err('ERR_NO_ROOTS') :
    ok(-b / a)
  );

type QuadraticEquationResult = Result<
  [number] | [number, number], // roots
  QuadraticEquationError
>;

const singleRoot = (x: number): [number] => [x];

const twoRoots = (a2: number, b: number) => (d: number): [number, number] => [
  (-b + d) / a2,
  (-b - d) / a2,
];

const quadraticEquation = (a: number, b: number, c: number): QuadraticEquationResult =>
  (a === 0
    ? pipe(
      linierEquation(b, c),
      map(singleRoot),
    )
    : pipe(
      sqrt(b * b - 4 * a * c),
      mapErr(asConst('ERR_NO_REAL_ROOTS')),
      map(twoRoots(a * 2, b)),
    )
  );

const result = quadraticEquation(0, 0, 0);

if (result.isOk) {
  console.log(result.unwrap());
} else {
  const errorCode = result.unwrapErr();

  switch (errorCode) {
  case 'ERR_NO_REAL_ROOTS':
    console.log('No real roots');
    break;
  case 'ERR_NO_ROOTS':
    console.log('No roots');
    break;
  case 'ERR_INFINITE_ROOTS':
    console.log('Infinite roots');
    break;
  default:
    assertNever(errorCode, `Unexpected error code: ${errorCode as string}`);
  }
}
