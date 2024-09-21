/* eslint-disable @typescript-eslint/no-unused-vars */
import { AsyncResult, Do, collect, err, ok } from '@cardellini/ts-result';

type Book = {
  id: string;
  title: string;
  authorIds: string[];
};

type Person = {
  id: string;
  name: string;
};

const getBookWithAuthors = (bookId: string) =>
  Do(async function* () {
    const book = yield* await fetchBook(bookId);
    const authors = yield* await fetchPersons(book.authorIds);

    return { ...book, authors };
  });

const getBookWithAuthors2 = (
  bookId: string,
): AsyncResult<
  Book & { authors: Person[] },
  'ERR_BOOK_NOT_FOUND' | 'ERR_PERSON_NOT_FOUND'
> =>
  Do(async function* () {
    const book = yield* await fetchBook(bookId);
    const authors = yield* await fetchPersons(book.authorIds);

    return { ...book, authors };
  });

const fetchBook = async (id: string) =>
  id === '1'
    ? ok<Book>({ id, title: 'The Lord of the Rings', authorIds: ['1', '2'] })
    : id === '2'
      ? ok<Book>({ id, title: 'The Silmarillion', authorIds: ['1', '3'] })
      : err('ERR_BOOK_NOT_FOUND' as const);

const fetchPersons = async (ids: string[]) =>
  collect(
    ids.map((id) =>
      id === '1'
        ? ok({ id, name: 'J. R. R. Tolkien' })
        : id === '2'
          ? ok({ id, name: 'Christopher Tolkien' })
          : err('ERR_PERSON_NOT_FOUND' as const),
    ),
  );

async function run() {
  const LordOfTheRings = await getBookWithAuthors('1');
  console.log(LordOfTheRings.unwrap());
  // Prints to console book with authors populated

  const Silmarillion = await getBookWithAuthors('2');
  console.log(Silmarillion.unwrapErr());
  // Prints to console: ERR_PERSON_NOT_FOUND

  const TheHobbit = await getBookWithAuthors('3');
  console.log(TheHobbit.unwrapErr());
  // Prints to console: ERR_BOOK_NOT_FOUND
}

run().catch(console.error);
