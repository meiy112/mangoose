import mongoose from "mongoose";
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profile: {
      // Profile Picture id
      type: ObjectId,
      ref: "ProfilePicture",
    },
    history: {
      // history id
      type: ObjectId,
      ref: "UserHistory",
    },
    dailyStreakLastUpdateTime: Date,
    dailyStreakCount: Number,
    longestStreak: Number,
    totalExp: Number,
  },
  { timestamps: true }
);

const User = mongoose.model("Users", UserSchema);
export default User;
