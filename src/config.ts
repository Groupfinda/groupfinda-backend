require("dotenv").config();

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID as string;
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY as string;
const BUCKET_URL = process.env.BUCKET_URL;
const EMAIL_ADD = process.env.EMAIL_ADD;
const EMAIL_PW = process.env.EMAIL_PW;

const ImageURLCreator = (id: string, imageName: string) =>
  `${BUCKET_URL}/users/${id}/${imageName}`;

let MONGO_HOST: string | undefined;
let MONGO_PORT: string | undefined;
let MONGO_DATABASE: string | undefined;
let TOKEN_SECRET: string | undefined;

//Production
let MONGO_USERNAME: string | undefined;
let MONGO_PASSWORD: string | undefined;

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
} else {
  MONGO_USERNAME = process.env.MONGO_USERNAME;
  MONGO_PASSWORD = process.env.MONGO_PASSWORD;
  MONGO_HOST = process.env.MONGO_HOST;
  MONGO_DATABASE = process.env.MONGO_DATABASE;
  TOKEN_SECRET = process.env.TOKEN_SECRET;
}

export default {
  NODE_ENV,
  PORT,
  MONGO_USERNAME,
  MONGO_PASSWORD,
  MONGO_HOST,
  MONGO_PORT,
  MONGO_DATABASE,
  TOKEN_SECRET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  BUCKET_URL,
  ImageURLCreator,
  EMAIL_ADD,
  EMAIL_PW,
};
