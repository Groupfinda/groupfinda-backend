// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { GroupType, Group } from "../models";
import {
    GetGroupType
} from "./types";

const groupResolver: IResolvers = {
    Query: {
        getGroups: async (_, args: GetGroupType): Promise<GroupType[]> => {
            if (args.eventId) {
                return Group.find({
                    event: args.eventId
                });
            }
            else {
                return Group.find({});
            }
        }
    }
}

export default groupResolver;