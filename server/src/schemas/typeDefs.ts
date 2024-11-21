const typeDefs = `
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int
    savedBooks:[Book]
  }

  type Book {
    bookId: ID!
    authors: String!
    description: String!
    title: String!
    image: String!
    link: String!
  }

  type Auth {
    token: String!
    user: User
  }

  type Query {
  # Fetch the current authenticated user's information
  me: User

  # Fetch the list of saved books for a user by their ID
  savedBooks: [Book] 

  # Fetch all users
  users: [User]

  # Fetch a specific user by ID (optional, for more detailed queries)
  user(_id: ID!): User
  }

  # Define Mutation type
type Mutation {
  # Authenticate user with email and password
  login(email: String!, password: String!): Auth

  # Register a new user with username, email, and password
  addUser(username: String!, email: String!, password: String!): Auth

  # Save a book to the user's list of saved books
  saveBook(bookId: ID!, authors: [String]!, description: String!, title: String!, image: String!, link: String!): User

  # Remove a book from the user's saved books
  removeBook(bookId: ID!): User
}

# Define Input Types for mutation arguments
input BookInput {
  bookId: ID!
  authors: [String]!
  description: String!
  title: String!
  image: String!
  link: String!
}
`;

export default typeDefs;
