import express from "express";

import {
    authenticate,
    authorizeRoles
} from "../middleware/authMiddleware.js";

import {
    createVitalsController,
    getVitalsByEncounterController,
    updateVitalsByEncounterController
} from "../controllers/vitalsController.js";


const router = express.Router();


// Create vitals for an encounter
router.post(
    "/:encounterId/vitals",
    authenticate,
    authorizeRoles("DOCTOR"),
    createVitalsController
);


// View vitals for an encounter
router.get(
    "/:encounterId/vitals",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "PATIENT"
    ),
    getVitalsByEncounterController
);


// Update vitals for an encounter
router.put(
    "/:encounterId/vitals",
    authenticate,
    authorizeRoles("DOCTOR"),
    updateVitalsByEncounterController
);


export default router;