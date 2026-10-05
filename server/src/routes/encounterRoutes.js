import express from "express";

import {
    authenticate,
    authorizeRoles
} from "../middleware/authMiddleware.js";

import {
    createEncounterController,
    getEncountersController,
    getEncounterByIdController,
    updateEncounterController
} from "../controllers/encounterController.js";


const router = express.Router();


// Create encounter
// DOCTOR only
router.post(
    "/",
    authenticate,
    authorizeRoles("DOCTOR"),
    createEncounterController
);


// View encounters
// ADMIN, DOCTOR, PATIENT
router.get(
    "/",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "PATIENT"
    ),
    getEncountersController
);


// View one encounter
// ADMIN, DOCTOR, PATIENT
router.get(
    "/:id",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "PATIENT"
    ),
    getEncounterByIdController
);


// Update encounter
// DOCTOR only
router.put(
    "/:id",
    authenticate,
    authorizeRoles("DOCTOR"),
    updateEncounterController
);


export default router;