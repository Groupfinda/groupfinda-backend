import * as userApi from "./userApi";
import { User, UserType, Profile } from "../models";
import {
  validUser,
  validUserCredentials,
  validUserForgetPassword,
  validResetPassword,
} from "./data";
import { mongoConnectWithRetry } from "../mongoose";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import config from "../config";

beforeAll(async () => {
  await mongoConnectWithRetry();
});

test("Sanity check", async () => {
  const response = await userApi.helloWorld();
  expect(response.data.data.helloWorld).toBe("👋 Hello world! v2 👋");
});
describe("Users", () => {
  describe(`createUser(
    username: String!
    password: String!
    confirmPassword: String!
    firstName: String!
    lastName: String!
    email: String!
    gender: String!
    birthday: Date!
  ): Token!`, () => {
    beforeEach(async () => {
      await User.deleteMany({}).exec();
    });

    test("creates a user in the database", async () => {
      const initialSize = await User.countDocuments({}).exec();
      const result = await userApi.createUser(validUser);
      expect(result.data.data.createUser.token).toBeTruthy();
      expect(result.data.errors).not.toBeTruthy();
      const user = await User.findOne({ username: validUser.username });
      expect(user).toBeTruthy();

      const finalSize = await User.countDocuments({}).exec();
      expect(finalSize).toEqual(initialSize + 1);
    });

    test("expect created user to have required fields", async () => {
      const result = await userApi.createUser(validUser);
      expect(result.status).toBe(200);
      const user = await User.findOne({ username: validUser.username }).exec();
      expect(user).toBeTruthy();
      const expectedUser = { ...validUser };
      delete expectedUser.password;
      delete expectedUser.confirmPassword;
      expect(user).toMatchObject(expectedUser);
      const defaultFields = {
        avatar:
          "https://publicdomainvectors.org/photos/abstract-user-flat-3.png",
        isVerified: false,
        newUser: true,
        role: "USER",
      };
      expect(user).toMatchObject(defaultFields);

      expect(user).toHaveProperty("preferences");
      expect(user).toHaveProperty("groups");
      expect(user).toHaveProperty("profile");
    });

    test("cannot create a user if username is empty", async () => {
      const emptyField = Object.assign({}, validUser);
      delete emptyField.username;

      try {
        await userApi.createUser(emptyField);
      } catch (e) {
        expect(e.response.status).toBe(400);
      }

      emptyField.username = "";
      const result = await userApi.createUser(emptyField);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "username"
      );
    });

    test("cannot create a user if password is empty", async () => {
      const emptyField = Object.assign({}, validUser);
      delete emptyField.password;

      try {
        await userApi.createUser(emptyField);
      } catch (e) {
        expect(e.response.status).toBe(400);
      }

      emptyField.password = "";
      const result = await userApi.createUser(emptyField);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "password"
      );
    });

    test("cannot create a user if confirm password is empty", async () => {
      const emptyField = Object.assign({}, validUser);
      delete emptyField.confirmPassword;

      try {
        await userApi.createUser(emptyField);
      } catch (e) {
        expect(e.response.status).toBe(400);
      }

      emptyField.confirmPassword = "";
      const result = await userApi.createUser(emptyField);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "confirmPassword"
      );
    });

    test("cannot create a user if  first name is empty", async () => {
      const emptyField = Object.assign({}, validUser);
      delete emptyField.firstName;

      try {
        await userApi.createUser(emptyField);
      } catch (e) {
        expect(e.response.status).toBe(400);
      }

      emptyField.firstName = "";
      const result = await userApi.createUser(emptyField);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "firstName"
      );
    });

    test("cannot create a user if  last name is empty", async () => {
      const emptyField = Object.assign({}, validUser);
      delete emptyField.lastName;

      try {
        await userApi.createUser(emptyField);
      } catch (e) {
        expect(e.response.status).toBe(400);
      }

      emptyField.lastName = "";
      const result = await userApi.createUser(emptyField);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "lastName"
      );
    });

    test("cannot create a user if  email is empty", async () => {
      const emptyField = Object.assign({}, validUser);
      delete emptyField.email;

      try {
        await userApi.createUser(emptyField);
      } catch (e) {
        expect(e.response.status).toBe(400);
      }

      emptyField.email = "";
      const result = await userApi.createUser(emptyField);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain("email");
    });

    test("cannot create a user if  gender is empty", async () => {
      const emptyField = Object.assign({}, validUser);
      delete emptyField.gender;

      try {
        await userApi.createUser(emptyField);
      } catch (e) {
        expect(e.response.status).toBe(400);
      }

      emptyField.gender = "";
      const result = await userApi.createUser(emptyField);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain("gender");
    });

    test("cannot create a user if birthday is empty", async () => {
      const emptyField = Object.assign({}, validUser);
      delete emptyField.birthday;

      try {
        await userApi.createUser(emptyField);
      } catch (e) {
        expect(e.response.status).toBe(400);
      }
    });

    test("cannot create user if username is less than 6 characters", async () => {
      const shortUsername = Object.assign({}, validUser);
      shortUsername.username = "abcde";
      expect(shortUsername.username.length).toBeLessThan(6);
      const result = await userApi.createUser(shortUsername);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Username must be at least 6 characters"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "username"
      );
    });

    test("cannot create user if password is less than 6 characters", async () => {
      const shortPassword = Object.assign({}, validUser);
      shortPassword.password = "abcde";
      expect(shortPassword.password.length).toBeLessThan(6);
      const result = await userApi.createUser(shortPassword);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Password must be at least 6 characters"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "password"
      );
    });

    test("cannot create user if passwords are different", async () => {
      const diffPassword = Object.assign({}, validUser);
      diffPassword.password = "abcdef";
      diffPassword.confirmPassword = "abcdefg";

      const result = await userApi.createUser(diffPassword);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe("Passwords do not match");
      expect(result.data.errors[0].extensions.invalidArgs).toEqual([
        "password",
        "confirmPassword",
      ]);
    });

    test("cannot create user if email is not of correct format", async () => {
      const invalidEmail = Object.assign({}, validUser);
      invalidEmail.email = "abc";

      const result = await userApi.createUser(invalidEmail);
      expect(await User.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Email is not of valid format"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain("email");
    });

    test("cannot create a user with the same email", async () => {
      const firstUser = Object.assign({}, validUser);
      firstUser.email = "abc@abc.com";
      await new User(firstUser).save();

      const secondUser = Object.assign({}, validUser);
      secondUser.email = firstUser.email;

      const result = await userApi.createUser(secondUser);

      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors).toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Email has already been registered"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain("email");
    });

    test("cannot create a user with the same username", async () => {
      const firstUser = Object.assign({}, validUser);
      firstUser.username = "username";
      firstUser.email = "test@email.com";
      await new User(firstUser).save();

      const secondUser = Object.assign({}, validUser);
      secondUser.username = firstUser.username;
      secondUser.email = "test2@email.com";

      const result = await userApi.createUser(secondUser);

      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors).toBeTruthy();
      expect(result.data.errors[0].message).toBe("Username is taken");
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "username"
      );
    });
  });
  describe(`loginUser(username: String!, password: String!): Token!`, () => {
    beforeAll(async () => {
      await userApi.createUser(validUser);
    });

    test("login is successful with default user", async () => {
      const result = await userApi.loginUser(validUserCredentials);
      expect(result.data.data.loginUser.token).toBeTruthy();
    });

    test("login fails with incorrect credentials", async () => {
      const variables = { ...validUserCredentials };
      variables.password = "passwor";
      const result = await userApi.loginUser(variables);
      expect(result.data.errors[0].message).toBe(
        "Invalid username or password"
      );
      expect(
        await (await userApi.loginUser(validUserCredentials)).data.data
          .loginUser.token
      ).toBeTruthy();
    });

    test("login fails even when username is not in the database", async () => {
      const variables = { username: "usrname", password: "passwor" };
      expect(
        await User.findOne({ username: variables.username })
      ).not.toBeTruthy();
      const result = await userApi.loginUser(variables);
      expect(result.data.errors[0].message).toBe(
        "Invalid username or password"
      );
    });

    test("login token points to correct user", async () => {
      const variables = { username: "newuser", password: "newpass" };
      const user = await new User(variables).save();
      const result = await userApi.loginUser(variables);
      const token = result.data.data.loginUser.token;
      const decodedToken = jwt.verify(token, <jwt.Secret>config.TOKEN_SECRET);
      expect((decodedToken as UserType).id).toEqual(user.id);
    });

    afterAll(async () => {
      await User.deleteMany({}).exec();
    });
  });

  describe(`forgetPassword(username: String!, email: String!): Boolean!`, () => {
    beforeEach(async () => {
      await userApi.createUser(validUser);
    });

    test("throws error if input fields are empty", async () => {
      const variables = { username: "", email: "" };
      const result = await userApi.forgetPassword(variables);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toEqual([
        "username",
        "email",
      ]);

      variables.username = validUserForgetPassword.username;
      const result2 = await userApi.forgetPassword(variables);
      expect(result2.data.data).not.toBeTruthy();
      expect(result2.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result2.data.errors[0].extensions.invalidArgs).toEqual(["email"]);

      variables.username = "";
      variables.email = validUserForgetPassword.email;
      const result3 = await userApi.forgetPassword(variables);
      expect(result3.data.data).not.toBeTruthy();
      expect(result3.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result3.data.errors[0].extensions.invalidArgs).toEqual([
        "username",
      ]);
    });

    test("throws error if there is no such user", async () => {
      const variables = { ...validUserForgetPassword, username: "fakeuser" };
      const result = await userApi.forgetPassword(variables);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe("No such user");
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "username"
      );
    });

    test("throws error for invalid combination", async () => {
      const variables = {
        ...validUserForgetPassword,
        email: "wrong@email.com",
      };
      const result = await userApi.forgetPassword(variables);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "No such combination of username and email"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain("email");
    });

    afterAll(async () => {
      await User.deleteMany({}).exec();
    });
  });

  describe(`resetPassword(
    originalPassword: String!
    newPassword: String!
    confirmNewPassword: String!
  ): Boolean!`, () => {
    beforeEach(async () => {
      await userApi.createUser(validUser);
    });

    afterEach(async () => {
      await User.deleteMany({});
    });

    test("password is reset on successful entry", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const variables = validResetPassword;
      const user = await User.findOne({ username: validUser.username });
      expect(await user?.comparePassword(validUser.password)).toBe(true);

      const result = await userApi.resetPassword(variables, token);
      expect(result.data.data.resetPassword).toBe(true);

      const updatedUser = await User.findOne({ username: validUser.username });
      expect(await updatedUser?.comparePassword(validUser.password)).toBe(
        false
      );

      expect(await updatedUser?.comparePassword("newpass")).toBe(true);
    });

    test("password is not reset when wrong original password is provided", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const variables = {
        ...validResetPassword,
        originalPassword: "wrongpass",
      };

      const result = await userApi.resetPassword(variables, token);
      expect(result.data.errors[0].message).toBe("Password is incorrect");
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "originalPassword"
      );

      const updatedUser = await User.findOne({ username: validUser.username });
      expect(await updatedUser?.comparePassword(validUser.password)).toBe(true);
      expect(
        await updatedUser?.comparePassword(validResetPassword.newPassword)
      ).toBe(false);
    });

    test("password is not reset on authentication fail (no token)", async () => {
      const result = await userApi.resetPassword(validResetPassword, "");
      expect(result.data.errors[0].message).toBe(
        "Authentication as user failed"
      );
    });
  });

  describe("me: User", () => {
    beforeAll(async () => {
      await User.deleteMany({});
      await Profile.deleteMany({});
    });
    test("creating user receives valid token for me query", async () => {
      const token = (await userApi.createUser(validUser)).data.data.createUser
        .token;

      const user = (await userApi.me(token)).data.data.me;
      expect(user.isVerified).toBe(false);
      expect(user.role).toBe("USER");
      expect(user.username).toBe(validUser.username);
      expect(new Date(user.birthday)).toStrictEqual(validUser.birthday);
      expect(user.email).toBe(validUser.email);
      expect(user.firstName).toBe(validUser.firstName);
      expect(user.gender).toBe(validUser.gender);
      expect(user.lastName).toBe(validUser.lastName);
      expect(user.newUser).toBe(true);

      expect(user.profile.rangeQuestions.length).toBe(300);
      expect(user.profile.userHobbies).toStrictEqual([]);
      expect(user.profile.userFaculty).toBe("None");
      expect(user.profile.userYearOfStudy).toBe(0);
      expect(user.profile.eventPreferences).toStrictEqual({});
    });

    test("logging in receives valid token for me query", async () => {
      await userApi.createUser(validUser);

      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const user = (await userApi.me(token)).data.data.me;
      expect(user.isVerified).toBe(false);
      expect(user.role).toBe("USER");
      expect(user.username).toBe(validUser.username);
      expect(new Date(user.birthday)).toStrictEqual(validUser.birthday);
      expect(user.email).toBe(validUser.email);
      expect(user.firstName).toBe(validUser.firstName);
      expect(user.gender).toBe(validUser.gender);
      expect(user.lastName).toBe(validUser.lastName);
      expect(user.newUser).toBe(true);

      expect(user.profile.rangeQuestions.length).toBe(300);
      expect(user.profile.userHobbies).toStrictEqual([]);
      expect(user.profile.userFaculty).toBe("None");
      expect(user.profile.userYearOfStudy).toBe(0);
      expect(user.profile.eventPreferences).toStrictEqual({});
    });

    test("me query returns null on no token", async () => {
      const user = (await userApi.me()).data;
      expect(user.data).toBeTruthy();
      expect(user.data.me).toBe(null);
    });
    afterEach(async () => {
      await User.deleteMany({});
      await Profile.deleteMany({});
    });
  });

  describe(`updateUserField(
    firstName: String
    lastName: String
    birthday: Date
    gender: String
    avatar: String
    lowerAge: Int
    upperAge: Int
    maxDistance: Int
  ): Boolean!`, () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await userApi.createUser(validUser);
    });

    test("updating a single user field is successful", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      type Variable = {
        [key: string]: any;
      };
      let user = await User.findOne({});
      expect(user?.firstName).toBe(validUser.firstName);
      let variables: Variable = { firstName: "Changed" };
      const result = await userApi.updateUserField(variables, token);
      expect(result.data.data.updateUserField).toBe(true);
      user = await User.findOne({});
      expect(user?.firstName).toBe("Changed");

      variables = { lastName: "Changed2" };
      await userApi.updateUserField(variables, token);
      user = await User.findOne({});
      expect(user?.lastName).toBe("Changed2");
    });

    test("updating multiple user fields is successful", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      type Variable = {
        [key: string]: any;
      };
      let variables: Variable = {
        firstName: "MultipleChange",
        lastName: "MultipleChange2",
      };
      let user = await User.findOne({});
      expect(user?.firstName).not.toBe("MultipleChange");
      expect(user?.lastName).not.toBe("MultipleChange2");

      const result = await userApi.updateUserField(variables, token);
      expect(result.data.data.updateUserField).toBe(true);
      user = await User.findOne({});
      expect(user?.firstName).toBe("MultipleChange");
      expect(user?.lastName).toBe("MultipleChange2");
    });
  });

  afterAll(() => mongoose.connection.close());
});
