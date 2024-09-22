import { AsyncResult, Do, err, ok } from 'okerr-ts';

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
): AsyncResult<unknown, FetchJsonError> =>
  Do(async function* () {
    const response = yield* await fetchFn(info, options).then(
      ok, //
      () => err(ERR_REQUEST_FAILED),
    );

    if (!response.ok) {
      return err(ERR_UNSUCCESSFUL_RESPONSE);
    }

    return response.json().then(
      ok, //
      () => err(ERR_FAILED_TO_PARSE_JSON),
    );
  });
