import axios from "axios";
import { SubmitRangeQuestionType, UpdateProfileType } from "../resolvers/types";
import { API_URL } from "./data";

export const getAllRangeQuestions = async () =>
  axios.post(API_URL, {
    query: `
    query {
        getAllRangeQuestions {
            id
            content
            order
        }
    }
        `,
  });

export const getUserProfile = async (token: string = "") =>
  axios.post(
    API_URL,
    {
      query: `
        query {
            getUserProfile {
                id
                user {
                    username
                }
                rangeQuestions
                eventPreferences
                userHobbies
                userFaculty
                userYearOfStudy
            }
        }
    `,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const submitRangeQuestion = async (
  variables: SubmitRangeQuestionType,
  token: string = ""
) =>
  axios.post(
    API_URL,
    {
      query: `
    mutation submitRangeQuestion(
        $order: Int!
        $value: Int!
    ) {
        submitRangeQuestion(
            order: $order
            value: $value
        )
    }`,
      variables,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

export const updateProfileField = async (
  variables: UpdateProfileType,
  token: string = ""
) =>
  axios.post(
    API_URL,
    {
      query: `
        mutation updateProfileField(
            $userHobbies: [String],
            $userFaculty: String
            $userYearOfStudy: Int
        ) {
            updateProfileField(
                userHobbies: $userHobbies
                userFaculty: $userFaculty
                userYearOfStudy: $userYearOfStudy
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
