import { describe, it, expect } from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { Result, err, ok, AsyncResult, okIfExists } from './base';
import { Do } from './do';
import { collect } from './lists';
import { mapErr } from './sync-methods';

describe('Do::sync', () => {
  describe('case sqrt', () => {
    const sqrt = (x: number): Result<number, 'ERR_NEGATIVE_NUMBER'> =>
      x < 0 ? err('ERR_NEGATIVE_NUMBER') : ok(Math.sqrt(x));

    type LeErrCode = 'ERR_NO_ROOTS' | 'ERR_INFINITE_ROOTS';

    type QeErrCode = LeErrCode | 'ERR_NO_REAL_ROOTS';

    const ler = (a: number, b: number): Result<number, LeErrCode> =>
      a === 0 && b === 0
        ? err('ERR_INFINITE_ROOTS')
        : a === 0
          ? err('ERR_NO_ROOTS')
          : ok(-b / a);

    const qer = (a: number, b: number, c: number) =>
      Do(function* qerJob() {
        if (a === 0) return ler(b, c).map((x) => [x] as [number]);

        const d = yield* sqrt(b * b - 4 * a * c).mapErr(
          () => 'ERR_NO_REAL_ROOTS' as const,
        );

        const a2 = 2 * a;

        // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        return [(-b + d) / a2, (-b - d) / a2] as [number, number];
      });

    it('allows to avoid explicit typing', () => {
      const check: Expect<
        Equal<
          typeof qer,
          (
            a: number,
            b: number,
            c: number,
          ) => Result<[number] | [number, number], QeErrCode>
        >
      > = true;

      expect(check).toBe(true);
    });

    it('returns Ok([1, -1]) for qer(1, 0, -1)', () => {
      expect(qer(1, 0, -1)).toEqual(ok([1, -1]));
    });

    it('returns Ok([1]) for qer(0, -1, 1)', () => {
      expect(qer(0, -1, 1)).toEqual(ok([1]));
    });

    it('returns Err("ERR_NO_REAL_ROOTS") for qer(1, 0, 1)', () => {
      expect(qer(1, 0, 1)).toEqual(err('ERR_NO_REAL_ROOTS'));
    });

    it('returns Err("ERR_NO_ROOTS") for qer(0, 0, 1)', () => {
      expect(qer(0, 0, 1)).toEqual(err('ERR_NO_ROOTS'));
    });

    it('returns Err("ERR_INFINITE_ROOTS") for qer(0, 0, 0)', () => {
      expect(qer(0, 0, 0)).toEqual(err('ERR_INFINITE_ROOTS'));
    });
  });

  describe('case parse person', () => {
    type Person = {
      name: string;
      age: number;
    };

    type JsonObject = Record<string, unknown>;

    const okIfObject = (
      value: unknown,
    ): Result<JsonObject, 'ERR_NOT_AN_OBJECT'> =>
      typeof value === 'object' && value !== null
        ? ok(value as JsonObject)
        : err('ERR_NOT_AN_OBJECT');

    const okIfInt = (value: unknown): Result<number, 'ERR_NOT_AN_INT'> =>
      Number.isInteger(value) ? ok(value as number) : err('ERR_NOT_AN_INT');

    const okIfPositive = (value: number): Result<number, 'ERR_NOT_POSITIVE'> =>
      value > 0 ? ok(value) : err('ERR_NOT_POSITIVE');

    const okIfNotEmptyStr = (
      value: unknown,
    ): Result<string, 'ERR_NOT_A_STRING' | 'ERR_EMPTY_STRING'> =>
      typeof value !== 'string'
        ? err('ERR_NOT_A_STRING')
        : value.length === 0
          ? err('ERR_EMPTY_STRING')
          : ok(value);

    type ValidationError<E extends string> = { path: string[]; code: E };

    const validationError = <E extends string>(
      path: string[],
      code: E,
    ): ValidationError<E> => ({ path, code });

    type PersonValidationError = ValidationError<
      | 'ERR_NOT_AN_OBJECT'
      | 'ERR_NOT_AN_INT'
      | 'ERR_NOT_POSITIVE'
      | 'ERR_NOT_A_STRING'
      | 'ERR_EMPTY_STRING'
    >;

    const okIfPerson = (
      value: unknown,
    ): Result<Person, PersonValidationError> =>
      Do(function* () {
        // eslint-disable-line func-names
        const object: JsonObject = yield* okIfObject(value).mapErr((error) =>
          validationError([], error),
        );

        const name = yield* okIfNotEmptyStr(object.name).mapErr((error) =>
          validationError(['name'], error),
        );

        const age = yield* okIfInt(object.age)
          .chain(okIfPositive)
          .mapErr((error) => validationError(['age'], error));

        return { name, age };
      });

    // const okIfPerson2 = (value: unknown): Result<Person, 'ERR_NOT_A_PERSON'> =>
    //   Do(function* okIfPersonJob() {
    //     const obj = yield* okIfObject(value);
    //     const name = yield* okIfNotEmptyStr(obj.name);
    //     const someInt = yield* okIfInt(obj.age);
    //     const age = yield* okIfPositive(someInt);

    //     return { name, age };
    //   }).mapErr(() => 'ERR_NOT_A_PERSON');

    const okIfPerson3 = (
      value: unknown,
    ): Result<Person, PersonValidationError> =>
      Do(function* () {
        // eslint-disable-line func-names
        const object = yield* okIfObject(value).mapErr((error) =>
          validationError([], error),
        );

        const name = yield* okIfNotEmptyStr(object.name).mapErr((error) =>
          validationError(['name'], error),
        );

        const age = yield* okIfInt(object.age)
          .chain(okIfPositive)
          .mapErr((error) => validationError(['age'], error));

        return { name, age };
      });

    it.each([
      [{ name: 'John', age: 42 }, ok({ name: 'John', age: 42 })],
      [
        { name: 'John', age: -42 },
        err({ path: ['age'], code: 'ERR_NOT_POSITIVE' }),
      ],
      [
        { name: '', age: 42 },
        err({ path: ['name'], code: 'ERR_EMPTY_STRING' }),
      ],
      [
        { name: 42, age: 42 },
        err({ path: ['name'], code: 'ERR_NOT_A_STRING' }),
      ],
      [{ name: 'John' }, err({ path: ['age'], code: 'ERR_NOT_AN_INT' })],
      [{ age: 42 }, err({ path: ['name'], code: 'ERR_NOT_A_STRING' })],
      ['', err({ path: [], code: 'ERR_NOT_AN_OBJECT' })],
    ])('returns %p for (%p)', (value, expected) => {
      expect(okIfPerson(value)).toEqual(expected);
    });

    it.each([
      [{ name: 'John', age: 42 }, ok({ name: 'John', age: 42 })],
      [
        { name: 'John', age: -42 },
        err({ path: ['age'], code: 'ERR_NOT_POSITIVE' }),
      ],
      [
        { name: '', age: 42 },
        err({ path: ['name'], code: 'ERR_EMPTY_STRING' }),
      ],
      [
        { name: 42, age: 42 },
        err({ path: ['name'], code: 'ERR_NOT_A_STRING' }),
      ],
      [{ name: 'John' }, err({ path: ['age'], code: 'ERR_NOT_AN_INT' })],
      [{ age: 42 }, err({ path: ['name'], code: 'ERR_NOT_A_STRING' })],
      ['', err({ path: [], code: 'ERR_NOT_AN_OBJECT' })],
    ])('v3 returns %p for (%p)', (value, expected) => {
      expect(okIfPerson3(value)).toEqual(expected);
    });
  });
});

