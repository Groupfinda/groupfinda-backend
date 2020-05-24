import {
  RawUserType,
  RawProfileType,
  User,
  Profile,
  RangeQuestion,
} from "../models";
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
  group: [],
  preferences: {
    lowerAge: 18,
    upperAge: 30,
    maxDistance: 5,
  },
};

const user = new User(rawUser);

const rawProfile: RawProfileType = {
  user: user["_id"],
  rangeQuestions: new Array(questions.length).fill(-1),
  eventPreferences: {},
  userHobbies: ["game"],
  userFaculty: "COM",
  userYearOfStudy: 1,
};

const profile = new Profile(rawProfile);
user.profile = profile["_id"];

export default async () => {
  await user.save();
  await profile.save();
};
