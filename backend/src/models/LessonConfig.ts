import mongoose from "mongoose";

const LessonConfigSchema = new mongoose.Schema(
    {
       livesPerLesson: Number,
       livesRefreshCooldown: Number,            // cooldown period, seconds
       expPerLesson: Number,               // users get exp the first time they complete a lesson           
    }
);

const LessonConfig = mongoose.model("LessonConfig", LessonConfigSchema);
export default LessonConfig;