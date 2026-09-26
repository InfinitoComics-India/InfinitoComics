import express from "express";
const router = express.Router();
import GameController from "../controller/game-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";

router.get("/",          GameController.getAllGames);
router.get("/:id",       GameController.getGameById);
router.post("/",         adminauthenticate, GameController.createGame);
router.put("/:id",       adminauthenticate, GameController.updateGame);
router.delete("/:id",    adminauthenticate, GameController.deleteGame);

export default router;
