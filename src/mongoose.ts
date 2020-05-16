import mongoose from "mongoose";

const MONGO_HOST = process.env.MONGO_HOST;
const MONGO_PORT = process.env.MONGO_PORT;
const MONGO_DATABASE = process.env.MONGO_DATABASE;

let mongoURI: string;
let options: {};

if (process.env.DEVELOPMENT) {
  mongoURI = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`;
  options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
} else {
  mongoURI = "To be done";
  options = {};
}

mongoose.set("useFindAndModify", false);

export const mongoConnectWithRetry = (): void => {
  console.log("Attempting to connect");
  mongoose.connect(mongoURI, options).catch((err) => {
    console.log("MongoDB connection failed, retrying in 1 second");
    setTimeout(mongoConnectWithRetry, 1000);
  });
};
