/* eslint-disable max-len, object-curly-newline, func-names */
import { Result, asyncDo, expectExists, collect, okIfExists, collectAsync } from '@cardellini/ts-result';

type Book = { id: string; title: string; authorIds: string[] };
type Person = { id: string; name: string; };

type GetBookWithAuthorsRes = Result<
  Book & { authors: Person[] },
  'ERR_BOOK_NOT_FOUND' | 'ERR_PERSON_NOT_FOUND'
>;

const getBookWithAuthors = (bookId: string): Promise<GetBookWithAuthorsRes> =>
  asyncDo(async function* (_) {
    const book = yield* _(fetchBook(bookId).then(
      expectExists('ERR_BOOK_NOT_FOUND')
    ));

    const persons = await fetchPersons(book.authorIds);

    const authors = yield* _(collect(
      persons.map(person => okIfExists(person, 'ERR_PERSON_NOT_FOUND' as const))
    ));

    return { ...book, authors };
  });

// emulating an api call
const fetchBook = async (id: string): Promise<Book | null> => (
  id === '1' ? { id, title: 'The Lord of the Rings', authorIds: ['1', '2'] } :
  id === '2' ? { id, title: 'The Silmarillion', authorIds: ['1', '3'] } :
  null
);

// emulating a bulk fetch to avoid N+1 queries
const fetchPersons = async (ids: string[]): Promise<(Person | null)[]> =>
  ids.map(id => (
    id === '1' ? { id, name: 'J. R. R. Tolkien' } :
    id === '2' ? { id, name: 'Christopher Tolkien' } :
    null
  ));

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
