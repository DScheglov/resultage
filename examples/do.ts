import { Result, err, ok } from 'ts-result/base';
import { Do } from 'ts-result/do';

const div = (a: number, b: number): Result<number, 'ERR_DIV_BY_ZERO'> => (
  b === 0
    ? err('ERR_DIV_BY_ZERO')
    : ok(a / b)
);

const sqrt = (x: number): Result<number, 'ERR_NEGATIVE'> => (
  x < 0
    ? err('ERR_NEGATIVE')
    : ok(Math.sqrt(x))
);

const quadraticEquation = (a: number, b: number, c: number): Result<
  { x1: number; x2: number },
  'ERR_NEGATIVE' | 'ERR_DIV_BY_ZERO'
> => Do(function* (unwrap) {
  const d = yield* unwrap(
    sqrt(b * b - 4 * a * c),
  );

  const reciprocalA2 = yield* unwrap(
    div(1, a * 2),
  );

  return {
    x1: (-b + d) * reciprocalA2,
    x2: (-b - d) * reciprocalA2,
  };
});

console.log(quadraticEquation(1, 2, 3));
// Err { error: 'ERR_NEGATIVE' }
console.log(quadraticEquation(0, 2, -3));
// Err { error: 'ERR_DIV_BY_ZERO' }
console.log(quadraticEquation(1, -3, 2));
// Ok { data: { x1: 2, x2: 1 } }
