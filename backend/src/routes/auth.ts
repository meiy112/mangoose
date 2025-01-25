import express, { Router } from "express";
import authService from "../services/authService";

const router: Router = express.Router();

// user registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    const result = await authService.registerUser(
      name,
      email,
      username,
      password
    );
    res.status(201).json(result);
  } catch (error: any) {
      res.status(400).json({
        status: 400,
        message: error.message.toString(),
      });
    }
});

// user login
router.post("/login", async (req, res) => {
  const SYSTEM_USER = "mangoose";

  try {
    const { username, password } = req.body;

    if (username === SYSTEM_USER) {
      res.status(401).json({
        status: 401,
        message: "Cannot log in"
      });
      return;
    }

    const token = await authService.loginUser(username, password);

    res.status(200).json({ token: token });
  } catch (error: any) {
      res.status(400).json({
        status: 400,
        message: error.message.toString(),
      });
    }
});

export { router as authRouter };
