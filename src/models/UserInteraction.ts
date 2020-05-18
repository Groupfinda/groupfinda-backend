import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "./";

//Interface for profile type without mongoDB
export interface RawUserInteractionType {
  user: UserType["_id"];
  target: UserType["_id"];
  score: number;
}

//Interface for profile type with mongoDB
export interface UserInteractionType extends Document, RawUserInteractionType {}

const userInteractionSchema: Schema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  target: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  score: Number,
});

export const UserInteraction = mongoose.model<UserInteractionType>(
  "UserInteraction",
  userInteractionSchema
);
