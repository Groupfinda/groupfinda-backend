// resolverMap.ts
import { IResolvers } from "graphql-tools";

const defaultResolver: IResolvers = {
  Query: {
    helloWorld(_: void, args: void): string {
      return "👋 Hello world! 👋";
    },
  },
};

export default defaultResolver;
