export const isPromise = (value: any): value is Promise<unknown> =>
  value != null && typeof value.then === 'function';
