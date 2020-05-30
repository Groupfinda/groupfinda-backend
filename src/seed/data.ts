import { RawUserType, User, Profile, RangeQuestion, Event } from "../models";
import questions from "./questions";

const rawUser: RawUserType = {
  username: "username",
  password: "password",
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
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

const rawProfile = {
  user: user["_id"],
  eventPreferences: {},
  userHobbies: ["game"],
  userFaculty: "COM",
  userYearOfStudy: 1,
};

const rawEvent = {
  title: "My Event",
  description: "At this event people can do whatever they want",
  recurringMode: false,
  dateOfEvent: new Date("2020-5-31"),
  dateLastRegister: new Date("2020-5-29"),
  images: [
    "https://corp.gametize.com/wp-content/uploads/2014/07/events-heavenly-header.jpg",
  ],
  private: false,
  groupSize: 4,
  category: ["fun"],
  locationOn: false,
  owner: user.id,
  eventCode: "123456",
};

const profile = new Profile(rawProfile);
user.profile = profile["_id"];

const event = new Event(rawEvent);

export default async () => {
  await RangeQuestion.insertMany(questions);
  await user.save();
  await profile.save();
  await event.save();
};
