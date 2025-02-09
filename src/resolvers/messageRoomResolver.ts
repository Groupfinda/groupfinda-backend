// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { GroupType, MessageRoom, MessageRoomType, Group, User } from "../models";
import {
  GetMessageRoomType,
  SendMessageType,
  MessageSubscriptionPayload,
  MessageSubscriptionVariables,
} from "./types";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";
import { ApolloError, PubSub, withFilter } from "apollo-server-express";
import { sendMessageNotification } from '../notifications'

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

        Group.findById(messageRoom.group).populate('event').exec().then(group => {
          group?.members.forEach(member => {
            User.findById(member).exec().then(user => {

              if (user?.id.toString() !== context.currentUser.id.toString()) {
                if (user?.expoToken) {
                  sendMessageNotification(user?.expoToken, group.event.title, group.id.toString()).catch(err => console.log(err))
                }
              }



            })
          })
        })
        return true;
      }
    ),
  },
  Subscription: {
    messageSent: {
      subscribe: withFilter(
        () => pubsub.asyncIterator("MESSAGE_SENT"),
        (
          payload: MessageSubscriptionPayload,
          variables: MessageSubscriptionVariables
        ) => {
          return payload.messageSent.room === variables.messageRoomId;
        }
      ),
    },
  },
  MessageRoom: {
    group: async (root: MessageRoomType): Promise<GroupType> => {
      return (await root.populate("group").execPopulate()).group;
    },
  },
};

export default messageRoomResolver;
