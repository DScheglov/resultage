import { describe, expect, it } from '@jest/globals';
import { err } from './Err';
import { ResultError, isResultError } from './ResultError';
import { stackCapturerPolyfill } from './fn/captureStackTrace';
import type { Result } from './types';
import { ok } from './Ok';
import { Equal, Expect } from '@type-challenges/utils';

describe('ResultError', () => {
  const mockResult: Result<unknown, unknown> = err('Mock error');

  it('creates a ResultError instance with correct properties', () => {
    const error = new ResultError(mockResult, 'ERR_NOT_OK', 'Test message');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ResultError);
    expect(error.name).toBe('ResultError');
    expect(error.code).toBe('ERR_NOT_OK');
    expect(error.message).toBe('Test message');
    expect(error.result).toBe(mockResult);
  });

  it('throws ResultError', () => {
    expect(() => {
      ResultError.raise(mockResult, 'ERR_NOT_OK', 'Test message');
    }).toThrow(ResultError);
  });

  it('identifies ResultError using isResultError', () => {
    const error = new ResultError(mockResult, 'ERR_NOT_OK', 'Test message');
    expect(isResultError(error)).toBe(true);
    expect(isResultError(error, 'ERR_NOT_OK')).toBe(true);
    expect(isResultError(error, 'ERR_NOT_ERR')).toBe(false);
    expect(isResultError({}, 'ERR_NOT_OK')).toBe(false);
    expect(isResultError(null)).toBe(false);
  });

  it('narrows type with isResultError', () => {
    expect.assertions(1);
    const error: unknown = new ResultError(
      mockResult,
      'ERR_NOT_OK',
      'Test message',
    );
    if (isResultError(error)) {
      const check: Expect<Equal<typeof error, ResultError>> = true;
      expect(check).toBe(true);
    }
  });

  it('narrows type with isResultError and error code', () => {
    expect.assertions(1);
    const error: unknown = new ResultError(
      mockResult,
      'ERR_NOT_OK',
      'Test message',
    );
    if (isResultError(error, 'ERR_NOT_OK')) {
      const check: Expect<Equal<typeof error, ResultError<'ERR_NOT_OK'>>> =
        true;
      expect(check).toBe(true);
    }
  });

  it('identifies ResultError using static isResultError', () => {
    const error = new ResultError(mockResult, 'ERR_NOT_OK', 'Test message');
    expect(ResultError.isResultError(error)).toBe(true);
    expect(ResultError.isResultError(error, 'ERR_NOT_OK')).toBe(true);
    expect(ResultError.isResultError(error, 'ERR_NOT_ERR')).toBe(false);
  });

  it('throws ResultError with raise and patch stack trace', () => {
    const fn = () => {
      ResultError.raise(mockResult, 'ERR_NOT_ERR', 'Raised error', fn);
    };
    try {
      fn();
    } catch (e) {
      expect(e).toBeInstanceOf(ResultError);
      expect((e as ResultError).code).toBe('ERR_NOT_ERR');
      expect((e as ResultError).message).toBe('Raised error');
      expect(isResultError(e)).toBe(true);
      // stack should not include ResultError.raise
      if ((e as Error).stack) {
        expect((e as Error).stack).not.toMatch(/ResultError\.raise/);
      }
    }
  });

  it('filters stack trace lines in #patchStackTrace (with captureStackTrace)', () => {
    expect.assertions(1);

    let regularError: Error;
    const fn = () => {
      regularError = new Error('Regular error');
      (ok('Test') as any).error;
    };

    try {
      fn();
    } catch (e) {
      // @ts-expect-error - regularError is assigned in the fn
      const regError = regularError;
      const resError = e as ResultError;

      const resLines = resError.stack!.split('\n');
      const regLines = regError.stack!.split('\n');
      expect(resLines.length).toBe(regLines.length);
    }
  });

  it('filters stack trace lines in #patchStackTrace (fallback)', () => {
    expect.assertions(1);

    stackCapturerPolyfill();

    let regularError: Error;
    const fn = () => {
      regularError = new Error('Regular error');
      (ok('Test') as any).error;
    };

    try {
      fn();
    } catch (e) {
      // @ts-expect-error - regularError is assigned in the fn
      const regError = regularError;
      const resError = e as ResultError;

      const resLines = resError.stack!.split('\n');
      const regLines = regError.stack!.split('\n');
      expect(resLines.length).toBe(regLines.length);
    } finally {
      stackCapturerPolyfill({ reset: true });
    }
  });
});
