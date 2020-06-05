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
  GetEventType,
} from "./types";
import { UserInputError, ForbiddenError } from "apollo-server-express";
import config from "../config";

const eventResolver: IResolvers = {
  Query: {
    /**
     * Searches for an event.
     * Optional search fields searchTerm OR eventCode
     */
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
    /**
     * Gets an event by the ID
     * Can return null
     */
    getEvent: async (
      root: void,
      args: GetEventType
    ): Promise<EventType | null> => {
      if (!args.eventId) throw new UserInputError("ID must be supplied");
      try {
        return await Event.findById(args.eventId).exec();
      } catch (err) {
        throw new ForbiddenError(err.message);
      }
    },
  },
  Mutation: {
    /**
     * Creates an event
     * User must be authenticated to carry out this action
     */
    createEvent: combineResolvers(
      isAuthenticated,
      async (_, args: CreateEventType, context): Promise<EventType> => {
        if (
          !args.title ||
          !args.description ||
          !args.groupSize ||
          args.category.length === 0
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
          images: args.images.map((image) =>
            config.ImageURLCreator(context.currentUser.id, image)
          ),
        });
        const savedEvent = await event.save();
        return savedEvent;
      }
    ),
    /**
     * Register for an event.
     * User must be authenticated in order to carry out this action
     */
    registerEvent: combineResolvers(
      isAuthenticated,
      async (_, args: RegisterEventType, context): Promise<EventType> => {
        if (!args.eventId) throw new UserInputError("Invalid ID");

        const event = await Event.findById(args.eventId);

        if (!event) {
          throw new ForbiddenError("No such event found");
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
    /**
     * Unregister for an event.
     * User must be authenticated in order to carry out this action
     */
    unregisterEvent: combineResolvers(
      isAuthenticated,
      async (_, args: UnregisterEventType, context): Promise<EventType> => {
        if (!args.eventId) throw new UserInputError("Invalid ID");
        const event = await Event.findById(args.eventId);
        if (!event) {
          throw new ForbiddenError("No such event found");
        }
        if (!event.registeredUsers.includes(context.currentUser.id)) {
          throw new ForbiddenError(
            `User is not registered for the event ${event.title}`
          );
        }

        const newRegisteredUsers = event.registeredUsers.filter(
          (id) => id.toString() !== context.currentUser.id.toString()
        );

        event.registeredUsers = newRegisteredUsers;
        const savedEvent = await event.save();
        return savedEvent;
      }
    ),
    /**
     * Delete all event for testing purposes
     * Should probably add an admin restriction here after dev
     */
    deleteAllEvent: async (): Promise<boolean> => {
      await Event.deleteMany({});
      return true;
    },
  },
  Event: {
    /**
     * Gets owner from DB and returns it
     */
    owner: async (root: EventType): Promise<UserType> => {
      await root.populate("owner").execPopulate();
      return root.owner;
    },
    /**
     * Gets list of registered users and returns them
     */
    registeredUsers: async (root: EventType): Promise<UserType[]> => {
      await root.populate("registeredUsers").execPopulate();
      return root.registeredUsers;
    },
  },
};

export default eventResolver;
