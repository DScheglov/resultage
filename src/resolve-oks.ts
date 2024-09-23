import { isResult } from './guards';
import { Err, ErrTypeOf, ResolveOks } from './types';

export const resolveOks = <PR extends any[]>(
  args: PR,
): ResolveOks<PR> | Err<ErrTypeOf<PR[number]>> => {
  const argValues = [] as any[];

  for (const arg of args) {
    if (!isResult(arg)) {
      argValues.push(arg);
    } else if (arg.isErr) {
      return arg as Err<ErrTypeOf<PR[number]>>;
    } else {
      argValues.push(arg.value);
    }
  }

  return argValues as ResolveOks<PR>;
};
