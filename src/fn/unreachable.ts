export function unreachable(msg = 'Unreachable code reached'): never {
  throw new Error(msg);
}
