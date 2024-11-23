import { useQuery, useMutation } from '@apollo/client';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { GET_ME } from '../utils/queries'; // Make sure this query is defined
import { REMOVE_BOOK } from '../utils/mutations'; // Make sure this mutation is defined
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';
import type { Book } from '../models/Book';

const SavedBooks = () => {
  // Query user data
  const { loading, data, error } = useQuery<{ me: User }>(GET_ME);
  const userData: User = data?.me || { username: '', email: '', password: '', savedBooks: [] };

  // Mutation to remove book
  const [removeBook] = useMutation(REMOVE_BOOK, {
    update(cache, { data: { removeBook } }) {
      // Read the current GET_ME query from the cache
      const cachedData = cache.readQuery<{ me: User }>({ query: GET_ME }) || { me: { savedBooks: [] } };

      if (cachedData.me && cachedData.me.savedBooks) {
        // Write the updated data back to the cache
        cache.writeQuery({
          query: GET_ME,
          data: {
            me: {
              ...cachedData.me,
              savedBooks: cachedData.me.savedBooks.filter(
                (book: Book) => book.bookId !== removeBook.bookId
              ),
            },
          },
        });
      }
    },
  });

  // Handle book deletion
  const handleDeleteBook = async (bookId: string) => {
    try {
      const token = Auth.loggedIn() ? Auth.getToken() : null;


      if (!token) {
        return false;
      }

      // Execute the removeBook mutation
      await removeBook({
        variables: { bookId },
      });

      // Remove the book ID from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle loading and error states
  if (loading) return <h2>Loading...</h2>;
  if (error) return <h2>Error: {error.message}</h2>;

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'
            }`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks?.map((book) => {
            return (
              <Col md='4'>
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )
          }
          )}

        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
