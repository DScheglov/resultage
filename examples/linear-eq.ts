import { Result, ok, err } from 'resultage';

export type LinearEquationError = 'INFINITE_ROOTS' | 'NO_ROOTS';

export function solveLinearEquation(
  a: number,
  b: number,
): Result<number, LinearEquationError> {
  if (a === 0 && b === 0) return err('INFINITE_ROOTS');
  if (a === 0) return err('NO_ROOTS' as const);

  return ok(-b / a);
}

// console.log(solveLinearEquation(2, 4) /* Ok(-2) */);
// Prints to console: Ok { value: -2 }

// console.log(solveLinearEquation(0, 0) /* Err('INFINITE_ROOTS') */);
// Prints to console: Err { error: 'INFINITE_ROOTS' }

// console.log(solveLinearEquation(0, 2) /* Err('NO_ROOTS') */);
// Prints to console: Err { error: 'NO_ROOTS' }
