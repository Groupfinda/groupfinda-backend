// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { GroupType, Group, EventType } from "../models";
import { GetGroupType } from "./types";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";

const groupResolver: IResolvers = {
  Query: {
    getGroups: async (_, args: GetGroupType): Promise<GroupType[]> => {
      if (args.eventId) {
        return Group.find({
          event: args.eventId,
        });
      } else {
        return Group.find({});
      }
    },
    getUserGroup: combineResolvers(
      isAuthenticated,
      async (_: void, args: GetGroupType, context): Promise<string> => {
        if (args.eventId) {
          const group = await Group.findOne({
            event: args.eventId,
            members: context.currentUser.id
          })
          if (group && group.messageRoom) {
            return group.messageRoom.toString()
          }
        }
        return ""
      }
    )
  },
  Group: {
    event: async (root: GroupType): Promise<EventType> => {
      return (await root.populate("event").execPopulate()).event;
    },
  },
};

export default groupResolver;
