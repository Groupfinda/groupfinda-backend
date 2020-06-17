import mongoose, { Schema, Document } from "mongoose";
import { UserType, GroupType } from "./";

//Type for Message
type Message = {
  user: UserType["_id"];
  createdAt: Date;
  text: string;
};

//Interface for MessageRoom type without mongoDB
export interface RawMessageRoomType {
  messages: Array<Message>;
  group: GroupType["_id"];
  dateCreated: Date;
}

//Interface for MessageRoom type with mongoDB
export interface MessageRoomType extends Document, RawMessageRoomType {}

const MessageRoomSchema: Schema = new mongoose.Schema({
  messages: {
    type: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: Date,
        text: String,
      },
    ],
    default: [],
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  dateCreated: Date,
});

export const MessageRoom = mongoose.model<MessageRoomType>(
  "MessageRoom",
  MessageRoomSchema
);
