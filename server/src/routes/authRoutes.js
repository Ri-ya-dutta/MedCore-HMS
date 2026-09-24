import express from "express";
import { 
    register,
    login,
    getMe,
    adminTest
 } from "../controllers/authController.js";

 import { 
    authenticate,
    authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

router.get(
    "/admin-test",
    authenticate,
    authorizeRoles("ADMIN"),
    adminTest
);

export default router;