// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { EventType, Event, UserType, Profile } from "../models";

import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";
import {
  extractEmptyFields,
  generateRandomCode,
  incrementPreferences,
  decrementPreferences,
} from "./helpers/util";
import {
  CreateEventType,
  RegisterEventType,
  UnregisterEventType,
  SearchEventType,
  GetEventType,
  ViewEventType,
} from "./types";
import {
  UserInputError,
  ForbiddenError,
  ApolloError,
} from "apollo-server-express";
import config from "../config";
import axios from "axios";

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
          dateLastRegister: {
            $gt: new Date()
          },
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
      return Event.find({
        dateLastRegister: {
          $gt: new Date()
        }
      });
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
    /**
     * Gets a list of swipable events which are filtered based on what
     * the user has already seen
     */
    getSwipeEvents: combineResolvers(
      isAuthenticated,
      async (_: void, __: void, context): Promise<EventType[]> => {
        const profile = await Profile.findOne({
          user: context.currentUser.id,
        }).exec();
        if (!profile) {
          throw new ApolloError("User not found");
        }
        const allEvents = profile?.eventsLiked
          .concat(profile.eventsDisliked)
          .concat(profile.eventsRegistered);
        const events = await Event.find({
          _id: { $nin: allEvents },
          dateLastRegister: {
            $gt: new Date()
          }
        });
        return events;
      }
    ),
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
     * Event is added to user eventRegistered array
     * User is added to event registeredUser array
     * User preferences in profile updated
     */

    registerEvent: combineResolvers(
      isAuthenticated,
      async (_, args: RegisterEventType, context): Promise<EventType> => {
        if (!args.eventId) throw new UserInputError("Invalid ID");
        const pquery = Profile.findOne({ user: context.currentUser.id }).exec();
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
        const profile = await pquery;

        if (!profile) {
          throw new ApolloError("User not found");
        }
        profile.eventsRegistered.push(event.id);
        const preferences = incrementPreferences(
          profile.eventPreferences,
          event.category
        );

        profile.eventPreferences = preferences;
        profile.markModified("eventPreferences");

        axios
          .post("http://python-backend:5000/match", {
            userId: context.currentUser.id,
            groupSize: event.groupSize,
            eventId: args.eventId,
          })
          .catch((err: any) => {
            console.log(err);
            throw new ApolloError("Error creating/adding user group");
          });
        await profile.save();
        await event.save();
        return event;
      }
    ),
    /**
     * Unregister for an event.
     * User must be authenticated in order to carry out this action
     * Event is removed from user eventRegistered array
     * User is removed from event registeredUser array
     * User preferences in profile updated
     */
    unregisterEvent: combineResolvers(
      isAuthenticated,
      async (_, args: UnregisterEventType, context): Promise<EventType> => {
        if (!args.eventId) throw new UserInputError("Invalid ID");
        const pquery = Profile.findOne({ user: context.currentUser.id }).exec();
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
        const profile = await pquery;
        if (!profile) {
          throw new ApolloError("User not found");
        }
        const newRegisteredEvents = profile.eventsRegistered.filter(
          (id) => id.toString() !== args.eventId.toString()
        );
        profile.eventsRegistered = newRegisteredEvents;

        const preferences = decrementPreferences(
          profile.eventPreferences,
          event.category
        );

        profile.eventPreferences = preferences;
        profile.markModified("eventPreferences");
        await profile.save();
        const savedEvent = await event.save();
        return savedEvent;
      }
    ),
    /**
     * Like/Dislike an event
     * Updates profile eventPreferences accordingly
     * Adds event id to dislike / like array
     */
    viewEvent: combineResolvers(
      isAuthenticated,
      async (_: void, args: ViewEventType, context): Promise<boolean> => {
        const profile = await Profile.findOne({ user: context.currentUser.id });
        if (!profile) {
          throw new ApolloError("User not found");
        }
        const { eventId, type } = args;
        const event = await Event.findById(eventId);
        if (!event) {
          throw new ApolloError("Error: Event not found");
        }

        const allEvents = profile.eventsDisliked
          .concat(profile.eventsLiked)
          .concat(profile.eventsRegistered);
        if (allEvents.includes(eventId.toString())) {
          throw new ApolloError("User has already seen this event");
        }
        switch (type) {
          case "LIKE": {
            profile.eventsLiked.push(eventId);
            const preferences = incrementPreferences(
              profile.eventPreferences,
              event.category
            );
            profile.eventPreferences = preferences;
            profile.markModified("eventPreferences");
            break;
          }
          case "DISLIKE": {
            profile.eventsDisliked.push(eventId);
            const preferences = decrementPreferences(
              profile.eventPreferences,
              event.category
            );
            profile.eventPreferences = preferences;
            profile.markModified("eventPreferences");
            break;
          }
          default:
            throw new ApolloError("Error: Type not specified");
        }

        try {
          await profile.save();
          return true;
        } catch (err) {
          throw new ApolloError(err);
        }
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
