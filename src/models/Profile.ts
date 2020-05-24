import mongoose, { Schema, Document } from "mongoose";
import { UserType, RangeQuestion } from "./";

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
  rangeQuestions: [Number],
  eventPreferences: {
    type: Map,
    of: Number,
  },
  userHobbies: [String],
  userFaculty: String,
  userYearOfStudy: Number,
});

/**
 * Pre-hook in Mongoose that modifies input on save
 * Sets default rangeQuestions to be an array of number of documents
 * in the RangeQuestions db
 */
profileSchema.pre("save", async function (next: mongoose.HookNextFunction) {
  const profile = this;

  if (!profile.get("rangeQuestions")) {
    const numberOfQuestions = await RangeQuestion.countDocuments({}).exec();
    profile.set("rangeQuestions", new Array(numberOfQuestions).fill(0));
  }

  next();
});

export const Profile = mongoose.model<ProfileType>("Profile", profileSchema);
