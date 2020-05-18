import mongoose, { Schema, Document } from "mongoose";
import { ProfileType, GroupType } from "./";

//Interface for user type without mongoDB
export interface RawUserType {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  gender: string;
  avatar: string;
  isVerified: boolean;
  dateJoined: Date;
  birthday: Date;
  location: String;
  profile: ProfileType["_id"];
  group: Array<GroupType["_id"]>;
  preferences: {
    lowerAge: number;
    upperAge: number;
    maxDistance: number;
  };
}

//Interface for user type with mongoDB
export interface UserType extends Document, RawUserType {
  comparePassword(password: string): boolean;
}

const userSchema: Schema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  password: String,
  email: String,
  gender: String,
  avatar: String,
  isVerified: Boolean,
  dateJoined: Date,
  birthday: Date,
  location: String,
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  group: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  preferences: {
    lowerAge: Number,
    upperAge: Number,
    maxDistance: Number,
  },
});

userSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.password;
  },
});

export const User = mongoose.model<UserType>("User", userSchema);
