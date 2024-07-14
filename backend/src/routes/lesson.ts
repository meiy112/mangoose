import express, { Router, Request, Response } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import lessonService from '../services/lessonService';
import openAIService from '../services/openAIService';
import Lesson from '../models/Lesson';

const router: Router = express.Router();

/*
Gets summary of all lessons for a given user
Returns a list of lessons with _id and name
*/

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const lessons = await lessonService.getLessonsSummary(userId);
    res.status(200).json(lessons);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/*
Gets a full lesson, with each component inside of the contents list
Reauest params:
  - id: the id of the lesson
// stub 
// TODO
*/

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  // stub
  try {
    const lessonContent = [
      {
        id: "astronomy-intro-id",
        type: "intro",
        title: "Astronomy",
        content: [
          "Astronomy is the study of me celestial objects and phenomena, encompassing the structure of our solar system, the nature of stars and galaxies, and the processes that drive cosmic events. By exploring the Sun, planets, and other celestial bodies, we can build a solid foundation of astronomical knowledge.",
        ],
        fact: "One day on Venus is longer than one year on Venus. Venus takes about 243 Earth days to rotate once on its axis but only 225 Earth days to orbit the Sun.",
      },
      {
        id: "astronomy-info-id",
        type: "info",
        title: "The Sun",
        content: [
          "The Sun is the center of our solar system and is primarily composed of hydrogen and helium.",
          "It produces energy through a process called nuclear fusion, where hydrogen nuclei combine to form helium, releasing immense amounts of energy in the process.",
          "This energy is what makes the Sun shine and provides light and heat to our solar system.",
        ],
        fact: "The Sun accounts for about 99.86% of the total mass of the solar system!",
      },
      {
        id: "astronomy-dnd-id",
        type: "dnd",
        content: [
          "The Sun is primarily composed of ",
          0,
          " and ",
          1,
          ". The energy produced by the Sun comes from a process called ",
          2,
          ".",
        ],
        draggable: {
          "nuclear fusion": 2,
          helium: 1,
          asteroid: -1,
          oxygen: -1,
          hydrogen: 0,
        },
      },
      {
        id: "astronomy-matching-id",
        type: "matching",
        terms: {
          "Spiral Galaxy": 0,
          "Elliptical Galaxy": 1,
          "Irregular Galaxy": 2,
          "Milky Way": 3,
        },
        definitions: {
          "A type of galaxy with no distinct shape, often chaotic in appearance.": 2,
          "A large spiral galaxy that contains our Solar System.": 3,
    
          "A galaxy that has a smooth, featureless light profile and is more three-dimensional in shape.": 1,
          "A galaxy characterized by a flat, rotating disk containing stars, gas, and dust.": 0,
        },
      },
      {
        id: "astronomy-mc-id",
        type: "mc",
        question: 'Which planet is known as the "Red Planet"?',
        options: {
          Venus: false,
          Mars: true,
          Jupiter: false,
          Saturn: false,
        },
      },
    ];

    const lesson = {
      id: "astronomy-lesson-id",
      name: "Astronomy Lesson",
      author: "some-user-id",
      lives: 3,
      livesLastZeroTime: new Date(2000, 0, 1),
      streakCount: 0,
      pageProgress: 0,
      highScore: 0,
      currentScore: 0,
      content: lessonContent, 
    };

    res.status(200).json(lesson);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});


/*
generates a lesson using openai based on a given contents string, then returns the lesson.
*/
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { content } = req.body;
  try {
    const lesson = await lessonService.generateLesson(userId, content);
    res.status(200).json(lesson);
  } catch (error: any) {
    res.status(error.code || 500).json({ message: error.message });
  }
});

export { router as lessonsRouter };
