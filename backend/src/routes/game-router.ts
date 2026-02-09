import { Router, Request, Response } from "express";
import { gameController } from "../controllers";
import { asyncHandler } from "../util";
import { GameStatus } from "../types";

const router = Router();

router.get(
  "/",
  asyncHandler((req: Request, res: Response) => {
    const availableGames = gameController.findAll();
    res.status(200).json({ data: availableGames });
  }),
);

router.get(
  "/:id",
  asyncHandler((req: Request, res: Response) => {
    const game = gameController.find(req.params.id);
    res.status(200).json({ data: game });
  }),
);

router.patch(
  "/:id",
  asyncHandler((req: Request, res: Response) => {
    const { status, ...otherUpdates } = req.body;

    const updatedGame = gameController.update(req.params.id, {
      status: status as GameStatus,
      ...otherUpdates,
    });

    res.status(200).json({ data: updatedGame });
  }),
);

router.patch(
  "/:id/status",
  asyncHandler((req: Request, res: Response) => {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updatedGame = gameController.updateStatus(
      req.params.id,
      status as GameStatus,
    );

    res.status(200).json({ data: updatedGame });
  }),
);

export const gameRouter = router;
