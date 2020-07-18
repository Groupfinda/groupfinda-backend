// resolverMap.ts
import { IResolvers } from "graphql-tools";
import { ReportType, Report, UserType } from "../models"
import { combineResolvers } from "graphql-resolvers";
import { isAuthenticated } from "./helpers/authorization";
import { SubmitReportType } from "./types";
import { ApolloError } from "apollo-server-express";

const reportResolver: IResolvers = {
    Query: {
        getAllReports: async (_, args: void): Promise<ReportType[]> => {
            return Report.find({});
        }
    },
    Mutation: {
        submitReport: combineResolvers(
            isAuthenticated,
            async (
                root: void,
                args: SubmitReportType,
                context
            ): Promise<boolean> => {
                if (
                    !args.title ||
                    !args.category ||
                    !args.description
                ) {
                    return false
                }
                let reportDetails = {
                    ...args,
                    user: context.currentUser.id,
                    dateCreated: new Date()
                }
                const report = new Report(reportDetails)
                try {
                    await report.save();
                    return true;
                } catch (err) {
                    throw new ApolloError("Failed to save report: " + err.message);
                }
            }
        )
    },
    Report: {
        user: async (root: ReportType): Promise<UserType> => {
            return (await root.populate("user").execPopulate()).user;
        }
    }
}

export default reportResolver;