import { ForbiddenError } from "apollo-server-express";
import { skip, combineResolvers } from "graphql-resolvers";
import { UserType } from "../../models/User";

interface ContextType {
  currentUser: UserType;
}
export const isAuthenticated = (_: any, __: any, context: ContextType) => {
  context.currentUser
    ? skip
    : new ForbiddenError("Authentication as user failed");
};

export const isVerified = combineResolvers(
  isAuthenticated,
  (_: any, __: any, context: ContextType) => {
    context.currentUser.isVerified
      ? skip
      : new ForbiddenError("User is not verified");
  }
);
