// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { User, UserType, TokenType, Profile, ProfileType } from "../models";
import {
  UserInputError,
  ApolloError,
  AuthenticationError,
} from "apollo-server-express";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";
import { extractEmptyFields } from "./helpers/util";
import {
  CreateUserType,
  LoginUserType,
  ForgetPasswordType,
  ResetPasswordType,
  DeleteUserType,
} from "./types";

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
      args: CreateUserType
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
        throw new UserInputError("Input fields must not be empty", {
          invalidArgs: extractEmptyFields(args),
        });
      }

      // Make sure username is at least length 6
      if (args.username.length < 6) {
        throw new UserInputError("Username must be at least 6 characters", {
          invalidArgs: ["username"],
        });
      }

      // Make sure password is at least length 6
      if (args.password.length < 6) {
        throw new UserInputError("Password must be at least 6 characters", {
          invalidArgs: ["password"],
        });
      }

      // Check if passwords match
      if (args.password !== args.confirmPassword) {
        throw new UserInputError("Passwords do not match", {
          invalidArgs: ["password", "confirmPassword"],
        });
      }

      // Check if email is of valid format
      if (!args.email.includes("@")) {
        throw new UserInputError("Email is not of valid format", {
          invalidArgs: ["email"],
        });
      }

      // Check if email already exists
      const emailExists = await User.findOne({ email: args.email }).exec();
      if (emailExists) {
        throw new UserInputError("Email has already been registered", {
          invalidArgs: ["email"],
        });
      }

      // Check if username already exists
      const usernameExists = await User.findOne({
        username: args.username,
      }).exec();
      if (usernameExists) {
        throw new UserInputError("Username is taken", {
          invalidArgs: ["username"],
        });
      }

      const user = new User(args);
      const profile = new Profile({
        user: user.id,
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
    loginUser: async (root: void, args: LoginUserType): Promise<TokenType> => {
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
      args: ForgetPasswordType
    ): Promise<boolean> => {
      if (!args.username || !args.email) {
        throw new UserInputError("Input fields must not be empty", {
          invalidArgs: extractEmptyFields(args),
        });
      }

      let user: UserType | null = null;
      try {
        user = await User.findOne({ username: args.username }).exec();
      } catch (err) {
        throw new ApolloError(err.message);
      }
      if (!user) {
        throw new UserInputError("No such user", {
          invalidArgs: ["username"],
        });
      }
      if (user.username !== args.username || user.email !== args.email) {
        throw new UserInputError("No such combination of username and email", {
          invalidArgs: ["username", "email"],
        });
      }
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
        args: ResetPasswordType,
        context
      ): Promise<boolean> => {
        if (args.newPassword !== args.confirmNewPassword) {
          throw new UserInputError("Passwords do not match", {
            invalidArgs: ["newPassword", "confirmNewPassword"],
          });
        }

        let user: UserType | null;
        try {
          user = await User.findById(context.currentUser.id).exec();
        } catch (err) {
          throw new AuthenticationError(err.message);
        }
        if (!user) throw new AuthenticationError("User not found");
        const correctPassword = await user.comparePassword(
          args.originalPassword
        );
        if (!correctPassword)
          throw new UserInputError("Password is incorrect", {
            invalidArgs: ["originalPassword"],
          });
        user.password = args.newPassword;
        try {
          await user.save();
        } catch (err) {
          throw new ApolloError(err.message);
        }

        return true;
      }
    ),
    /**
     * Deletes a user based on username.
     * Deletes associated user profile as well.
     * Mostly for testing.
     */
    deleteUser: async (root: void, args: DeleteUserType): Promise<boolean> => {
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
  User: {
    profile: async (root: UserType): Promise<ProfileType> => {
      return (await root.populate("profile").execPopulate()).profile;
    },
  },
};

export default userResolver;
