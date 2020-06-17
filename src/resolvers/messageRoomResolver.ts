// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { GroupType, MessageRoom, MessageRoomType } from "../models";
import { GetMessageRoomType, SendMessageType, MessageType } from "./types";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";
import { ApolloError } from "apollo-server-express";

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
        const newMessage = {
          user: context.currentUser.id,
          createdAt: new Date(),
          text: message,
        };
        messageRoom.messages.push(newMessage);
        messageRoom.markModified("messages");

        await messageRoom.save();
        return true;
      }
    ),
  },
  MessageRoom: {
    group: async (root: MessageRoomType): Promise<GroupType> => {
      return (await root.populate("group").execPopulate()).group;
    },
    messages: async (root: MessageRoomType): Promise<MessageType[]> => {
      console.log(root);
      const newMessages = (await root.populate("messages.user").execPopulate())
        .messages;
      console.log(newMessages);
      return newMessages;
    },
  },
};

export default messageRoomResolver;
