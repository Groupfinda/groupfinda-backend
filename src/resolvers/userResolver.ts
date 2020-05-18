// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { User, UserType, TokenType, Profile, RangeQuestion } from "../models";
import {
  UserInputError,
  ApolloError,
  ForbiddenError,
} from "apollo-server-express";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";

const userResolver: IResolvers = {
  Query: {
    /**
     * Queries for user based on token obtained from headers
     * If context has no currentUser, returns null
     */
    me: async (root: void, args: void, context): Promise<UserType | null> => {
      if (!context.currentUser) return null;
      const user = await User.findById(context.currentUser.id).exec();
      return user;
    },
  },
  Mutation: {
    /**
     * Creates a user with specified arguments.
     * Generates user profile and links their documents together
     * Generates token to be returned to user for authentication
     *
     * VALIDATION: Unique Username, Unique Email
     */
    createUser: async (
      root: void,
      args: {
        username: string;
        password: string;
        confirmPassword: string;
        firstName: string;
        lastName: string;
        email: string;
        gender: string;
        birthday: Date;
      }
    ): Promise<TokenType> => {
      // Ensures all input fields are given
      if (
        !args.username ||
        !args.password ||
        !args.confirmPassword ||
        !args.firstName ||
        !args.lastName ||
        !args.email ||
        !args.gender ||
        !args.birthday
      ) {
        throw new UserInputError("Missing required fields", {
          invalidArgs: Object.keys(args),
        });
      }

      // Check if passwords match
      if (args.password !== args.confirmPassword) {
        throw new UserInputError("Passwords do not match", {
          invalidArgs: [args.password, args.confirmPassword],
        });
      }

      // Check if email already exists
      const emailExists = await User.findOne({ email: args.email }).exec();
      if (emailExists) {
        throw new UserInputError("Email has already been registered", {
          invalidArgs: args.email,
        });
      }

      // Check if username already exists
      const usernameExists = await User.findOne({
        username: args.username,
      }).exec();
      if (usernameExists) {
        throw new UserInputError("Username is taken", {
          invalidArgs: args.username,
        });
      }

      const user = new User(args);
      const profile = new Profile({
        user: user.id,
        rangeQuestions: new Array(
          await RangeQuestion.countDocuments({}).exec()
        ).fill(0),
        userHobbies: [],
        userFaculty: null,
        userYearOfStudy: null,
      });
      user.profile = profile.id;
      try {
        await profile.save();
        const savedUser = await user.save();
        return savedUser.tokenize();
      } catch (err) {
        throw new ApolloError("Failed to save user " + err.message);
      }
    },
    /**
     * Handles user log in
     *
     * Generates token to be returned to user for authentication
     */
    loginUser: async (
      root: void,
      args: {
        username: string;
        password: string;
      }
    ): Promise<TokenType> => {
      try {
        const user = await User.findOne({ username: args.username }).exec();
        if (!user) throw new Error();
        const passwordMatch = await user.comparePassword(args.password);
        if (!passwordMatch) throw new Error();
        return user.tokenize();
      } catch (err) {
        throw new UserInputError("Invalid username or password", {
          invalidArgs: Object.keys(args),
        });
      }
    },
    /**
     * Checks if both username and email match in the document.
     *
     * Sends an email with a randomly generated password to the user.
     */
    forgetPassword: async (
      root: void,
      args: {
        username: string;
        email: string;
      }
    ): Promise<boolean> => {
      //TODO
      return true;
    },
    /**
     * Confirms that previous password matches.
     *
     * Updates password to be new password. Make sure to use .save() for mongoose
     * pre-hook to take effect.
     */
    resetPassword: combineResolvers(
      isAuthenticated,
      async (
        root: void,
        args: {
          originalPassword: string;
          newPassword: string;
          confirmNewPassword: string;
        },
        context
      ): Promise<boolean> => {
        if (args.newPassword !== args.confirmNewPassword) {
          throw new UserInputError("Passwords do not match", {
            invalidArgs: [args.newPassword, args.confirmNewPassword],
          });
        }
        try {
          const user = await User.findById(context.currentUser.id).exec();
          if (!user) throw new Error("User not found");
          const correctPassword = await user.comparePassword(
            args.originalPassword
          );
          if (!correctPassword) throw new Error("Password is incorrect");
          user.password = args.newPassword;
          await user.save();
          return true;
        } catch (err) {
          throw new ForbiddenError(err.message);
        }
      }
    ),
    /**
     * Deletes a user based on username.
     * Deletes associated user profile as well.
     * Mostly for testing.
     */
    deleteUser: async (
      root: void,
      args: {
        username: string;
      }
    ): Promise<boolean> => {
      try {
        const user = await User.findOne({ username: args.username }).exec();
        if (!user) throw new Error();
        const profile = await Profile.findById(user.profile).exec();
        if (!profile) throw new Error();
        await user.remove();
        await profile.remove();
      } catch (err) {
        throw new UserInputError("No such user found", {
          invalidArgs: args.username,
        });
      }
      return true;
    },
  },
};

export default userResolver;
