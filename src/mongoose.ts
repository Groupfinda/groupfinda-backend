import mongoose from "mongoose";
import runScript from "./seed/data";
import config from "./config";

const { MONGO_HOST, MONGO_PORT, MONGO_DATABASE, NODE_ENV, MONGO_USERNAME, MONGO_PASSWORD } = config;
let mongoURI: string
if (NODE_ENV === "production") {
  mongoURI = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}/${MONGO_DATABASE}?retryWrites=true&w=majority`
}
else {
  mongoURI = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`;
}
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.set("useFindAndModify", false);

export const mongoConnectWithRetry = async (): Promise<void> => {
  console.log("Attempting to connect");
  try {
    await mongoose.connect(mongoURI, options);
    if (NODE_ENV === "development") await runScript();
  } catch (err) {
    console.log("MongoDB connection failed, retrying in 1 second");
    setTimeout(mongoConnectWithRetry, 1000);
  }
};
