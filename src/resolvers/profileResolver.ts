// resolverMap.ts
import { IResolvers } from "graphql-tools";
import {
  ProfileType,
  UserType,
  Profile,
  RangeQuestionType,
  RangeQuestion,
} from "../models";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";
import { SubmitRangeQuestionType, UpdateProfileType } from "./types";
import {
  AuthenticationError,
  ApolloError,
  UserInputError,
} from "apollo-server-express";

const defaultResolver: IResolvers = {
  Query: {
    /**
     * Returns all range questions in the database
     */
    getAllRangeQuestions: async (): Promise<RangeQuestionType[]> => {
      try {
        const questions = await RangeQuestion.find({}).exec();
        return questions;
      } catch (err) {
        throw new ApolloError(err.message);
      }
    },
    /**
     * Queries for user profile based on token obtained from headers
     */
    getUserProfile: combineResolvers(
      isAuthenticated,
      async (root: void, args: void, context): Promise<ProfileType> => {
        const profile = await Profile.findOne({
          user: context.currentUser.id,
        }).exec();
        if (!profile) throw new AuthenticationError("User is not valid");

        try {
          return profile;
        } catch (err) {
          throw new ApolloError(err.message);
        }
      }
    ),
  },
  Mutation: {
    /**
     * Submits a change to the profile's rangeQuestions
     * Order refers to the index in the array
     * Value is the value to change it to
     */
    submitRangeQuestion: combineResolvers(
      isAuthenticated,
      async (
        root: void,
        args: SubmitRangeQuestionType,
        context
      ): Promise<number[]> => {
        if (args.order > 299 || args.order < 0)
          throw new UserInputError("Invalid order number");
        if (args.value > 5 || args.value < 0)
          throw new UserInputError("Invalid response");

        const profile = await Profile.findOne({
          user: context.currentUser.id,
        }).exec();
        if (!profile) throw new AuthenticationError("User is not valid");

        profile.rangeQuestions[args.order] = args.value;
        profile.markModified("rangeQuestions");

        try {
          const savedProfile = await profile.save();
          return savedProfile.rangeQuestions;
        } catch (err) {
          throw new ApolloError(err.message);
        }
      }
    ),
    /**
     * Updates the user's profile with the optional fields:
     * userHobbies, userFaculty and userYearOfStudy
     */
    updateProfileField: combineResolvers(
      isAuthenticated,
      async (
        root: void,
        args: UpdateProfileType,
        context
      ): Promise<boolean> => {
        const profile = await Profile.findOne({
          user: context.currentUser.id,
        }).exec();
        if (!profile) throw new AuthenticationError("User is not valid");

        (Object.keys(args) as Array<keyof typeof args>).forEach((key) => {
          if (args[key]) {
            profile.set(key, args[key]);
            profile.markModified(key);
          }
        });

        try {
          await profile.save();
          return true;
        } catch (err) {
          throw new ApolloError(err.message);
        }
      }
    ),
  },
  Profile: {
    user: async (root: ProfileType): Promise<UserType> => {
      return (await root.populate("user").execPopulate()).user;
    },
  },
};

export default defaultResolver;
