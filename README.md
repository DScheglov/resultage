# Result [![Coverage Status](https://coveralls.io/repos/github/DScheglov/ts-result/badge.svg?branch=master&service=github)](https://coveralls.io/github/DScheglov/ts-result?branch=master&service=github) [![npm version](https://img.shields.io/npm/v/ts-result.svg?style=flat-square)](https://www.npmjs.com/package/ts-result) [![npm downloads](https://img.shields.io/npm/dm/ts-result.svg?style=flat-square)](https://www.npmjs.com/package/ts-result) [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/DScheglov/ts-result/blob/master/LICENSE)

Useful type to model success and failure, implemented with focus on type safety,
developer experience and preserving flat learning curve.

## Installation

```bash
npm install ts-result
```

## Usage

```typescript
import { Result, ok, err } from 'ts-result';

function divide(a: number, b: number): Result<number, 'ERR_DIV_BY_ZERO'> {
  if (b === 0) {
    return err('ERR_DIV_BY_ZERO');
  }

  return ok(a / b);
}

const result = divide(10, 2);

if (result.isOk()) {
  console.log(result.unwrap()); // 5
} else {
  console.log(result.unwrapErr()); // 'ERR_DIV_BY_ZERO'
}
```

## Documentation

[TODO: insert link to documentation]