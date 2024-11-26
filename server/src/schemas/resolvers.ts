//boilerplate code used from M18A28
import User, { UserDocument } from '../models/User.js';
import { signToken } from '../services/auth.js';

// resolvers
const resolvers = {
  Query: {
    // get single user
    me: async (_parent: any, _args: any, context: any): Promise<UserDocument[] | null> => {
      console.log(context.user);
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
        // Finds the user by email
        const email = args.email;
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error('Invalid email or password');
        }
        // Compares the provided password with the stored hash
        const validPassword = await user.isCorrectPassword(args.password);

        if (!validPassword) {
          throw new Error('Invalid email or password');
        }

        // Creates token after successful authentication
        const token = signToken(user.username, user.email, user._id);

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
        // book data passed as args
        const { bookId, authors, description, title, image, link } = args;
        const newBook = { bookId, authors, description, title, image, link };

        // finds user by id and update the book set
        const updatedUser = await User.findOneAndUpdate(
          {_id: user._id },
          { $addToSet: { savedBooks: newBook } },
          { new: true, runValidators: true }
        );

        return { user: updatedUser};
      } catch (err) {
        console.error(err);
        throw new Error('Error creating user');
      }
    },

    removeBook: async (_parent:any, args:any, context: any): Promise<{ user: any }
    > => {
      try {
        const user = context.user;

        // find user by id and update the book set
        const updatedUser = await User.findOneAndUpdate(
          {_id: user._id },
          // pull book off set by Id, pull bookId off of args
          { $pull: { savedBooks: { bookId: args.bookId} } },
          { new: true, runValidators: true }
        );

        return { user: updatedUser};
      } catch (err) {
        console.error(err);
        throw new Error('Error creating user');
      }
    }
  },
};

export default resolvers;
