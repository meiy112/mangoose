import LessonHistory from '../models/LessonHistory';
import mongoose from 'mongoose';
import ErrorWithCode from "../errors/ErrorWithCode";
import Lesson from '../models/Lesson';

class LessonHistoryService {
  // make a record of a user completing a lesson
  public async record(userId: string, lessonId: string) {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const lessonObjId = new mongoose.Types.ObjectId(lessonId);

    const record = {
      userId: userObjId,
      lessonId: lessonObjId,
      timestamp: new Date(),
    }

    try {
      const newRecord = await LessonHistory.create(record);
      return newRecord;
    } catch (error) {
      console.error("Error recording lesson history: ", error.message);
      throw error;
    }
  }

  // returns an array of object with fields "date" and "count" representing number of lessons completed each day
  // start and end are iso date strings
  public async getLessonsCompleted(userId: string, start: string, end: string) {
    const userObjId = new mongoose.Types.ObjectId(userId);
    const startDate = new Date(start);
    const endDate = new Date(end);

    const allDates = this.generateDateRange(startDate, endDate);
    
    try {
      const lessonsCompleted = await LessonHistory.aggregate([
        {
          // matches all documents of the correct user id and dates
          $match: {
            userId: userObjId,
            timestamp: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          // groups by day and counts
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
            },
            count: { $sum: 1 }
          }
        },
        // sort ascending
        {
          $sort: { "_id": 1 }
        }
      ]);

      console.log("Lessons Completed: ", lessonsCompleted)


      const lessonsMap = new Map<string, number>(lessonsCompleted.map((entry: any) => [entry._id, entry.count]));
      const result: any[] = allDates.map(date => ({
        date: date,
        count: lessonsMap.get(date) || 0
      }));

      return {
        completedLessonsByDay: result,
      };
    } catch (error) {
      console.error("Error fetching lessons completed: ", error.message);
      throw error;
    }
  }

  // generates a an array of dates with the given range
  private generateDateRange(start: Date, end: Date){
    const dates: string[] = [];
      const current = new Date(start);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      console.log("Generated Dates: ", dates);
      return dates;
  };

  // finds a lesson history matching the given userid and lessonid
  public async findLessonHistory(userId: string, id: string) {
    const lessonHistory = await LessonHistory.find({
      userId: new mongoose.Types.ObjectId(userId),
      lessonId: new mongoose.Types.ObjectId(id),
    });

    return {
      hasCompletedBefore: lessonHistory.length > 0,
    }
  }
}

export default new LessonHistoryService();
