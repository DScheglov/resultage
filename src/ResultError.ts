import { captureStackTrace } from './fn/captureStackTrace.js';
import { Result } from './types';

export type ResultErrorCode =
  | 'ERR_NOT_OK'
  | 'ERR_NOT_ERR'
  | 'ERR_VALUE_IS_NOT_A_FUNC';

const $ResultError = '__resultage::ResultError__' as const;

export const isResultError = <E extends ResultErrorCode = ResultErrorCode>(
  error: unknown,
  code?: E,
): error is ResultError<E> =>
  (error as any)?.[$ResultError] === true &&
  (code === undefined || (error as ResultError<E>).code === code);

export class ResultError<
  ErrorCode extends ResultErrorCode = ResultErrorCode,
> extends Error {
  name = 'ResultError';

  public readonly code: ErrorCode;
  public readonly result: Result<unknown, unknown>;

  [$ResultError] = true as const;

  static isResultError<E extends ResultErrorCode = ResultErrorCode>(
    error: unknown,
    code?: E,
  ): error is ResultError<E> {
    return isResultError(error, code);
  }

  constructor(
    result: Result<unknown, unknown>,
    code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.code = code;
    this.result = result;
  }

  static raise<E extends ResultErrorCode = ResultErrorCode>(
    result: Result<unknown, unknown>,
    code: E,
    message: string,
    fn?: { (...args: any[]): any },
  ): never {
    const error = new ResultError(result, code, message);
    error.#patchStackTrace(fn ?? ResultError.raise);
    throw error;
  }

  #patchStackTrace(skipFn: { (...args: any[]): any }): void {
    if (!this.stack) return;

    captureStackTrace(this, skipFn);
  }
}
