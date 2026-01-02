import { Router, Request, Response } from "express";
import { gameController } from "../controllers";
import { asyncHandler } from "../util";

const router = Router();

router.get(
  "/",
  asyncHandler((req: Request, res: Response) => {
    const availableGames = gameController.findAll();
    res.status(200).json({ data: availableGames });
  })
);

export const gameRouter = router;
