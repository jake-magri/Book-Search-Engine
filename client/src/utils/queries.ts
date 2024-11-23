import { gql } from '@apollo/client';

export const GET_ME = gql`
  query Me {
  me {
    username
    email
    savedBooks {
      authors
      description
      title
      image
      link
    }
    bookCount
  }
}
`;