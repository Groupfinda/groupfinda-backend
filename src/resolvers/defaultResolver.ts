// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import { JSONResolver } from "graphql-scalars";
import { getPresignedUploadURL } from "../aws-setup";
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";
import axios from "axios";

const defaultResolver: IResolvers = {
  Query: {
    helloWorld(_: void, args: void): string {
      axios
        .get("http://python-backend:5000/")
        .then((res: any) => console.log(res))
        .catch((err) => console.log(err));
      return "👋 Hello world! v2 👋";
    },
    pythonTest: async (root: void, args: void, context): Promise<any> => {
      return axios
        .get("http://python-backend:5000/")
        .then((data: any) => data.data);
    },
    postTest: async (root: void, args: void, context): Promise<boolean> => {
      return axios
        .post("http://python-backend:5000/match", {
          userId: context.currentUser.id,
          groupSize: 4,
          eventId: "eventIDASDAD",
        })
        .then((data: any) => {
          console.log(data.data);
          return true;
        });
    },
  },
  Mutation: {
    refetchQuery(): string {
      return "Refetching";
    },
    getPresignedURL: combineResolvers(
      isAuthenticated,
      (_: void, args: { key: string }, context): any => {
        const urlData = getPresignedUploadURL(
          `users/${context.currentUser.id}/${args.key}`,
          `image`
        );

        return urlData;
      }
    ),
  },
  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return new Date(+ast.value);
      }
      return null;
    },
  }),
  JSON: JSONResolver,
};

export default defaultResolver;
