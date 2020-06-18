import express from "express";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import { createServer } from "http";
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import { mongoConnectWithRetry } from "./mongoose";
import jwt from "jsonwebtoken";
import config from "./config";

const PORT = config.PORT;

console.log(`We are running in ${config.NODE_ENV}`);
mongoConnectWithRetry();

const app = express();
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    //Check for any auth headers
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      try {
        const decodedToken = jwt.verify(
          auth.substring(7),
          <jwt.Secret>config.TOKEN_SECRET
        );
        return { currentUser: decodedToken };
      } catch (err) {
        return { currentUser: null };
      }
    }
    return { currentUser: null };
  },
  validationRules: [depthLimit(7)],
});
app.use("*", cors());
app.use(compression());
server.applyMiddleware({ app, path: "/graphql" });
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: PORT }, (): void => {
  console.log(
    `GraphQL is now running on http://localhost:${PORT}${server.graphqlPath}`
  );
  console.log(
    `Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`
  );
});
