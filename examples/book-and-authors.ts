import { AsyncResult, Do, collect, err, ok } from 'okerr-ts';

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
    const authorResults = await Promise.all(
      book.authorIds.map(fetchPerson), // Fetch authors in parallel
    );
    const authors = yield* collect(authorResults);

    return { ...book, authors };
  });

const fixtures = {
  books: [
    {
      id: 'book-1',
      title: 'The Lord of the Rings',
      authorIds: ['person-1', 'person-2'],
    },
    {
      id: 'book-2',
      title: 'The Silmarillion',
      authorIds: ['person-1', 'person-3'],
    },
  ],
  persons: [
    { id: 'person-1', name: 'J. R. R. Tolkien' },
    { id: 'person-2', name: 'Christopher Tolkien' },
  ],
};

async function fetchBook(
  bookId: string,
): AsyncResult<Book, 'ERR_BOOK_NOT_FOUND'> {
  const book = fixtures.books.find(({ id }) => id === bookId);

  return book != null ? ok(book) : err('ERR_BOOK_NOT_FOUND');
}

async function fetchPerson(
  personId: string,
): AsyncResult<Person, 'ERR_PERSON_NOT_FOUND'> {
  const person = fixtures.persons.find(({ id }) => id === personId);

  return person != null ? ok(person) : err('ERR_PERSON_NOT_FOUND');
}

async function run() {
  const LordOfTheRings = await getBookWithAuthors('book-1');
  console.log(LordOfTheRings.unwrap());
  // Prints to console book with authors populated

  const Silmarillion = await getBookWithAuthors('book-2');
  console.log(Silmarillion.unwrapErr());
  // Prints to console: ERR_PERSON_NOT_FOUND

  const TheHobbit = await getBookWithAuthors('book-3');
  console.log(TheHobbit.unwrapErr());
  // Prints to console: ERR_BOOK_NOT_FOUND
}

run().catch(console.error);
