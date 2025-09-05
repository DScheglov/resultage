import { isResult } from './guards.js';
import { ErrResult, ErrTypeOf, ResolveOks } from './types';

export const resolveOks = <PR extends any[]>(
  args: PR,
): ResolveOks<PR> | ErrResult<ErrTypeOf<PR[number]>> => {
  const argValues = new Array(args.length);
  let index = 0;

  for (const arg of args) {
    if (!isResult(arg)) {
      argValues[index++] = arg;
    } else if (arg.isErr) {
      return arg as ErrResult<ErrTypeOf<PR[number]>>;
    } else {
      argValues[index++] = arg.value;
    }
  }

  return argValues as ResolveOks<PR>;
};
