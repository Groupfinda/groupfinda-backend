import mongoose, { Schema, Document } from "mongoose";

//Interface for RangeQuestion type without mongoDB
export interface RawRangeQuestionType {
  content: string;
  order: number;
}

//Interface for RangeQuestion type with mongoDB
export interface RangeQuestionType extends Document, RawRangeQuestionType {}

const RangeQuestionSchema: Schema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
});

export const RangeQuestion = mongoose.model<RangeQuestionType>(
  "RangeQuestion",
  RangeQuestionSchema
);
