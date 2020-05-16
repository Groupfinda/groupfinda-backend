// schema.ts
import "graphql-import-node";
import path from "path";
import { fileLoader, mergeTypes, mergeResolvers } from "merge-graphql-schemas";

import { makeExecutableSchema } from "graphql-tools";
import { GraphQLSchema } from "graphql";

const typesArray = fileLoader(path.join(__dirname, "./schema"));
const resolverArray = fileLoader(path.join(__dirname, "./resolvers"));

const typeDefs = mergeTypes(typesArray, { all: true });
const resolvers = mergeResolvers(resolverArray);

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
export default schema;
