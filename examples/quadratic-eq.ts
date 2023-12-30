import { Result, ok, err } from '@cardellini/ts-result';
import { solveLinearEquation, LinearEquationError } from './linear-eq';

type QuadraticEquationError = LinearEquationError | 'NO_REAL_ROOTS';
type QuadraticEquationResult = Result<
  [number] | [number, number],
  QuadraticEquationError
>;

export type SqrtError = 'ERR_NEGATIVE_NUMBER';

export function sqrt(x: number): Result<number, SqrtError> {
  return x < 0 ? err('ERR_NEGATIVE_NUMBER') : ok(Math.sqrt(x));
}

function solveQuadraticEquation(
  a: number,
  b: number,
  c: number
): QuadraticEquationResult {
  if (a === 0) solveLinearEquation(b, c).map((x) => [x]);

  return sqrt(b * b - 4 * a * c)
    .mapErr(() => 'NO_REAL_ROOTS' as const)
    .map((sqrtDiscriminant) => [
      (-b + sqrtDiscriminant) / (2 * a),
      (-b - sqrtDiscriminant) / (2 * a),
    ]);
}