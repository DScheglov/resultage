export const identity = <T>(x: T): T => x;
export const idX = identity;
export const lazy = <T>(value: T) => () => value;
export const asConst = <T extends string | number | boolean>(
  value: T,
) => () => value;
