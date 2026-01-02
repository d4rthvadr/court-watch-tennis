import { Router } from "express";
import { gameController } from "../game-controller";

const router = Router();

router.get("/", (_, res) => {
  const availableGames = gameController.findAll();
  res.status(200).json({ data: availableGames });
});

export const gameRouter = router;
