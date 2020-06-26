// schema.ts
import path from "path";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";

import { makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";

const typesArray = loadFilesSync(path.join(__dirname, "./schema"));
const resolverArray = loadFilesSync(
  path.join(__dirname, "./resolvers/*.(ts|js)")
);

const typeDefs = mergeTypeDefs(typesArray);
const resolvers = mergeResolvers(resolverArray);

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
export default schema;
