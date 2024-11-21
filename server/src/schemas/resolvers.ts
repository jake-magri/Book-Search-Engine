//boilerplate code used from M18A28
import User, { UserDocument } from '../models/User.js';
import { signToken } from '../services/auth.js';
// resolvers
const resolvers = {
  Query: {
    // find one user
    user: async (_parent: any, { _id }: {_id: string}): Promise<UserDocument[] | null> => {
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
