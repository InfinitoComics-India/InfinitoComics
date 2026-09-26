import express from "express";
const router = express.Router();
import ArtistController from "../controller/artist-controller.js";
import { adminauthenticate } from "../middleware/adminauth.js";

router.get("/",          ArtistController.getAllArtists);
router.get("/:id",       ArtistController.getArtistById);
router.post("/",         adminauthenticate, ArtistController.createArtist);
router.put("/:id",       adminauthenticate, ArtistController.updateArtist);
router.delete("/:id",    adminauthenticate, ArtistController.deleteArtist);

export default router;
