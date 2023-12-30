import { describe, it, expect } from '@jest/globals';
import { Equal, Expect } from '@type-challenges/utils';
import { ok } from './Ok';
import { err } from './Err';
import { AsyncResult, Result } from './types';
import { collect } from './lists';
import { asyncDo } from './async-do-gen';
import { okIfExists } from './conditional';

describe('AsyncDo', () => {
  type Book = { id: string; title: string; authorIds: string[] };
  type Person = { id: string; name: string; };
  type BookWithAuthors = Book & {
    authors: Person[]
  };

  const getAllBooks = async (): Promise<Result<Book[], never>> => ok([
    { id: '1', title: 'The Lord of the Rings', authorIds: ['1', '2'] },
    { id: '2', title: 'The Silmarillion', authorIds: ['1', '3'] },
  ]);

  const getAllAuthors = async (): Promise<Result<Person[], never>> => ok([
    { id: '1', name: 'J. R. R. Tolkien' },
    { id: '2', name: 'Christopher Tolkien' },
  ]);

  const getBook = (bookId: string): Promise<Result<Book, 'ERR_BOOK_NOT_FOUND'>> =>
    asyncDo(async function* getBookJob(_) {
      const books = yield* _(getAllBooks());
      const book = books.find(({ id }) => id === bookId);
      // if (book == null) return err('ERR_BOOK_NOT_FOUND' as const);

      return okIfExists(book, () => 'ERR_BOOK_NOT_FOUND' as const);
    });

  const findAuthorAmong = (
    authors: Person[],
  ) => {
    const index = new Map(authors.map((author) => [author.id, author]));
    return (personId: string) =>
      okIfExists(
        index.get(personId),
        () => 'ERR_PERSON_NOT_FOUND' as const,
      );
  };

  const getBookWithAuthors = (
    bookId: string,
  ): Promise<Result<BookWithAuthors, 'ERR_BOOK_NOT_FOUND' | 'ERR_PERSON_NOT_FOUND'>> =>
    asyncDo(async function* getBookAuthorsJob(_) {
      const book = yield* _(getBook(bookId));
      const authors = yield* _(getAllAuthors());
      const bookAuthors = yield* _(collect(
        book.authorIds.map(findAuthorAmong(authors)),
      ));

      return { ...book, authors: bookAuthors };
    });

  it('returns Lord of the Rings with list of authors', async () => {
    const result = await getBookWithAuthors('1');
    expect(result).toEqual(ok({
      id: '1',
      title: 'The Lord of the Rings',
      authorIds: ['1', '2'],
      authors: [
        { id: '1', name: 'J. R. R. Tolkien' },
        { id: '2', name: 'Christopher Tolkien' },
      ],
    }));
  });

  it('returns err(ERR_BOOK_NOT_FOUND) for non-existent book', async () => {
    const result = await getBookWithAuthors('3');
    expect(result).toEqual(err('ERR_BOOK_NOT_FOUND'));
  });

  it('returns err(ERR_PERSON_NOT_FOUND) for non-existent author', async () => {
    const result = await getBookWithAuthors('2');
    expect(result).toEqual(err('ERR_PERSON_NOT_FOUND'));
  });

  it('works with several returns', async () => {
    const getA = async (x: number): AsyncResult<[number], 'ERR_A'> => (
      x > 0 ? ok([x]) : err('ERR_A')
    );
    const getB = async (x: number): AsyncResult<{ x: number }, 'ERR_B'> => (
      x < 0 ? ok({ x }) : err('ERR_B')
    );

    const getC = (x: number): Promise<Result<number | [number], 'ERR_A' | 'ERR_B'>> =>
      asyncDo(async function* getCJob(_) {
        if (Math.abs(x) % 3 === 0) return getA(x);
        const b = yield* _(getB(x));
        return b.x;
      });

    const check: Expect<Equal<
      typeof getC,
      (x: number) => Promise<Result<number | [number], 'ERR_A' | 'ERR_B'>>
    >> = true;

    expect(check).toBe(true);
  });
});
