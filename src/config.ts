const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;

let MONGO_HOST: string | undefined;
let MONGO_PORT: string | undefined;
let MONGO_DATABASE: string | undefined;
let TOKEN_SECRET: string | undefined;

if (NODE_ENV === "development") {
  MONGO_HOST = "mongodb";
  MONGO_PORT = "27017";
  MONGO_DATABASE = "database";
  TOKEN_SECRET = "secret";
} else if (NODE_ENV === "test") {
  MONGO_HOST = "mongodb";
  MONGO_PORT = "27017";
  MONGO_DATABASE = "test";
  TOKEN_SECRET = "secret";
} else if (NODE_ENV === "production") {
  MONGO_HOST = process.env.MONGO_HOST;
  MONGO_PORT = process.env.MONGO_PORT;
  MONGO_DATABASE = process.env.MONGO_DATABASE;
  TOKEN_SECRET = process.env.TOKEN_SECRET;
}

export default {
  NODE_ENV,
  PORT,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_DATABASE,
  TOKEN_SECRET,
};
