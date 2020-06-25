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
import bodyParser from "body-parser";
import { Group, MessageRoom, User } from "./models";

type ConnectionParams = {
  token: string;
};
const PORT = config.PORT;
const jsonParser = bodyParser.json();

console.log(`We are running in ${config.NODE_ENV}`);
mongoConnectWithRetry();

const validateToken = (token: string) => {
  try {
    return jwt.verify(token, <jwt.Secret>config.TOKEN_SECRET);
  } catch (err) {
    return null;
  }
};
const app = express();
const server = new ApolloServer({
  schema,
  introspection: true,
  playground: true,
  subscriptions: {
    onConnect: (connectionParams) => {
      let params = <ConnectionParams>connectionParams;
      if (params.token) {
        return { currentUser: validateToken(params.token) };
      }
      return { currentUser: null };
    },
  },
  context: async ({ req }) => {
    //Check for any auth headers
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const token = auth.substring(7);
      return { currentUser: validateToken(token) };
    }
    return { currentUser: null };
  },

  validationRules: [depthLimit(7)],
});
app.use("*", cors());
app.use(compression());
app.post("/newgroup", jsonParser, async (req, res) => {
  const { groupId } = req.body;
  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.send("no group found");
    }
    const messageRoom = new MessageRoom({
      group: group?.id,
      dateCreated: new Date(),
    });
    group.messageRoom = messageRoom.id;
    group.markModified("messageRoom");

    for (let userId of group.members) {
      const user = await User.findById(userId);
      if (user) {
        user.groups.push(group.id);
        await user.save();
      }
    }

    await group.save();
    await messageRoom.save();
    console.log(groupId);
    return res.send("Success");
  } catch (err) {
    return res.send(err);
  }
});
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
