import express from "express";
import { ApolloServer } from "apollo-server-express";
import depthLimit from "graphql-depth-limit";
import { createServer } from "http";
import compression from "compression";
import cors from "cors";
import schema from "./schema";
import { mongoConnectWithRetry } from "./mongoose";
import jwt from "jsonwebtoken";

const PORT = process.env.DEVELOPMENT
  ? process.env.BACKEND_DEVELOPMENT_PORT
  : 3000;

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
          <jwt.Secret>process.env.TOKEN_SECRET
        );
        return { currentUser: decodedToken };
      } catch (err) {
        return { currentUser: null };
      }
    }
  },
  validationRules: [depthLimit(7)],
});
app.use("*", cors());
app.use(compression());
server.applyMiddleware({ app, path: "/graphql" });
const httpServer = createServer(app);
httpServer.listen({ port: PORT }, (): void =>
  console.log(`GraphQL is now running on http://localhost:${PORT}/graphql`)
);
