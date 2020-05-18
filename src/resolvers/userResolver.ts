// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { User, UserType, TokenType } from "../models";

const userResolver: IResolvers = {
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
      //TODO
      return { token: "TODO" };
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
      //TODO
      return { token: "TODO" };
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
    resetPassword: async (
      root: void,
      args: {
        originalPassword: string;
        newPassword: string;
        confirmNewPassword: string;
      }
    ): Promise<boolean> => {
      //TODO
      return true;
    },
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
      //TODO
      return true;
    },
  },
};

export default userResolver;
