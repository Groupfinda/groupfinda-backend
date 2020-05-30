import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "./";

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
    type: Map,
    of: Number,
  },
  userHobbies: [String],
  userFaculty: String,
  userYearOfStudy: Number,
});

export const Profile = mongoose.model<ProfileType>("Profile", profileSchema);
