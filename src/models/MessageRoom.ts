import mongoose, { Schema, Document } from "mongoose";
import { GroupType } from "./";

//Type for Message
export type MessageType = {
  _id: string;
  user: MessageUserType;
  createdAt: Date;
  text: string;
};

export type MessageUserType = {
  _id: string;
  name: string;
  avatar: string;
};

//Interface for MessageRoom type without mongoDB
export interface RawMessageRoomType {
  messages: Array<MessageType>;
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
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          name: String,
          avatar: String,
        },
        createdAt: Date,
        text: String,
        _id: String,
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
