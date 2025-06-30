import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { acceptFriendRequest, getMyFriends, getRecommendedUsers, sendFriendRequest } from "../controllers/user.controller.js";

const router = express.Router();

// permet d'ajouter à toutes les routes get la sécurité de "protectRoute"
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

export default router;