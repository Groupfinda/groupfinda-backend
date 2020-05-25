import { ForbiddenError } from "apollo-server-express";
import { skip, combineResolvers } from "graphql-resolvers";
import { UserType } from "../../models/User";

interface ContextType {
  currentUser: UserType;
}
export const isAuthenticated = (_: any, __: any, context: ContextType) =>
  context.currentUser
    ? skip
    : new ForbiddenError("Authentication as user failed");

export const isVerified = combineResolvers(
  isAuthenticated,
  (_: any, __: any, context: ContextType) =>
    context.currentUser.isVerified
      ? skip
      : new ForbiddenError("User is not verified")
);

export const isHost = combineResolvers(
  isAuthenticated,
  (_, __, context: ContextType) =>
    context.currentUser.role === "HOST" || context.currentUser.role === "ADMIN"
      ? skip
      : new ForbiddenError("User is not of host type")
);

export const isAdmin = combineResolvers(
  isAuthenticated,
  (_, __, context: ContextType) =>
    context.currentUser.role === "ADMIN"
      ? skip
      : new ForbiddenError("Only admin is allowed to carry out this function")
);
