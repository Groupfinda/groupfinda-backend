// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { GroupType, MessageRoom, MessageRoomType } from "../models";
import { GetMessageRoomType, SendMessageType } from "./types";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";
import { ApolloError } from "apollo-server-express";
import { PubSub } from "apollo-server-express";

const pubsub = new PubSub();

const messageRoomResolver: IResolvers = {
  Query: {
    getMessageRoom: combineResolvers(
      isAuthenticated,
      async (
        _: void,
        args: GetMessageRoomType
      ): Promise<MessageRoomType | null> => {
        return await MessageRoom.findById(args.id);
      }
    ),
  },
  Mutation: {
    sendMessage: combineResolvers(
      isAuthenticated,
      async (_: void, args: SendMessageType, context): Promise<boolean> => {
        const { messageRoomId, message } = args;
        const messageRoom = await MessageRoom.findById(messageRoomId);
        if (!messageRoom) throw new ApolloError("No such room");

        messageRoom.messages.push(message);
        messageRoom.markModified("messages");
        console.log("Publishing message");
        pubsub.publish("MESSAGE_SENT", {
          messageSent: {
            message,
            room: messageRoomId,
          },
        });
        await messageRoom.save();
        return true;
      }
    ),
  },
  Subscription: {
    messageSent: {
      subscribe: () => pubsub.asyncIterator("MESSAGE_SENT"),
    },
  },
  MessageRoom: {
    group: async (root: MessageRoomType): Promise<GroupType> => {
      return (await root.populate("group").execPopulate()).group;
    },
  },
};

export default messageRoomResolver;
