//boilerplate code used from M18A28
import User, { UserDocument } from '../models/User.js';
import { signToken } from '../services/auth.js';

// resolvers
const resolvers = {
  Query: {
    // get single user
    me: async (_parent: any, _args: any, context: any) => {
      console.log('context.user', context.user);
      // Use context of current user from client to find user by id in db
      const user = await User.findById(context.user._id)
        .populate('savedBooks'); // Populate savedBookss

      if (!user) {
        console.log('No user found with the provided ID');
        return context;
      }
      console.log('user from get me resolver before send to client', user);
      return user;
    },
  },
  Mutation: {
    // add a user
    addUser: async (_parent: any, args: any): Promise<{ token: string; user: UserDocument }> => {
      try {
        if (!args.username || !args.email || !args.password) {
          throw new Error('All fields are required');
        }
        const existingUser = await User.findOne({ email: args.email });
        if (existingUser) {
          throw new Error('User already exists');
        }
        const submission = {
          username: args.username,
          email: args.email,
          password: args.password
        }
        // create user with submission args
        const user = await User.create(submission);
        // create token
        const token = signToken(user.username, user.email, user._id);
        return { token, user };
      } catch (err) {
        console.error(err);
        throw new Error('Error creating user');
      }
    },
    // login a user
    login: async (_parent: any, args: any): Promise<{ token: string; user: UserDocument }
    > => {
      try {
        // find the user by email
        const email = args.email;
        const user = await User.findOne({ email });

        if (!user) {
          throw new Error('Invalid email or password');
        }
        // compare the provided password with the stored hash
        const validPassword = await user.isCorrectPassword(args.password);

        if (!validPassword) {
          throw new Error('Invalid email or password');
        }

        // create the token after successful authentication
        const token = signToken(user.username, user.email, user._id);

        return { token, user };
      } catch (err) {
        console.error(err);
        throw new Error('Error creating user');
      }
    },
    // save a book
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
    // remove a book
    removeBook: async (_parent:any, args:any, context: any) => {
      try {
        const user = context.user;

        // find user by id and update the book set
        const updatedUser = await User.findOneAndUpdate(
          {_id: user._id },
          // pull book off set by Id, pull bookId off of args
          { $pull: { savedBooks: { bookId: args.bookId} } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      } catch (err) {
        console.error(err);
        throw new Error('Error creating user');
      }
    }
  },
};

export default resolvers;
