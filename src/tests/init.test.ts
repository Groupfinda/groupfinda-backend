import * as userApi from "./api";
import { User } from "../models";
import { CreateUserType } from "../resolvers/types";
import { mongoConnectWithRetry } from "../mongoose";
import mongoose from "mongoose";

beforeAll(async () => {
  await mongoConnectWithRetry();
});

test("helloWorld", async () => {
  const response = await userApi.helloWorld();
  expect(response.data.data.helloWorld).toBeTruthy();
  const user = new User();
  console.log(user);
  const savedUser = await user.save();
  console.log(savedUser);
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
    const defaultUser: CreateUserType = {
      username: "username",
      password: "password",
      confirmPassword: "password",
      firstName: "firstName",
      lastName: "lastName",
      email: "email@email",
      gender: "Male",
      birthday: new Date("2000-01-01"),
    };
    test("creates a user in the database", async () => {
      const initialSize = await User.countDocuments({}).exec();
      const result = await userApi.createUser(defaultUser);
      expect(result.data.data.createUser.token).toBeTruthy();
      const user = await User.findOne({ username: defaultUser.username });
      expect(user).toBeTruthy();

      const finalSize = await User.countDocuments({}).exec();
      expect(finalSize).toEqual(initialSize + 1);
    });
  });
});

afterAll(() => mongoose.connection.close());
