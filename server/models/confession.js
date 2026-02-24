import mongoose from "mongoose";

const reactedUserSchema = new mongoose.Schema(
  {
    userID: { type: String, required: true },
    type: { type: String, enum: ["heart", "laugh", "sad"], required: true },
  },
  { _id: false }
);

const confessionSchema = new mongoose.Schema({
  anonId: String,
  text: {
    type: String,
    required: true,
  },
  vibe: String,
  tags: [String],
  secretCode: {
    type: String,
    required: true,
  },
  userID: String,
  reactions: {
    heart: { type: Number, default: 0 },
    laugh: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
  },
  reactedUsers: [reactedUserSchema],
  comments: [
    {
      text: String,
      userID: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});
export default mongoose.model("Confession", confessionSchema);
