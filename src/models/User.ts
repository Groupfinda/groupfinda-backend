import mongoose, { Schema, Document } from "mongoose";
import { ProfileType, GroupType } from "./";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";

// Constant for number of salt rounds
const saltRounds = 10;

//Interface for user type without mongoDB
export interface RawUserType {
  username: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  gender: string;
  avatar: string;
  isVerified: boolean;
  dateJoined: Date;
  birthday: Date;
  location: String;
  profile: ProfileType["_id"];
  groups: Array<GroupType["_id"]>;
  preferences: {
    lowerAge: number;
    upperAge: number;
    maxDistance: number;
  };
  newUser: boolean;
  role: "USER" | "HOST" | "ADMIN";
  expoToken: string;
}

//Interface for token return type
export interface TokenType {
  token: string;
}

//Interface for user type with mongoDB
export interface UserType extends Document, RawUserType {
  comparePassword(password: string): boolean;
  tokenize(): TokenType;
}

/**
 * User Schema type for mongoose
 */
const userSchema: Schema = new mongoose.Schema({
  username: String,
  firstName: String,
  lastName: String,
  password: String,
  email: String,
  gender: String,
  avatar: {
    type: String,
    default: "https://publicdomainvectors.org/photos/abstract-user-flat-3.png",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  dateJoined: Date,
  birthday: Date,
  location: String,
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  groups: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
  ],
  preferences: {
    lowerAge: Number,
    upperAge: Number,
    maxDistance: Number,
  },
  newUser: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ["USER", "HOST", "ADMIN"],
    default: "USER",
  },
  expoToken: {
    type: String,
    default: ""
  }
});

/**
 * Ensures that password is not returned when converting to JSON
 */
userSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.password;
  },
});

/**
 * Pre-hook in Mongoose that modifies input on save
 * Sets default dateJoined to now and isVerified to false
 * Hashes password if modified
 */
userSchema.pre("save", async function (next: mongoose.HookNextFunction) {
  const user = this;

  if (!user.get("dateJoined")) user.set("dateJoined", new Date());
  if (!user.get("isVerified")) user.set("isVerified", false);
  if (!user.get("isNew")) user.set("isNew", true);
  if (!user.get("role")) user.set("role", "USER");
  if (!user.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(user.get("password"), salt);
    user.set("password", hash);
  } catch (error) {
    console.log(error);
    next(error);
  }

  next();
});

/**
 * Defines a method in the User Schema to compare a password
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  const currentUser = this;
  try {
    const match: boolean = await bcrypt.compare(
      candidatePassword,
      currentUser.password
    );
    return match;
  } catch (err) {
    throw err;
  }
};

/**
 *  Defines a method in the User Schema to tokenize profile
 */
userSchema.methods.tokenize = function () {
  const user = this.toJSON();
  user.id = user._id;
  const secret = config.TOKEN_SECRET;
  return {
    token: jwt.sign(user, <jwt.Secret>secret),
  };
};

export const User = mongoose.model<UserType>("User", userSchema);
