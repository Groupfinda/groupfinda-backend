import axios from "axios";
import {
  CreateUserType,
  LoginUserType,
  ForgetPasswordType,
  ResetPasswordType,
  DeleteUserType,
  UpdateUserType,
} from "../resolvers/types";
import { API_URL } from "./data";

export const helloWorld = async () =>
  axios.post(API_URL, {
    query: `
    query {
        helloWorld
    }`,
  });

export const createUser = async (variables: CreateUserType) =>
  axios.post(API_URL, {
    query: `
    mutation createUser(
        $username: String!
        $password: String!
        $confirmPassword: String!
        $firstName: String!
        $lastName: String!
        $email: String!
        $gender: String!
        $birthday: Date!
      ) {
        createUser(
          username: $username
          password: $password
          confirmPassword: $confirmPassword
          firstName: $firstName
          lastName: $lastName
          email: $email
          gender: $gender
          birthday: $birthday
        ) {
          token
        }
      }
        `,
    variables,
  });

export const loginUser = async (variables: LoginUserType) =>
  axios.post(API_URL, {
    query: `
    mutation loginUser($username: String!, $password: String!) {
      loginUser(username: $username, password: $password) {
        token
      }
    }
          `,
    variables,
  });

export const forgetPassword = async (variables: ForgetPasswordType) =>
  axios.post(API_URL, {
    query: `
    mutation forgetPassword($username: String!, $email: String!) {
      forgetPassword(username: $username, email: $email)
    }
          `,
    variables,
  });

export const resetPassword = async (
  variables: ResetPasswordType,
  token: string = ""
) =>
  axios.post(
    API_URL,
    {
      query: `
    mutation resetPassword(
      $originalPassword: String!
      $newPassword: String!
      $confirmNewPassword: String!
    ) {
      resetPassword(
        originalPassword: $originalPassword
        newPassword: $newPassword
        confirmNewPassword: $confirmNewPassword
      )
    }
            `,
      variables,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const deleteUser = async (
  variables: DeleteUserType,
  token: string = ""
) =>
  axios.post(
    API_URL,
    {
      query: `
    mutation deleteUser($username: String!) {
      deleteUser(username: $username)
    }
          `,
      variables,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const me = async (token: string = "") =>
  axios.post(
    API_URL,
    {
      query: `
    query {
      me {
        id
        username
        firstName
        lastName
        email
        gender
        avatar
        isVerified
        dateJoined
        birthday
        location
        profile {
          id
          rangeQuestions
          eventPreferences
          userHobbies
          userFaculty
          userYearOfStudy
        }
        groups {
          id
          event {
            id
          }
          members {
            id
          }
          dateCreated
          preferences {
            lowerAge
            upperAge
          }
          messageRoom
        }
        preferences {
          lowerAge
          upperAge
          maxDistance
        }
        newUser
        role
      }
    }`,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const updateUserField = async (
  variables: UpdateUserType,
  token: string = ""
) =>
  axios.post(
    API_URL,
    {
      query: `
      mutation updateUserField(
        $firstName: String
        $lastName: String
        $birthday: Date
        $gender: String
        $avatar: String
        $lowerAge: Int
        $upperAge: Int
        $maxDistance: Int
      ) {
        updateUserField(
          firstName: $firstName
          lastName: $lastName
          birthday: $birthday
          gender: $gender
          avatar: $avatar
          lowerAge: $lowerAge
          upperAge: $upperAge
          maxDistance: $maxDistance
        )
      }
              `,
      variables,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
