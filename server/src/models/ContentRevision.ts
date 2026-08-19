import { Schema, model, Types } from "mongoose";
const schema = new Schema({ contentType: { type: String, enum: ["lesson", "assessment"], required: true }, contentId: { type: Types.ObjectId, required: true }, version: { type: Number, required: true, min: 1 }, snapshot: { type: Schema.Types.Mixed, required: true }, changeNote: { type: String, required: true, maxlength: 2000 }, authorUserId: { type: Types.ObjectId, ref: "User", required: true } }, { timestamps: true });
schema.index({ contentType: 1, contentId: 1, version: -1 }, { unique: true });
export const ContentRevision = model("ContentRevision", schema);
