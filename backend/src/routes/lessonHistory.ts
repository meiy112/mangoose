import express, { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import lessonHistoryService from '../services/lessonHistoryService';

const router: Router = express.Router();

/*
creates a record of the given user completing a lesson
path params:
  - id: the id of the lesson that you want to record
returns: the created object
*/
router.post("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const record = await lessonHistoryService.record(userId, id);
    res.status(201).json(record);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/* 
  checks if the current user has completed a given lesson before
  path params:
  - id: the id of the lesson that you want to check
  returns:
  {
    hasCompletedBefore: boolean
  }
*/
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const result = await lessonHistoryService.findLessonHistory(userId, id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
})


export { router as lessonHistoryRouter };
