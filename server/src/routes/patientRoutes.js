import express from "express";

import { createPatientController } from "../controllers/patientController.js";

import {
    authenticate,
    authorizeRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    authenticate,
    authorizeRoles("ADMIN", "RECEPTIONIST"),
    createPatientController
);

export default router;