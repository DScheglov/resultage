export function assertNever(
  x: never,
  msg: string | ((value: any) => string),
): never {
  const message = typeof msg === 'function' ? msg(x) : msg;
  throw new TypeError(message);
}
