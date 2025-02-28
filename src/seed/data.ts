import {
  RawUserType,
  User,
  Profile,
  RangeQuestion,
  Event,
  Group,
  MessageRoom,
} from "../models";
import questions from "./questions";
import events from "./events";

const rawUser: RawUserType = {
  username: "username",
  password: "password",
  firstName: "Peter",
  lastName: "Tan",
  email: "peter@123.com",
  gender: "Male",
  avatar:
    "https://postmediacanoe.files.wordpress.com/2019/07/gettyimages-910314172-e1564420108411.jpg?w=840&h=630&crop=1&quality=80&strip=all",
  isVerified: false,
  dateJoined: new Date(),
  location: "Singapore",
  birthday: new Date("1998-01-01"),
  profile: "",
  groups: [],
  preferences: {
    lowerAge: 18,
    upperAge: 30,
    maxDistance: 5,
  },
  newUser: true,
  role: "USER",
  expoToken: ""
};

const rawUser2: RawUserType = {
  username: "username2",
  password: "password",
  firstName: "John",
  lastName: "Tan",
  email: "john@123.com",
  gender: "Male",
  avatar:
    "https://postmediacanoe.files.wordpress.com/2019/07/gettyimages-910314172-e1564420108411.jpg?w=840&h=630&crop=1&quality=80&strip=all",
  isVerified: false,
  dateJoined: new Date(),
  location: "Singapore",
  birthday: new Date("1998-01-01"),
  profile: "",
  groups: [],
  preferences: {
    lowerAge: 18,
    upperAge: 30,
    maxDistance: 5,
  },
  newUser: true,
  role: "USER",
  expoToken: ""
};

const user = new User(rawUser);
const user2 = new User(rawUser2);

const eventData = events.map((event) => ({ ...event, owner: user.id }));
const rawProfile = {
  user: user["_id"],
  eventPreferences: {},
  userHobbies: ["Gaming"],
  userFaculty: "Computing",
  userYearOfStudy: 1,
};

const rawProfile2 = {
  user: user2["_id"],
  eventPreferences: {},
  userHobbies: ["Gaming"],
  userFaculty: "Computing",
  userYearOfStudy: 1,
};

const profile = new Profile(rawProfile);
const profile2 = new Profile(rawProfile2);
user.profile = profile["_id"];
user2.profile = profile2["_id"];

export default async () => {
  eventData.forEach(e => e.owner = user.id)
  await Event.insertMany(eventData);
  const event = await Event.findOne({});
  const group = new Group({
    event: event?.id,
    dateCreated: new Date(),
    members: [user.id, user2.id],
    preferences: {
      lowerAge: 0,
      upperAge: 100,
    },
  });
  const message = new MessageRoom({
    messages: [],
    dateCreated: new Date(),
    group: group.id,
  });
  group.messageRoom = message.id;
  await RangeQuestion.insertMany(questions);
  user.groups.push(group.id);
  user2.groups.push(group.id);
  await user.save();
  await user2.save();
  await profile.save();
  await profile2.save();

  await message.save();
  await group.save();
};
