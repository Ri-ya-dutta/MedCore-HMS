import express from "express";

import {
    authenticate,
    authorizeRoles
} from "../middleware/authMiddleware.js";

import {
    createPrescriptionController,
    getPrescriptionsController,
    getPrescriptionController,
    updatePrescriptionController
} from "../controllers/prescriptionController.js";


const router = express.Router();


// Create prescription
router.post(
    "/:encounterId/prescriptions",
    authenticate,
    authorizeRoles("DOCTOR"),
    createPrescriptionController
);


// View all prescriptions for an encounter
router.get(
    "/:encounterId/prescriptions",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "PATIENT"
    ),
    getPrescriptionsController
);


// View one prescription
router.get(
    "/:encounterId/prescriptions/:prescriptionId",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "PATIENT"
    ),
    getPrescriptionController
);


// Update one prescription
router.put(
    "/:encounterId/prescriptions/:prescriptionId",
    authenticate,
    authorizeRoles("DOCTOR"),
    updatePrescriptionController
);


export default router;