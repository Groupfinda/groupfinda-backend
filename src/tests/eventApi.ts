import axios from "axios";
import {
  CreateEventType,
  RegisterEventType,
  UnregisterEventType,
  SearchEventType,
  GetEventType,
} from "../resolvers/types";
import { API_URL } from "./data";

export const searchEvent = async (variables: SearchEventType) =>
  axios.post(API_URL, {
    query: `
     query searchEvent($searchTerm: String, $eventCode: String) {
         searchEvent(searchTerm: $searchTerm, eventCode: $eventCode) {
             id
             title
             description
             owner {
                 username
             }
             recurringMode
             dateOfEvent
             dateLastRegister
             images
             private
             groupSize
             category
             registeredUsers {
                 username
             }
             groups
             locationOn
             eventCode
             location {
                address
                postalCode
            }
         }
     }
        `,
    variables,
  });

export const getEvent = async (variables: GetEventType) =>
  axios.post(API_URL, {
    query: `
     query getEvent($eventId: ID!) {
        getEvent(eventId: $eventId) {
             id
             title
             description
             owner {
                 username
             }
             recurringMode
             dateOfEvent
             dateLastRegister
             images
             private
             groupSize
             category
             registeredUsers {
                 username
             }
             groups
             locationOn
             eventCode
             location {
                address
                postalCode
            }
         }
     }
        `,
    variables,
  });

export const createEvent = async (variables: CreateEventType, token: string) =>
  axios.post(
    API_URL,
    {
      query: `
     mutation createEvent(
        $title: String!
        $description: String!
        $dateOfEvent: Date!
        $recurringMode: Boolean!
        $dateLastRegister: Date!
        $images: [String]!
        $private: Boolean!
        $groupSize: Int!
        $category: [String]!
        $locationOn: Boolean!
        $location: LocationInput!
      ) {
        createEvent(
            title: $title
            description: $description
            dateOfEvent: $dateOfEvent
            recurringMode: $recurringMode
            dateLastRegister: $dateLastRegister
            images: $images
            private: $private
            groupSize: $groupSize
            category: $category
            locationOn: $locationOn
            location: $location
          ) {
             id
             title
             description
             owner {
                 id
             }
             recurringMode
             dateOfEvent
             dateLastRegister
             images
             private
             groupSize
             category
             registeredUsers {
                 id
             }
             groups
             locationOn
             eventCode
             location {
                 address
                 postalCode
             }
         }
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

export const registerEvent = async (
  variables: RegisterEventType,
  token: string
) =>
  axios.post(
    API_URL,
    {
      query: `
      mutation registerEvent($eventId: String!) {
          registerEvent(eventId: $eventId) {
               id
               title
               description
               owner {
                   username
               }
               recurringMode
               dateOfEvent
               dateLastRegister
               images
               private
               groupSize
               category
               registeredUsers {
                   username
               }
               groups
               locationOn
               eventCode
               location {
                address
                postalCode
            }
           }
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

export const unregisterEvent = async (
  variables: UnregisterEventType,
  token: string
) =>
  axios.post(
    API_URL,
    {
      query: `
      mutation unregisterEvent($eventId: String!) {
        unregisterEvent(eventId: $eventId) {
               id
               title
               description
               owner {
                   username
               }
               recurringMode
               dateOfEvent
               dateLastRegister
               images
               private
               groupSize
               category
               registeredUsers {
                   username
               }
               groups
               locationOn
               eventCode
               location {
                address
                postalCode
            }
           }
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

export const deleteAllEvent = async () =>
  axios.post(API_URL, {
    query: `
      mutation deleteAllEvent {
          deleteAllEvent
      }
      `,
  });
