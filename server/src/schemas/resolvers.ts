//boilerplate code used from M18A28
import User, { UserDocument } from '../models/User.js';
import { signToken } from '../services/auth.js';

// interface Context {
//   user?: User; // Optional user profile in context
// }

// resolvers
const resolvers = {
  Query: {
    // get single user
    me: async (_parent: any, _args: any, context: any): Promise<UserDocument[] | null> => {
      return context.user;
    },
  },
  Mutation: {
    // add a user
    addUser: async (_parent: any, args: any): Promise<{ token: string; user: UserDocument }> => {
      try {
        // create user with args
        const user = await User.create(args);
        if (!user) {
          throw new Error('Error creating user');
        }
        // create token
        const token = signToken(user.username, user.email, user._id);
        // returns the user and the token
        return { token, user };
      } catch (err) {
        console.error(err);
        throw new Error('Error creating user');
      }
    },

    login: async (_parent: any, args: any): Promise<{ token: string; user: UserDocument }
    > => {
      try {
        // Find the user by email
        const email = args.email;
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error('Invalid email or password');
        }
        // Compare the provided password with the stored hash
        const validPassword = await user.isCorrectPassword(args.password); // Assuming you have a method like this in your User model

        if (!validPassword) {
          throw new Error('Invalid email or password');
        }

        // create token after successful authentication
        const token = signToken(user.username, user.email, user._id);

        // returns the user and the token
        return { token, user };
      } catch (err) {
        console.error(err);
        throw new Error('Error creating user');
      }
    },

    saveBook: async (_parent:any, args:any, context: any): Promise<{ user: any }
    > => {
      try {
        const user = context.user; // get user from context

        // Destructure the book data from the args (you should pass book data as arguments)
        const { bookId, authors, description, title, image, link } = args;

        // Create the new book object to save
        const newBook = { bookId, authors, description, title, image, link };

        // find user by id and update the book set
        const updatedUser = await User.findOneAndUpdate(
          {_id: user._id },
          { $addToSet: { savedBooks: newBook } },
          { new: true, runValidators: true }
        );

        // return the updated user
        return { user: updatedUser};
      } catch (err) {
        console.error(err);
        throw new Error('Error creating user');
      }
    },

    // removeBook: async (_parent:any, args:any, context: any): Promise<{ user: any }
    // > => {
    //   try {
        
    //   } catch (err) {
    //     console.error(err);
    //     throw new Error('Error creating user');
    //   }
    // }
  },
};

export default resolvers;
