import { todoController } from "../controllers/todo.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

import { Router } from "express";

const router = Router();

// GET /todos
router.get("/", authMiddleware, todoController.read);

// GET /todos/:id
router.get("/:id", authMiddleware, todoController.readById);

// POST /todos
router.post("/", authMiddleware, todoController.create);

// PUT /todos/:id
router.put("/:id", authMiddleware, todoController.update);

// DELETE /todos/:id
router.delete("/:id", authMiddleware, todoController.remove);

export default router;
