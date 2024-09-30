/* eslint-disable @typescript-eslint/no-unused-vars */
import { Equal, Expect } from '@type-challenges/utils';
import { Result, ok, err } from 'resultage/base';

{
  const okResult = ok(42); // Result<number, never>
  const errResult = err('ERR_NOT_FOUND' as const); // Result<never, 'ERR_NOT_FOUND'>
}

{
  const okResult = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  okResult.isOk; // true
  errResult.isOk; // false
}

{
  const okResult = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  okResult.isErr; // false
  errResult.isErr; // true
}

{
  const okResult = ok(42);
  const errResult: Result<number, 'ERR_NOT_FOUND'> = err('ERR_NOT_FOUND');

  const okMapped = okResult.map((x) => x + 1); // Ok(43)
  const errMapped = errResult.map((x) => x + 1); // Err('ERR_NOT_FOUND')
}

{
  const okResult: Result<number, string> = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  const okMapped = okResult.mapErr(() => 'NOT_FOUND' as const); // Ok(42)
  const errMapped = errResult.mapErr(() => 'NOT_FOUND' as const); // Err('NOT_FOUND')
}

{
  const div = (a: number, b: number): Result<number, 'ERR_DIV_BY_ZERO'> =>
    b === 0 ? err('ERR_DIV_BY_ZERO') : ok(a / b);

  const sqrt = (x: number): Result<number, 'ERR_NEGATIVE'> =>
    x < 0 ? err('ERR_NEGATIVE') : ok(Math.sqrt(x));

  const okResult = div(18, 2).chain((x) => sqrt(x)); // Ok(3)
  const errResult1 = div(1, 0).chain((x) => sqrt(x)); // Err('ERR_DIV_BY_ZERO')
  const errResult2 = div(-9, 1).chain((x) => sqrt(x)); // Err('ERR_NEGATIVE')
}

{
  type Complex = { re: number; im: number };

  const sqrt = (x: number): Result<number, 'ERR_NEGATIVE'> =>
    x < 0 ? err('ERR_NEGATIVE') : ok(Math.sqrt(x));

  const complexSqrt = (x: number): number | Complex =>
    sqrt(x)
      .chainErr(() => sqrt(-1))
      .unwrap();

  const real = complexSqrt(49); // 7
  const complex = complexSqrt(-49); // { re: 0, im: 7 }
}

{
  const okResult = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  okResult.unwrap();
  // 42
  errResult.unwrap();
  // throws TypeError('Cannot unpack an Err result', { cause: 'ERR_NOT_FOUND' })
}

{
  const okResult = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  okResult.unwrapOr(0); // 42
  errResult.unwrapOr(0); // 0
}

{
  const okResult = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  okResult.unwrapOrElse(() => 0); // 42
  errResult.unwrapOrElse(() => 0); // 0
}

{
  const okResult = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  okResult.unwrapErr();
  // throws TypeError('Cannot unpack an Err result', { cause: 42 })
  errResult.unwrapErr();
  // 'ERR_NOT_FOUND'
}

{
  const okResult = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  okResult.unwrapErrOr('NOT_FOUND'); // 'NOT_FOUND'
  errResult.unwrapErrOr('NOT_FOUND'); // 'ERR_NOT_FOUND'
}

{
  const okResult = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  okResult.unwrapErrOrElse(() => 'NOT_FOUND'); // 'NOT_FOUND'
  errResult.unwrapErrOrElse(() => 'NOT_FOUND'); // 'ERR_NOT_FOUND'
}

{
  const okResult = ok(42) as Result<number, 'NOT_FOUND'>;
  const errResult = err('ERR_NOT_FOUND') as Result<string, 'ERR_NOT_FOUND'>;

  const value = okResult.unpack(); // 42
  const error = errResult.unpack(); // 'ERR_NOT_FOUND'

  const checkValue: Expect<Equal<typeof value, number | 'NOT_FOUND'>> = true;

  const checkError: Expect<Equal<typeof error, string | 'ERR_NOT_FOUND'>> =
    true;

  const okValue = ok(42).unpack();
  const checkOk: Expect<Equal<typeof okValue, number>> = true;

  const errValue = err('ERR_NOT_FOUND' as const).unpack();
  const checkErr: Expect<Equal<typeof errValue, 'ERR_NOT_FOUND'>> = true;
}

{
  const okResult = ok(42);
  const errResult = err('ERR_NOT_FOUND' as const);

  okResult.match(
    (x) => `Value is ${x}`,
    () => 'Some error',
  ); // 'Value is 42'

  errResult.match(
    () => 'Some value',
    (e) => `Error is ${e}`,
  ); // 'Error is ERR_NOT_FOUND'
}
