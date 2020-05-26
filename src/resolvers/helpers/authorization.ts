import { ForbiddenError } from "apollo-server-express";
import { skip, combineResolvers } from "graphql-resolvers";
import { UserType, User } from "../../models/User";

interface ContextType {
  currentUser: UserType;
}

/**
 * Most basic form of authentication to ensure user token is valid i.e. User is logged in
 */
export const isAuthenticated = async (
  _: any,
  __: any,
  context: ContextType
) => {
  if (context.currentUser) {
    try {
      const user = await User.findById(context.currentUser.id).exec();
      return user ? skip : new ForbiddenError("Authentication as user failed");
    } catch (err) {
      return new ForbiddenError("Authentication as user failed");
    }
  }
  return new ForbiddenError("Authentication as user failed");
};

/**
 * Ensures that user is verified to carry out the action
 */
export const isVerified = combineResolvers(
  isAuthenticated,
  (_: any, __: any, context: ContextType) =>
    context.currentUser.isVerified
      ? skip
      : new ForbiddenError("User is not verified")
);

/**
 * Ensures that user is an event host to carry out the action
 */
export const isHost = combineResolvers(
  isAuthenticated,
  (_, __, context: ContextType) =>
    context.currentUser.role === "HOST" || context.currentUser.role === "ADMIN"
      ? skip
      : new ForbiddenError("User is not of host type")
);

/**
 * Ensures that user is an admin to carry out the action
 */
export const isAdmin = combineResolvers(
  isAuthenticated,
  (_, __, context: ContextType) =>
    context.currentUser.role === "ADMIN"
      ? skip
      : new ForbiddenError("Only admin is allowed to carry out this function")
);
