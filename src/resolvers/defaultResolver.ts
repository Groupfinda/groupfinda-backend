// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import { JSONResolver } from "graphql-scalars";

const defaultResolver: IResolvers = {
  Query: {
    helloWorld(_: void, args: void): string {
      return "👋 Hello world! 👋";
    },
  },
  Mutation: {
    refetchQuery(): string {
      return "Refetching";
    },
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
