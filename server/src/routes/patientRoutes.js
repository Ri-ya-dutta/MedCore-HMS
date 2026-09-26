import express from "express";

import {
    createPatientController,
    getPatientByIdController
} from "../controllers/patientController.js";

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
router.get(
    "/:id",
    authenticate,
    getPatientByIdController
);

export default router;