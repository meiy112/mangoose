import express, { Router, Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import lessonService from "../services/lessonService";
import openAIService from "../services/openAIService";
import LessonConfig from "../models/LessonConfig";
import multer from "multer";
import pdfParse from "pdf-parse";

const router: Router = express.Router();

/*
  get global lesson configurations
  */
router.get("/config", async (req: Request, res: Response) => {
  try {
    const configs = await LessonConfig.find();
    res.status(200).json(configs[0]);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

// returns the current lesson of the day
router.get("/lessonOfTheDay", async (req: Request, res: Response) => {
  try {
    const lesson = await lessonService.getLessonOfTheDay();
    res.status(200).json(lesson);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/*
  gets all lesson summaries except for the current user
  */
router.get("/all", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const lessons = await lessonService.getAllLessonSummary(userId);
    res.status(200).json(lessons);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/*
  Gets summary of all lessons for a given user
  Returns a list of lessons with _id and name
  */
router.get("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const lessons = await lessonService.getLessonsSummary(userId);
    res.status(200).json(lessons);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/*
  Gets a full lesson, with each component inside of the contents list
  Reauest params:
    - id: the id of the lesson
  */
router.get("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const lessonId = req.params.id;
    const lesson = await lessonService.getLesson(lessonId);
    res.status(200).json(lesson);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/*
  deletes a  lesson
  Reauest params:
    - id: the id of the lesson
  */
router.delete("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.id;
    const lesson = await lessonService.deleteLesson(userId, lessonId);
    res.status(200).json(lesson);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/*
  updates an entire lesson, any fields provided will be updates. If a non existing field is provided, it will be silently ignored
  Reauest params:
    - id: the id of the lesson

  Reuquest Body
  Lesson obj
  {
    lesson : {
      <your fields here>
    }
  }
  */
router.patch("/:id", authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const lessonId = req.params.id;
    const { lesson } = req.body;
    const updatedLesson = await lessonService.updateLesson(userId, lessonId, lesson);
    res.status(200).json(updatedLesson);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/*
Gets the title of a lesson by id
Reauest params:
  - id: the id of the lesson
*/
router.get("/:id/title", async (req: Request, res: Response) => {
  try {
    const lessonId = req.params.id;
    const title = await lessonService.getLessonTitle(lessonId);
    res.status(200).json({ title });
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/*
  generates a lesson using openai based on a given contents string, then returns the lesson.
  */
router.post("/", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { content } = req.body;
  try {
    const lesson = await lessonService.generateLesson(userId, content);
    res.status(200).json(lesson);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/*
  makes and returns a fresh copy of someone else's lesson, where the instanceOwner will be the current user
  Reauest params:
    - id: the id of the lesson to be copied
  */
router.get("/copy/:id", authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const lessonId = req.params.id;

  try {
    const lesson = await lessonService.copyLesson(userId, lessonId);
    res.status(200).json(lesson);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

/*
  Handles chat requests by sending a user prompt to the OpenAI service and returning the response.
  Request Body:
    - prompt: The text input from the user for which a response is requested.
  */
router.post(
  "/api/chat",
  authMiddleware,
  async (req: Request, res: Response) => {
    const { prompt } = req.body;

    try {
      const reply = await openAIService.getChatResponse(prompt);
      res.status(200).json({ reply });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unknown error occurred" });
      }
    }
  }
);

/**
 * Handles the PDF conversion to a string for lesson creation.
 * Request Body:
 *  - file: The PDF file to be converted.
 */
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

router.post(
  "/api/upload",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const dataBuffer = file.buffer; // Use file buffer from memory storage
      const data = await pdfParse(dataBuffer);
      res.json({ text: data.text });
    } catch (error) {
      res.status(500).json({ error: "Failed to process PDF" });
    }
  }
);

export { router as lessonsRouter };
