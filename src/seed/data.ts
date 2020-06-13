import { RawUserType, User, Profile, RangeQuestion, Event } from "../models";
import questions from "./questions";
import events from "./events";

const rawUser: RawUserType = {
  username: "username",
  password: "password",
  firstName: "Peter",
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
};

const user = new User(rawUser);

const eventData = events.map((event) => ({ ...event, owner: user.id }));
const rawProfile = {
  user: user["_id"],
  eventPreferences: {},
  userHobbies: ["Gaming"],
  userFaculty: "Computing",
  userYearOfStudy: 1,
};

const profile = new Profile(rawProfile);
user.profile = profile["_id"];

export default async () => {
  await RangeQuestion.insertMany(questions);
  await user.save();
  await profile.save();
  await Event.insertMany(eventData);
};
