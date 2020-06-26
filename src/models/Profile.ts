import mongoose, { Schema, Document } from "mongoose";
import { UserType, EventType } from "./";

//Interface for profile type without mongoDB
export interface RawProfileType {
  user: UserType["_id"];
  rangeQuestions: number[];
  eventPreferences: {
    [genre: string]: number;
  };
  userHobbies: string[];
  userFaculty: string;
  userYearOfStudy: number;
  eventsLiked: Array<EventType["_id"]>;
  eventsDisliked: Array<EventType["_id"]>;
  eventsRegistered: Array<EventType["_id"]>;
}

//Interface for profile type with mongoDB
export interface ProfileType extends Document, RawProfileType {}

const profileSchema: Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rangeQuestions: {
    type: [Number],
    default: new Array(300).fill(0),
  },
  eventPreferences: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  userHobbies: [String],
  userFaculty: String,
  userYearOfStudy: Number,
  eventsLiked: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    default: [],
  },
  eventsDisliked: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    default: [],
  },
  eventsRegistered: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    default: [],
  },
});

export const Profile = mongoose.model<ProfileType>("Profile", profileSchema);
