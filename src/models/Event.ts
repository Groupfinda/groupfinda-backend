import mongoose, { Schema, Document } from "mongoose";
import { UserType, GroupType } from "./";

//Interface for Event type without mongoDB
export interface RawEventType {
  title: string;
  description: string;
  owner: UserType["_id"];
  dateOfEvent: Date;
  dateLastRegister: Date;
  images: string[];
  private: boolean;
  groupSize: number;
  category: string[];
  registeredUsers: Array<UserType["_id"]>;
  groups: Array<GroupType["_id"]>;
  locationOn: boolean;
  eventCode: string;
  recurringMode: boolean;
}

//Interface for Event type with mongoDB
export interface EventType extends Document, RawEventType {}

const EventSchema: Schema = new mongoose.Schema({
  title: String,
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  dateOfEvent: Date,
  dateLastRegister: Date,
  images: [String],
  private: Boolean,
  groupSize: Number,
  category: [String],
  registeredUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  locationOn: Boolean,
  eventCode: String,
  recurringMode: Boolean,
});

export const Event = mongoose.model<EventType>("Event", EventSchema);
