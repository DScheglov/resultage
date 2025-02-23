import { type Result, ok, err, Do } from 'resultage';

class ParseIntError extends Error {}

function parseInteger(input: string): Result<number, ParseIntError> {
  const int = parseInt(input, 10);
  if (isNaN(int)) return err(new ParseIntError(`${input} is not an int`));
  return ok(int);
}

const multiple = (
  inputA: string,
  inputB: string,
): Result<number, ParseIntError> =>
  Do(function* () {
    const a = yield* parseInteger(inputA);
    const b = yield* parseInteger(inputB);

    return ok(a * b);
  });

function print(result: Result<number, ParseIntError>) {
  result.match(
    (value) => console.log(`n is ${value}`),
    ({ message }) => console.error(`Error: ${message}`),
  );
}

print(multiple('10', '2'));
print(multiple('t', '2'));
