/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import { Equal, Expect } from '@type-challenges/utils';
import {
  expect, okIf, expectExists, AsyncResult,
} from '../src/base';

{
  const isNumber = (x: unknown): x is number => typeof x === 'number';
  const isPositive = (x: number) => x > 0;

  const okIfNumber = (value: unknown) => okIf(
    value,
    isNumber,
    'ERR_NOT_A_NUMBER' as const,
  );

  const okIfPositive = (value: number) => okIf(
    value,
    isPositive,
    'ERR_NOT_POSITIVE' as const,
  );

  console.log(okIfNumber(42).chain(okIfPositive));
  // prints to console:
  // Ok { data: 42 }

  console.log(okIfNumber('42').chain(okIfPositive));
  // prints to console:
  // Err { error: 'ERR_NOT_A_NUMBER' }

  console.log(okIfNumber(-42).chain(okIfPositive));
  // prints to console:
  // Err { error: 'ERR_NOT_POSITIVE' }
}

{
  type CodedError<C extends string, P> = { code: C; payload?: P };

  const codedError = <C extends string, P = undefined>(
    code: C, payload?: P,
  ): CodedError<C, P> => (payload === undefined ? { code } : { code, payload });

  const expectNumber = expect(
    (x: unknown): x is number => typeof x === 'number',
    (value) => codedError('ERR_NOT_A_NUMBER', value),
  );

  const expectPositive = expect(
    (x: number) => x > 0,
    (x) => codedError('ERR_NOT_POSITIVE', { value: x }),
  );

  const expectPositiveNumber = (value: unknown) =>
    expectNumber(value).chain(expectPositive);

  console.log(expectPositiveNumber(42));
  // prints to console:
  // Ok { data: 42 }

  console.log(expectPositiveNumber('42'));
  // prints to console:
  // Err { error: { code: 'ERR_NOT_A_NUMBER', payload: '42' } }

  console.log(expectPositiveNumber(-42));
  // prints to console:
  // Err { error: { code: 'ERR_NOT_POSITIVE', payload: { value: -42 } } }
}

{
  type User = { login: string; name: string };

  const fetchUser = (login: string) =>
    fetch(`/api/users/${login}`)
      .then((res) => res.json())
      .then(({ data }) => data as User)
      .then(
        expectExists({
          code: 'ERR_USER_NOT_FOUND' as const,
          message: `User with login "${login}" not found`,
        }),
      );

  const checkFetchUser: Expect<Equal<
    typeof fetchUser,
    (login: string) => AsyncResult<
      User,
      { code: 'ERR_USER_NOT_FOUND'; message: string; }
    >
  >> = true;
}
