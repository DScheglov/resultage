import { describe, it, expect } from '@jest/globals';
import { isPromise } from './is-promise';

describe('isPromise', () => {
  it('returns true for a Promise', () => {
    const promise = new Promise((resolve) => {
      resolve('Hello');
    });
    expect(isPromise(promise)).toBe(true);
  });

  it('returns true for a resolved Promise', () => {
    const promise = Promise.resolve('Hello');
    expect(isPromise(promise)).toBe(true);
  });

  it('returns true for a rejected Promise', () => {
    const promise = Promise.reject(new Error('Oops'));
    expect(isPromise(promise)).toBe(true);
    promise.catch(() => {});
  });

  it('returns false for a non-Promise value', () => {
    expect(isPromise('Hello')).toBe(false);
    expect(isPromise(42)).toBe(false);
    expect(isPromise(true)).toBe(false);
    expect(isPromise(null)).toBe(false);
    expect(isPromise(undefined)).toBe(false);
    expect(isPromise({})).toBe(false);
    expect(isPromise([])).toBe(false);
    expect(isPromise(() => {})).toBe(false);
  });
});
