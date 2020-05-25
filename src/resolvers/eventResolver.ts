// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { EventType, Event, UserType } from "../models";

import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";
import { extractEmptyFields, generateRandomCode } from "./helpers/util";
import {
  CreateEventType,
  RegisterEventType,
  UnregisterEventType,
  SearchEventType,
} from "./types";
import { UserInputError, ForbiddenError } from "apollo-server-express";

const eventResolver: IResolvers = {
  Query: {
    searchEvent: async (_, args: SearchEventType): Promise<EventType[]> => {
      //Regex case insensitive search on title and description
      if (args.searchTerm) {
        const query = Event.find({
          $or: [
            { title: { $regex: args.searchTerm, $options: "i" } },
            { description: { $regex: args.searchTerm, $options: "i" } },
          ],
        });

        return await query.exec();
      }
      //Searches for exact event code
      if (args.eventCode) {
        const query = Event.find({ eventCode: args.eventCode }).limit(1);

        return await query.exec();
      }
      //Returns all events
      return Event.find({});
    },
  },
  Mutation: {
    createEvent: combineResolvers(
      isAuthenticated,
      async (_, args: CreateEventType, context): Promise<EventType> => {
        if (
          !args.title ||
          !args.description ||
          !args.groupSize ||
          !args.category
        ) {
          throw new UserInputError("Input fields must not be empty", {
            invalidArgs: extractEmptyFields(args),
          });
        }

        const eventCode = generateRandomCode(6);
        const event = new Event({
          ...args,
          eventCode,
          owner: context.currentUser.id,
        });
        const savedEvent = await event.save();
        return savedEvent;
      }
    ),
    registerEvent: combineResolvers(
      isAuthenticated,
      async (_, args: RegisterEventType, context): Promise<EventType> => {
        const event = await Event.findOne({ eventCode: args.eventCode });
        if (!event) {
          throw new UserInputError(
            `No event with code ${args.eventCode} was found`,
            { invalidArgs: ["eventCode"] }
          );
        }
        if (event.registeredUsers.includes(context.currentUser.id)) {
          throw new ForbiddenError(
            `User is already registered for event ${event.title}`
          );
        }
        event.registeredUsers.push(context.currentUser.id);
        return await event.save();
      }
    ),
    unregisterEvent: combineResolvers(
      isAuthenticated,
      async (_, args: UnregisterEventType, context): Promise<EventType> => {
        if (!args.eventId) throw new UserInputError("Invalid ID");
        const event = await Event.findById(args.eventId);
        if (!event) {
          throw new ForbiddenError("No such event found");
        }
        if (!event.registeredUsers.includes(context.currentUser.id)) {
          throw new ForbiddenError("User is not registered for the event");
        }

        const newRegisteredUsers = event.registeredUsers.filter(
          (id) => id.toString() !== context.currentUser.id.toString()
        );

        event.registeredUsers = newRegisteredUsers;
        const savedEvent = await event.save();
        return savedEvent;
      }
    ),
    deleteAllEvent: async (): Promise<boolean> => {
      await Event.deleteMany({});
      return true;
    },
  },
  Event: {
    owner: async (root: EventType): Promise<UserType> => {
      await root.populate("owner").execPopulate();
      return root.owner;
    },
    registeredUsers: async (root: EventType): Promise<UserType[]> => {
      console.log("Running once");
      await root.populate("registeredUsers").execPopulate();
      return root.registeredUsers;
    },
  },
};

export default eventResolver;
