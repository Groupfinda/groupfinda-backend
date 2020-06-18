// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { GroupType, Group, EventType } from "../models";
import { GetGroupType } from "./types";

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
  },
  Group: {
    event: async (root: GroupType): Promise<EventType> => {
      return (await root.populate("event").execPopulate()).event;
    },
  },
};

export default groupResolver;
