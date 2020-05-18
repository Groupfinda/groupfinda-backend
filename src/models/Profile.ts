import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "./";

//Type for user interaction
type UserInteractionType = {
  userId: UserType["_id"];
  score: string;
};

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
  userInteractions: Array<UserInteractionType>;
}

//Interface for profile type with mongoDB
export interface ProfileType extends Document, RawProfileType {}

const profileSchema: Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  rangeQuestions: [Number],
  eventPreferences: {
    type: Map,
    of: Number,
  },
  userHobbies: [String],
  userFaculty: String,
  userYearOfStudy: Number,
  userInteractions: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      score: String,
    },
  ],
});

export const Profile = mongoose.model<ProfileType>("Profile", profileSchema);
