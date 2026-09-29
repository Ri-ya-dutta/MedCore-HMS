import express from "express";

import {
    createPatientController,
    getPatientByIdController,
    updatePatientController,
    getPatientsController
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
    "/",
    authenticate,
    authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR"),
    getPatientsController
);

router.get(
    "/:id",
    authenticate,
    getPatientByIdController
);

router.put(
    "/:id",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "PATIENT"
    ),
    updatePatientController
);

export default router;