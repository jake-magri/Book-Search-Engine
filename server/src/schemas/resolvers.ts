//boilerplate code used from M18A28
import User, { UserDocument } from '../models/User.js';
import { signToken } from '../services/auth.js';

// interface Context {
//   user?: User; // Optional user profile in context
// }

// resolvers
const resolvers = {
  Query: {
    // find one user
    user: async (_parent: any, { _id }: { _id: string }): Promise<UserDocument[] | null> => {
      const params = _id ? { _id } : {};
      return User.findOne(params);
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
    }
    // createVote: async (_parent: any, { _id, techNum }: { _id: string, techNum: number}): Promise<IMatchup | null> => {
    //   const vote = await Matchup.findOneAndUpdate(
    //     { _id },
    //     { $inc: { [`tech${techNum}_votes`]: 1 } },
    //     { new: true }
    //   );
    //   return vote;
    // },
  },
};

export default resolvers;
