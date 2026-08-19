import { Schema, model, Types } from "mongoose";
const schema = new Schema({ userId: { type: Types.ObjectId, ref: "User", required: true, unique: true }, enabled: { type: Boolean, default: false }, localTime: { type: String, default: "18:00", match: /^([01]\d|2[0-3]):[0-5]\d$/ }, weekdays: { type: [Number], default: [0,1,2,3,4,5,6] }, quietStart: { type: String, default: "21:00", match: /^([01]\d|2[0-3]):[0-5]\d$/ }, quietEnd: { type: String, default: "08:00", match: /^([01]\d|2[0-3]):[0-5]\d$/ }, nextReminderAt: { type: Date, index: true }, unsubscribedAt: { type: Date } }, { timestamps: true });
schema.index({ enabled: 1, nextReminderAt: 1 });
export const ReminderPreference = model("ReminderPreference", schema);
