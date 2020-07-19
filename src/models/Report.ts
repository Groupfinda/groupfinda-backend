import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "./";

//Interface for report type without mongoDB
export interface RawReportType {
    title: string;
    user: UserType["_id"];
    category: string;
    description: string;
    dateCreated: Date;
}

export interface ReportType extends Document, RawReportType {}

const reportSchema: Schema = new mongoose.Schema({
    title: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    category: String,
    description: String,
    dateCreated: Date,
})

export const Report = mongoose.model<ReportType>("Report", reportSchema);