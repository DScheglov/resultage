import { type Result, ok, err, Do } from 'resultage';

class ParseIntError extends Error {}

function parseInteger(input: string): Result<number, ParseIntError> {
  const value = parseInt(input, 10);
  if (isNaN(value)) return err(new ParseIntError(`${input} is not a number`));
  if (!Number.isInteger(value)) {
    return err(new ParseIntError(`${input} is not an integer`));
  }
  return ok(value);
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
