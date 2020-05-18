import mongoose, { Schema, Document } from "mongoose";
import { EventType, UserType, MessageRoomType } from "./";

//Interface for group type without mongoDB
export interface RawGroupType {
  event: EventType["_id"];
  members: Array<UserType["_id"]>;
  dateCreated: Date;
  preferences: {
    lowerAge: number;
    upperAge: number;
  };
  messageRoom: MessageRoomType["_id"];
}

//Interface for group type with mongoDB
export interface GroupType extends Document, RawGroupType {}

const groupSchema: Schema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  dateCreated: Date,
  preferences: {
    lowerAge: Number,
    upperAge: Number,
  },
  messageRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MessageRoom",
  },
});

export const Group = mongoose.model<GroupType>("Group", groupSchema);