describe('Do::async', () => {
  type Book = { id: string; title: string; authorIds: string[] };
  type Person = { id: string; name: string };
  type BookWithAuthors = Book & {
    authors: Person[];
  };

  const getAllBooks = async (): Promise<Result<Book[], never>> =>
    ok([
      { id: '1', title: 'The Lord of the Rings', authorIds: ['1', '2'] },
      { id: '2', title: 'The Silmarillion', authorIds: ['1', '3'] },
    ]);

  const getAllAuthors = async (): Promise<Result<Person[], never>> =>
    ok([
      { id: '1', name: 'J. R. R. Tolkien' },
      { id: '2', name: 'Christopher Tolkien' },
    ]);

  const getBook = (
    bookId: string,
  ): Promise<Result<Book, 'ERR_BOOK_NOT_FOUND'>> =>
    Do(async function* getBookJob() {
      const books = yield* await getAllBooks();
      const book = books.find(({ id }) => id === bookId);
      // if (book == null) return err('ERR_BOOK_NOT_FOUND' as const);

      return okIfExists(book, () => 'ERR_BOOK_NOT_FOUND' as const);
    });

  const getBook2 = (bookId: string): Promise<Result<Book, 'ERR_NOT_FOUND'>> =>
    Do(async function* getBookJob() {
      const books = yield* await getAllBooks();
      const book = books.find(({ id }) => id === bookId);
      // if (book == null) return err('ERR_BOOK_NOT_FOUND' as const);

      return okIfExists(book, () => 'ERR_NOT_FOUND' as const);
    });

  const findAuthorAmong = (authors: Person[]) => {
    const index = new Map(authors.map((author) => [author.id, author]));
    return (personId: string) =>
      okIfExists(index.get(personId), () => 'ERR_PERSON_NOT_FOUND' as const);
  };

  const getBookWithAuthors = (
    bookId: string,
  ): Promise<
    Result<BookWithAuthors, 'ERR_BOOK_NOT_FOUND' | 'ERR_PERSON_NOT_FOUND'>
  > =>
    Do(async function* getBookAuthorsJob() {
      const book = yield* await getBook(bookId);
      const authors = yield* await getAllAuthors();
      const bookAuthors: Person[] = yield* collect(
        book.authorIds.map(findAuthorAmong(authors)),
      );

      return { ...book, authors: bookAuthors };
    });

  const getBookWithAuthors2 = (
    bookId: string,
  ): Promise<
    Result<BookWithAuthors, 'ERR_BOOK_NOT_FOUND' | 'ERR_PERSON_NOT_FOUND'>
  > =>
    Do(async function* getBookAuthorsJob() {
      const book: Book = yield* await getBook2(bookId).then(
        mapErr(() => 'ERR_BOOK_NOT_FOUND' as const),
      );

      const authors = yield* await getAllAuthors();
      const bookAuthors = yield* collect(
        book.authorIds.map(findAuthorAmong(authors)),
      );

      return { ...book, authors: bookAuthors };
    });

  it('returns Lord of the Rings with list of authors', async () => {
    const result = await getBookWithAuthors('1');
    expect(result).toEqual(
      ok({
        id: '1',
        title: 'The Lord of the Rings',
        authorIds: ['1', '2'],
        authors: [
          { id: '1', name: 'J. R. R. Tolkien' },
          { id: '2', name: 'Christopher Tolkien' },
        ],
      }),
    );
  });

  it('returns Lord of the Rings with list of authors - v2', async () => {
    const result = await getBookWithAuthors2('1');
    expect(result).toEqual(
      ok({
        id: '1',
        title: 'The Lord of the Rings',
        authorIds: ['1', '2'],
        authors: [
          { id: '1', name: 'J. R. R. Tolkien' },
          { id: '2', name: 'Christopher Tolkien' },
        ],
      }),
    );
  });

  it('returns err(ERR_BOOK_NOT_FOUND) for non-existent book', async () => {
    const result = await getBookWithAuthors('3');
    expect(result).toEqual(err('ERR_BOOK_NOT_FOUND'));
  });

  it('returns err(ERR_BOOK_NOT_FOUND) for non-existent book - v2', async () => {
    const result = await getBookWithAuthors2('3');
    expect(result).toEqual(err('ERR_BOOK_NOT_FOUND'));
  });

  it('returns err(ERR_PERSON_NOT_FOUND) for non-existent author', async () => {
    const result = await getBookWithAuthors('2');
    expect(result).toEqual(err('ERR_PERSON_NOT_FOUND'));
  });

  it('returns err(ERR_PERSON_NOT_FOUND) for non-existent author - v2', async () => {
    const result = await getBookWithAuthors2('2');
    expect(result).toEqual(err('ERR_PERSON_NOT_FOUND'));
  });

  it('works with several returns', async () => {
    const getA = async (x: number): AsyncResult<[number], 'ERR_A'> =>
      x > 0 ? ok([x]) : err('ERR_A');
    const getB = async (x: number): AsyncResult<{ x: number }, 'ERR_B'> =>
      x < 0 ? ok({ x }) : err('ERR_B');

    const getC = (
      x: number,
    ): Promise<Result<number | [number], 'ERR_A' | 'ERR_B'>> =>
      Do(async function* getCJob() {
        if (Math.abs(x) % 3 === 0) return getA(x);
        const b = yield* await getB(x);
        return b.x;
      });

    const check: Expect<
      Equal<
        typeof getC,
        (x: number) => Promise<Result<number | [number], 'ERR_A' | 'ERR_B'>>
      >
    > = true;

    expect(check).toBe(true);
  });
});
