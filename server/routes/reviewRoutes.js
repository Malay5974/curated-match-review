import { Router } from "express";
import { getReview, postDecision, postProfile, postReset } from "../controllers/reviewController.js";

export const reviewRoutes = Router();

reviewRoutes.get("/review", getReview);
reviewRoutes.post("/decisions/:profileId", postDecision);
reviewRoutes.post("/profiles", postProfile);
reviewRoutes.post("/reset", postReset);
