const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await (await User.findOne({ _id: context.user._id }).select('-__v -password')).populated('savedJobs');

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
    allJobs: async () => {
      return Jobs.find().sort({ created_at: -1 })
    },
    searchJobs: async (parent, { title, location, type }) => {
      const params = title ? { title } : {} && location ? { location } : {} && type ? { type } : {};
      return Jobs.find(params).sort({ created_at: -1 });
    },
    // savedJobs: async (parent, { saved }) => {
    //   return Jobs.find(saved).sort({created_at: -1});
    // },
    job: async (parent, { job_id }) => {
      return Jobs.findOne(job_id)
    }
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { username, password }) => {
      const user = await User.findOne({ username });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },

    saveJob: async (parent, { input }, context) => {
      if (context.user) {

        const updatedUser = await User.findByIdAndUpdate(
          { _id: context.user._id},
          { $addToSet: { savedJobs: input } },
          { new: true }
        ).populate('savedJobs');
        return updatedUser;
      }
      throw new AuthenticationError('You must log in to save a job.');
    },

appliedJob: async (parent, { input }, context) => {
  if (context.user) {

    const updatedUser = await User.findByIdAndUpdate(
      { _id: context.user._id},
      { $addToSet: { appliedJob: input } },
      { new: true }
    ).populate('appliedJob');
    return updatedUser;
  }
  throw new AuthenticationError('You must be logged in to manage your jobs.');
},

removeJob: async (parent, { jobId }, context) => {
  if (context.user) {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: context.user._id },
      { $pull: { savedJobs: { job_id: jobId } } },
      { new: true }
    );
    return updatedUser;
  }
  throw new AuthenticationError('You must be logged into manage your jobs.');
}
  },

};

module.exports = resolvers;