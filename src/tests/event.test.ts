import * as eventApi from "./eventApi";
import * as userApi from "./userApi";
import { Event, User } from "../models";
import {
  validEvent,
  validUser,
  validUserCredentials,
  validEvent2,
} from "./data";
import { mongoConnectWithRetry } from "../mongoose";
import mongoose from "mongoose";
import config from "../config";

beforeAll(async () => {
  mongoConnectWithRetry();
});

describe("Events", () => {
  describe(`createEvent(
        title: String!
        description: String!
        dateOfEvent: Date!
        recurringMode: Boolean!
        dateLastRegister: Date!
        images: [String]!
        private: Boolean!
        groupSize: Int!
        category: [String]!
        locationOn: Boolean!
        location: LocationInput!
      ): Event!`, () => {
    beforeEach(async () => {
      await Event.deleteMany({});
      await User.deleteMany({});
      await userApi.createUser(validUser);
    });

    afterAll(async () => {
      await Event.deleteMany({});
      await User.deleteMany({});
    });

    test("creating event increases count by 1", async () => {
      expect(await Event.countDocuments({}).exec()).toBe(0);
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const result = await eventApi.createEvent(validEvent, token);

      expect(result.data.data.createEvent).toBeTruthy();
      expect(await Event.countDocuments({}).exec()).toBe(1);
    });

    test("cannot create event without title", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const variables = { ...validEvent, title: "" };
      const result = await eventApi.createEvent(variables, token);
      expect(await Event.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain("title");
    });

    test("cannot create event without description", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const variables = { ...validEvent, description: "" };
      const result = await eventApi.createEvent(variables, token);
      expect(await Event.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "description"
      );
    });

    test("cannot create event without groupSize", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const variables = { ...validEvent, groupSize: 0 };
      const result = await eventApi.createEvent(variables, token);
      expect(await Event.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "groupSize"
      );
    });

    test("cannot create event without category", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const variables = { ...validEvent, category: [] };
      const result = await eventApi.createEvent(variables, token);
      expect(await Event.countDocuments({}).exec()).toBe(0);
      expect(result.data.data).not.toBeTruthy();
      expect(result.data.errors[0].message).toBe(
        "Input fields must not be empty"
      );
      expect(result.data.errors[0].extensions.invalidArgs).toContain(
        "category"
      );
    });

    test("creating event returns correct fields", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;

      const result = await eventApi.createEvent(validEvent, token);

      const me = (await userApi.me(token)).data.data.me;

      expect(result.data.data.createEvent).toBeTruthy();
      expect(result.data.data.createEvent.title).toBe(validEvent.title);
      expect(result.data.data.createEvent.description).toBe(
        validEvent.description
      );
      expect(result.data.data.createEvent.owner.id).toBe(me.id);
      expect(result.data.data.createEvent.recurringMode).toBe(
        validEvent.recurringMode
      );
      expect(new Date(result.data.data.createEvent.dateOfEvent)).toStrictEqual(
        validEvent.dateOfEvent
      );
      expect(
        new Date(result.data.data.createEvent.dateLastRegister)
      ).toStrictEqual(validEvent.dateLastRegister);
      expect(result.data.data.createEvent.images).toStrictEqual(
        validEvent.images.map((image) => config.ImageURLCreator(me.id, image))
      );
      expect(result.data.data.createEvent.private).toBe(validEvent.private);
      expect(result.data.data.createEvent.groupSize).toBe(validEvent.groupSize);
      expect(result.data.data.createEvent.category).toStrictEqual(
        validEvent.category
      );
      expect(result.data.data.createEvent.registeredUsers).toStrictEqual([]);
      expect(result.data.data.createEvent.groups).toStrictEqual([]);
      expect(result.data.data.createEvent.locationOn).toBe(
        validEvent.locationOn
      );
      expect(result.data.data.createEvent.location).toStrictEqual(
        validEvent.location
      );
      expect(result.data.data.createEvent.eventCode).toBeTruthy();
    });
  });

  describe(`searchEvent(searchTerm: String, eventCode: String): [Event]!`, () => {
    beforeAll(async () => {
      await User.deleteMany({});
      await Event.deleteMany({});
      await userApi.createUser(validUser);
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      await eventApi.createEvent(validEvent, token);
      await eventApi.createEvent(validEvent2, token);
    });

    afterAll(async () => {
      await User.deleteMany({});
      await Event.deleteMany({});
    });

    test("searching for event without any input should give all events", async () => {
      const result = await eventApi.searchEvent({});

      expect(result.data.data.searchEvent.length).toBe(
        await Event.countDocuments({})
      );
    });

    test("searching for event by title should return correctly", async () => {
      const variables = { searchTerm: "my" };
      let result = await eventApi.searchEvent(variables);
      expect(result.data.data.searchEvent.length).toBe(1);

      variables.searchTerm = "event";
      result = await eventApi.searchEvent(variables);
      expect(result.data.data.searchEvent.length).toBe(2);

      variables.searchTerm = "want";
      result = await eventApi.searchEvent(variables);
      expect(result.data.data.searchEvent.length).toBe(1);

      variables.searchTerm = "specialsearchterm";
      result = await eventApi.searchEvent(variables);
      expect(result.data.data.searchEvent.length).toBe(1);
    });

    test("searching for event should be case insensitive", async () => {
      const variables = { searchTerm: "MY EVENT" };
      let result = await eventApi.searchEvent(variables);
      expect(result.data.data.searchEvent.length).toBe(1);

      variables.searchTerm = "SPECIALSEARCHTERM";
      result = await eventApi.searchEvent(variables);
      expect(result.data.data.searchEvent.length).toBe(1);

      variables.searchTerm = "different event";
      result = await eventApi.searchEvent(variables);
      expect(result.data.data.searchEvent.length).toBe(1);
    });

    test("searching for non existent event should return empty array", async () => {
      const variables = { searchTerm: "thisdoesnotexist" };
      let result = await eventApi.searchEvent(variables);
      expect(result.data.data.searchEvent.length).toBe(0);
      expect(result.data.data.searchEvent).toStrictEqual([]);
    });
  });

  describe(`getEvent(eventId: ID!): Event`, () => {
    beforeAll(async () => {
      await User.deleteMany({});
      await Event.deleteMany({});
      await userApi.createUser(validUser);
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      await eventApi.createEvent(validEvent, token);
      await eventApi.createEvent(validEvent2, token);
    });

    afterAll(async () => {
      await User.deleteMany({});
      await Event.deleteMany({});
    });

    test("getting an event by id returns correctly", async () => {
      let event = await Event.findOne({ title: "My Event" });
      let variables = { eventId: event?.id };
      let result = await eventApi.getEvent(variables);
      expect(result.data.data.getEvent.id).toEqual(event?.id);

      event = await Event.findOne({ description: "specialsearchterm" });
      variables = { eventId: event?.id };
      result = await eventApi.getEvent(variables);
      expect(result.data.data.getEvent.id).toEqual(event?.id);
    });

    test("getting an event with no id returns error", async () => {
      const result = await eventApi.getEvent({ eventId: "" });
      expect(result.data.data.getEvent).toBe(null);
    });

    test("getting an event with invalid id returns null", async () => {
      const result = await eventApi.getEvent({ eventId: "asdf" });
      expect(result.data.data.getEvent).toStrictEqual(null);
    });
  });

  describe("registerEvent(eventId: String!): Event!", () => {
    beforeAll(async () => {
      await User.deleteMany({});
      await Event.deleteMany({});
      await userApi.createUser(validUser);
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      await eventApi.createEvent(validEvent, token);
    });

    afterAll(async () => {
      await User.deleteMany({});
      await Event.deleteMany({});
    });

    test("registering event should be successful", async () => {
      const event = await Event.findOne({ title: "My Event" });
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables = { eventId: event?.id };
      const result = await eventApi.registerEvent(variables, token);

      expect(result.data.data.registerEvent.registeredUsers.length).toBe(1);

      const updatedEvent = await Event.findOne({ title: "My Event" });
      expect(updatedEvent?.registeredUsers.length).toBe(1);
    });

    test("registering event twice should return error", async () => {
      const event = await Event.findOne({ title: "My Event" });
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables = { eventId: event?.id };
      await eventApi.registerEvent(variables, token);
      const result = await eventApi.registerEvent(variables, token);
      expect(result.data.errors[0].message).toBe(
        `User is already registered for event ${event?.title}`
      );
    });

    test("registering for invalid event id should return error", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables = { eventId: "41224d776a326fb40f000001" };
      const result = await eventApi.registerEvent(variables, token);
      expect(result.data.errors[0].message).toBe("No such event found");
    });

    test("registering for event with empty id should return error", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables = { eventId: "" };
      const result = await eventApi.registerEvent(variables, token);
      expect(result.data.errors[0].message).toBe("Invalid ID");
    });

    test("registering for event while not logged in should return error", async () => {
      const event = await Event.findOne({ title: "My Event" });

      const variables = { eventId: event?.id };
      const result = await eventApi.registerEvent(variables, "");

      expect(result.data.errors[0].message).toBe(
        "Authentication as user failed"
      );
    });
  });

  describe("unregisterEvent(eventId: String!): Event!", () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await Event.deleteMany({});
      await userApi.createUser(validUser);
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      await eventApi.createEvent(validEvent, token);
    });

    afterEach(async () => {
      await User.deleteMany({});
      await Event.deleteMany({});
    });

    test("unregistering event should be successful", async () => {
      const event = await Event.findOne({ title: "My Event" });
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables = { eventId: event?.id };
      await eventApi.registerEvent(variables, token);

      const updatedEvent = await Event.findOne({ title: "My Event" });
      expect(updatedEvent?.registeredUsers.length).toBe(1);

      const result = await eventApi.unregisterEvent(variables, token);
      expect(result.data.data.unregisterEvent.registeredUsers.length).toBe(0);

      const finalEvent = await Event.findOne({ title: "My Event" });
      expect(finalEvent?.registeredUsers.length).toBe(0);
    });

    test("unregistering event with no event id should return error", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables = { eventId: "" };
      const result = await eventApi.unregisterEvent(variables, token);
      expect(result.data.errors[0].message).toBe("Invalid ID");
    });

    test("unregistering for invalid event id should return error", async () => {
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables = { eventId: "41224d776a326fb40f000001" };
      const result = await eventApi.unregisterEvent(variables, token);
      expect(result.data.errors[0].message).toBe("No such event found");
    });

    test("unregistering event when not registered should return error", async () => {
      const event = await Event.findOne({ title: "My Event" });
      const token = (await userApi.loginUser(validUserCredentials)).data.data
        .loginUser.token;
      const variables = { eventId: event?.id };
      const result = await eventApi.unregisterEvent(variables, token);
      expect(result.data.errors[0].message).toBe(
        `User is not registered for the event ${event?.title}`
      );
    });

    test("unregistering for event while not logged in should return error", async () => {
      const event = await Event.findOne({ title: "My Event" });

      const variables = { eventId: event?.id };
      const result = await eventApi.unregisterEvent(variables, "");

      expect(result.data.errors[0].message).toBe(
        "Authentication as user failed"
      );
    });
    test.todo("registering for event should increase preferences");
    test.todo("unregistering for event should decrease preferences");
  });

  describe("viewEvent(eventId: String!, type: String!): Boolean!", () => {
    test.todo("liking event should increase preferences");
    test.todo("disliking event should decrease preferences");
    test.todo("liking event twice should be error");
    test.todo("disliking event twice should be error");
  });

  describe("getSwipeEvents: [Event]!", () => {
    test.todo("initially returns all events");
    test.todo("liking event causes event not to show up");
    test.todo("disliking event causes event not to show up");
    test.todo("register event causes event not to show up");
    test.todo("register event then unregister causes event to show up");
  });
});

afterAll(() => mongoose.connection.close());
