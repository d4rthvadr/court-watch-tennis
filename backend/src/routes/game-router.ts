import { Router, Request, Response } from "express";
import { gameController } from "../controllers";
import { GameStatus } from "../types";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const availableGames = await gameController.findAll();
    res.status(200).json({ data: availableGames });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const game = await gameController.find(req.params.id);
    res.status(200).json({ data: game });
  }),
);

router.patch(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { status, ...otherUpdates } = req.body;

    const updatedGame = await gameController.update(req.params.id, {
      status: status as GameStatus,
      ...otherUpdates,
    });

    res.status(200).json({ data: updatedGame });
  }),
);

router.patch(
  "/:id/status",
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updatedGame = await gameController.updateStatus(
      req.params.id,
      status as GameStatus,
    );

    res.status(200).json({ data: updatedGame });
  }),
);

export const gameRouter = router;
