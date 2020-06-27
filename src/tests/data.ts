import {
  CreateUserType,
  LoginUserType,
  ForgetPasswordType,
  ResetPasswordType,
  CreateEventType,
} from "../resolvers/types";
import config from "../config";

export const API_URL = `http://backend:${config.PORT}/graphql`;

export const validResetPassword: ResetPasswordType = {
  originalPassword: "password",
  newPassword: "newpass",
  confirmNewPassword: "newpass",
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

export const validEvent: CreateEventType = {
  title: "My Event",
  description: "At this event people can do whatever they want",
  recurringMode: false,
  dateOfEvent: new Date("2099-5-31"),
  dateLastRegister: new Date("2099-5-29"),
  images: ["fun.jpg"],
  private: false,
  groupSize: 4,
  category: ["fun"],
  locationOn: false,
  location: {
    address: "NUS",
    postalCode: "600600",
  },
};

export const validEvent2: CreateEventType = {
  title: "Different Event",
  description: "specialsearchterm",
  recurringMode: false,
  dateOfEvent: new Date("2099-5-31"),
  dateLastRegister: new Date("2099-5-29"),
  images: ["fun.jpg"],
  private: false,
  groupSize: 4,
  category: ["fun"],
  locationOn: false,
  location: {
    address: "NUS",
    postalCode: "600600",
  },
};
