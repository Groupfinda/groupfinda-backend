import AWS from "aws-sdk";
import config from "./config";

const credentials = {
  accessKeyId: config.S3_ACCESS_KEY_ID,
  secretAccessKey: config.S3_SECRET_ACCESS_KEY,
};

AWS.config.update({ credentials: credentials, region: "ap-southeast-1" });

const s3 = new AWS.S3();

export const getPresignedUploadURL = (key: string, contentType: string) => {
  const params = {
    Expires: 600,
    Bucket: "groupfinda",
    Conditions: [["content-length-range", 100, 10000000]],
    Fields: {
      "Content-Type": contentType,
      key,
    },
  };

  return s3.createPresignedPost(params);
};
