import {
  CreateUserType,
  LoginUserType,
  ForgetPasswordType,
} from "../resolvers/types";

export const event1 = {
  title: "My Event",
  description: "At this event people can do whatever they want",
  recurringMode: false,
  dateOfEvent: new Date("2020-5-31"),
  dateLastRegister: new Date("2020-5-29"),
  images: [
    "https://corp.gametize.com/wp-content/uploads/2014/07/events-heavenly-header.jpg",
  ],
  private: false,
  groupSize: 4,
  category: ["fun"],
  locationOn: false,
};

export const validUserForgetPassword: ForgetPasswordType = {
  username: "username",
  email: "testing@u.nus.edu",
};

export const validUserCredentials: LoginUserType = {
  username: "username",
  password: "password",
};

export const validUser: CreateUserType = {
  username: "username",
  password: "password",
  confirmPassword: "password",
  firstName: "firstName",
  lastName: "lastName",
  email: "testing@u.nus.edu",
  gender: "Male",
  birthday: new Date("2000-01-01"),
};
