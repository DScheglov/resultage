import { AsyncResult, err, ok, thenChain } from 'resultage';
import { pipe } from 'resultage/fn';

const ERR_REQUEST_FAILED = 'ERR_REQUEST_FAILED' as const;
const ERR_UNSUCCESSFUL_RESPONSE = 'ERR_UNSUCCESSFUL_RESPONSE' as const;
const ERR_FAILED_TO_PARSE_JSON = 'ERR_FAILED_TO_PARSE_JSON' as const;

type FetchJsonError =
  | typeof ERR_REQUEST_FAILED
  | typeof ERR_UNSUCCESSFUL_RESPONSE
  | typeof ERR_FAILED_TO_PARSE_JSON;

export const fetchJson = (
  info: RequestInfo,
  { fetchFn, ...options }: RequestInit & { fetchFn: typeof fetch },
): AsyncResult<unknown, FetchJsonError> => {
  return pipe(
    fetchFn(info, options).then(ok, () => err(ERR_REQUEST_FAILED)),
    thenChain((response) =>
      response.ok ? ok(response) : err(ERR_UNSUCCESSFUL_RESPONSE),
    ),
    thenChain((response) =>
      response.json().then(ok, () => err(ERR_FAILED_TO_PARSE_JSON)),
    ),
  );
};
