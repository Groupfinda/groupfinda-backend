import * as userApi from "./userApi";
import * as profileApi from "./profileApi";
import { Profile, User, RangeQuestion } from "../models";
import { validUser, validUserCredentials } from "./data";
import { mongoConnectWithRetry } from "../mongoose";
import questions from "../seed/questions";
import mongoose from "mongoose";
import { SubmitRangeQuestionType, UpdateProfileType } from "../resolvers/types";

beforeAll(async () => {
  await mongoConnectWithRetry();
  await User.deleteMany({});
  await Profile.deleteMany({});
  await RangeQuestion.deleteMany({});
  await RangeQuestion.insertMany(questions);
  await userApi.createUser(validUser);
});

describe("Profile", () => {
  describe(`getAllRangeQuestions: [RangeQuestion]!`, () => {
    test("returns all range questions (300)", async () => {
      const result = await profileApi.getAllRangeQuestions();

      expect(result.data.data.getAllRangeQuestions.length).toBe(300);
      expect(result.data.data.getAllRangeQuestions[0].content).toBe(
        "I make friends easily."
      );
      expect(result.data.data.getAllRangeQuestions[0].order).toBe(0);
    });
  });

  describe(`getUserProfile: Profile!`, () => {
    test("returns user profile correctly", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const result = await profileApi.getUserProfile(token);

      expect(result.data.data.getUserProfile.user.username).toBe("username");
      expect(result.data.data.getUserProfile.rangeQuestions.length).toBe(300);
      expect(result.data.data.getUserProfile.rangeQuestions).toStrictEqual(
        new Array(300).fill(0)
      );
      expect(result.data.data.getUserProfile.eventPreferences).toStrictEqual(
        {}
      );
      expect(result.data.data.getUserProfile.userHobbies).toStrictEqual([]);
      expect(result.data.data.getUserProfile.userFaculty).not.toBeTruthy();
      expect(result.data.data.getUserProfile.userYearOfStudy).not.toBeTruthy();
    });

    test("returns error if not authenticated", async () => {
      const result = await profileApi.getUserProfile();

      expect(result.data.errors[0].message).toBe(
        "Authentication as user failed"
      );
    });
  });

  describe(`submitRangeQuestion(order: Int!, value: Int!): [Int]!`, () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await Profile.deleteMany({});
      await userApi.createUser(validUser);
    });

    test("correctly updates array on successful request", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables: SubmitRangeQuestionType = {
        order: 100,
        value: 4,
      };
      const result = await profileApi.submitRangeQuestion(variables, token);
      expect(result.data.data.submitRangeQuestion.length).toBe(300);
      const expectedArray = new Array(300).fill(0);
      expectedArray[100] = 4;
      expect(result.data.data.submitRangeQuestion).toStrictEqual(expectedArray);

      const profile = await Profile.findOne({}).lean();
      expect(profile?.rangeQuestions).toStrictEqual(expectedArray);
    });

    test("fails to update when order number is greater than 299", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables: SubmitRangeQuestionType = {
        order: 300,
        value: 4,
      };
      const result = await profileApi.submitRangeQuestion(variables, token);
      expect(result.data.errors[0].message).toBe("Invalid order number");
      const expectedArray = new Array(300).fill(0);
      const profile = await Profile.findOne({}).lean();
      expect(profile?.rangeQuestions).toStrictEqual(expectedArray);
    });

    test("fails to update when order number is less than 0", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables: SubmitRangeQuestionType = {
        order: -1,
        value: 4,
      };
      const result = await profileApi.submitRangeQuestion(variables, token);
      expect(result.data.errors[0].message).toBe("Invalid order number");
      const expectedArray = new Array(300).fill(0);
      const profile = await Profile.findOne({}).lean();
      expect(profile?.rangeQuestions).toStrictEqual(expectedArray);
    });

    test("fails to update when value number is less than 0", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables: SubmitRangeQuestionType = {
        order: 100,
        value: -1,
      };
      const result = await profileApi.submitRangeQuestion(variables, token);
      expect(result.data.errors[0].message).toBe("Invalid response");
      const expectedArray = new Array(300).fill(0);
      const profile = await Profile.findOne({}).lean();
      expect(profile?.rangeQuestions).toStrictEqual(expectedArray);
    });

    test("fails to update when value number is greater than 5", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables: SubmitRangeQuestionType = {
        order: 100,
        value: 6,
      };
      const result = await profileApi.submitRangeQuestion(variables, token);
      expect(result.data.errors[0].message).toBe("Invalid response");
      const expectedArray = new Array(300).fill(0);
      const profile = await Profile.findOne({}).lean();
      expect(profile?.rangeQuestions).toStrictEqual(expectedArray);
    });

    test("fails to update when authentication fails", async () => {
      const variables: SubmitRangeQuestionType = {
        order: 100,
        value: 4,
      };
      const result = await profileApi.submitRangeQuestion(variables);
      expect(result.data.errors[0].message).toBe(
        "Authentication as user failed"
      );
      const expectedArray = new Array(300).fill(0);
      const profile = await Profile.findOne({}).lean();
      expect(profile?.rangeQuestions).toStrictEqual(expectedArray);
    });

    afterAll(async () => {
      await User.deleteMany({});
      await Profile.deleteMany({});
    });
  });

  describe(`updateProfileField(
    userHobbies: [String],
    userFaculty: String,
    userYearOfStudy: Int): Boolean!`, () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await Profile.deleteMany({});
      await userApi.createUser(validUser);
    });

    test("correctly updates userHobbies profile field", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const profile = await Profile.findOne({}).lean();
      const variables: UpdateProfileType = {
        userHobbies: ["play", "game"],
      };

      const result = await profileApi.updateProfileField(variables, token);

      expect(result.data.data.updateProfileField).toBe(true);

      const updatedProfile = await Profile.findOne({}).lean();

      expect(profile?.userFaculty).toStrictEqual(updatedProfile?.userFaculty);
      expect(profile?.userYearOfStudy).toStrictEqual(
        updatedProfile?.userYearOfStudy
      );
      expect(profile?.userHobbies).not.toEqual(updatedProfile?.userHobbies);
      expect(updatedProfile?.userHobbies).toStrictEqual(variables.userHobbies);
    });

    test("correctly updates userFaculty profile field", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const profile = await Profile.findOne({}).lean();
      const variables: UpdateProfileType = {
        userFaculty: "COM",
      };

      const result = await profileApi.updateProfileField(variables, token);

      expect(result.data.data.updateProfileField).toBe(true);

      const updatedProfile = await Profile.findOne({}).lean();

      expect(profile?.userYearOfStudy).toStrictEqual(
        updatedProfile?.userYearOfStudy
      );
      expect(profile?.userHobbies).toStrictEqual(updatedProfile?.userHobbies);
      expect(profile?.userFaculty).not.toEqual(updatedProfile?.userFaculty);
      expect(updatedProfile?.userFaculty).toStrictEqual(variables.userFaculty);
    });

    test("correctly updates userYearOfStudy profile field", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const profile = await Profile.findOne({}).lean();
      const variables: UpdateProfileType = {
        userYearOfStudy: 2,
      };

      const result = await profileApi.updateProfileField(variables, token);

      expect(result.data.data.updateProfileField).toBe(true);

      const updatedProfile = await Profile.findOne({}).lean();

      expect(profile?.userFaculty).toStrictEqual(updatedProfile?.userFaculty);
      expect(profile?.userHobbies).toStrictEqual(updatedProfile?.userHobbies);
      expect(profile?.userYearOfStudy).not.toEqual(
        updatedProfile?.userYearOfStudy
      );
      expect(updatedProfile?.userYearOfStudy).toStrictEqual(
        variables.userYearOfStudy
      );
    });

    test("correctly updates all fields", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const profile = await Profile.findOne({}).lean();
      const variables: UpdateProfileType = {
        userYearOfStudy: 2,
        userFaculty: "COM",
        userHobbies: ["what", "is", "a", "hobby"],
      };

      const result = await profileApi.updateProfileField(variables, token);

      expect(result.data.data.updateProfileField).toBe(true);

      const updatedProfile = await Profile.findOne({}).lean();

      expect(profile?.userFaculty).not.toEqual(updatedProfile?.userFaculty);
      expect(profile?.userHobbies).not.toEqual(updatedProfile?.userHobbies);
      expect(profile?.userYearOfStudy).not.toEqual(
        updatedProfile?.userYearOfStudy
      );

      expect(updatedProfile?.userYearOfStudy).toStrictEqual(
        variables.userYearOfStudy
      );
      expect(updatedProfile?.userHobbies).toStrictEqual(variables.userHobbies);
      expect(updatedProfile?.userFaculty).toStrictEqual(variables.userFaculty);
    });

    test("returns error on failed authentication", async () => {
      const variables: UpdateProfileType = {
        userYearOfStudy: 2,
        userFaculty: "COM",
        userHobbies: ["what", "is", "a", "hobby"],
      };
      const result = await profileApi.updateProfileField(variables);
      expect(result.data.errors[0].message).toBe(
        "Authentication as user failed"
      );
    });
  });
});

afterAll(() => mongoose.connection.close());
