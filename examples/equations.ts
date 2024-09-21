/* eslint-disable max-len, object-curly-newline, func-names */
import { Result, err, ok, Do } from 'okerr-ts';
import { assertNever } from 'okerr-ts/fn';

const sqrt = (x: number): Result<number, 'ERR_NEGATIVE_NUMBER'> =>
  x < 0 ? err('ERR_NEGATIVE_NUMBER') : ok(Math.sqrt(x));

type LinierEquationError = 'ERR_NO_ROOTS' | 'ERR_INFINITE_ROOTS';

type QuadraticEquationError = LinierEquationError | 'ERR_NO_REAL_ROOTS';

const linierEquation = (
  a: number,
  b: number,
): Result<number, LinierEquationError> =>
  // prettier-ignore
  a === 0 && b === 0 ? err('ERR_INFINITE_ROOTS') :
  a === 0 ? err('ERR_NO_ROOTS') :
  ok(-b / a);

type QuadraticEquationRes = Result<
  Readonly<[number] | [number, number]>,
  QuadraticEquationError
>;

const quadraticEquation = (
  a: number,
  b: number,
  c: number,
): QuadraticEquationRes =>
  Do(function* () {
    if (a === 0) {
      return linierEquation(b, c).map((x) => [x] as const);
    }

    const d = yield* sqrt(b * b - 4 * a * c).mapErr(
      () => 'ERR_NO_REAL_ROOTS' as const,
    );

    const a2 = 2 * a;

    return [(-b + d) / a2, (-b - d) / a2] as const;
  });

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
      assertNever(errorCode, (code) => `Unexpected error code: ${code}`);
  }
}
