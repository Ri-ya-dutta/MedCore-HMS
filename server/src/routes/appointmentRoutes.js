import express from "express";

import {
    authenticate,
    authorizeRoles
} from "../middleware/authMiddleware.js";

import {
    createAppointmentController,
    getAppointmentsController,
    getAppointmentByIdController,
    updateAppointmentController
} from "../controllers/appointmentController.js";

const router = express.Router();


// Book appointment
router.post(
    "/",
    authenticate,
    authorizeRoles("ADMIN", "RECEPTIONIST"),
    createAppointmentController
);


// View appointments
router.get(
    "/",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "DOCTOR",
        "PATIENT"
    ),
    getAppointmentsController
);


// View single appointment
router.get(
    "/:id",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "DOCTOR",
        "PATIENT"
    ),
    getAppointmentByIdController
);


// Update / reschedule / cancel / complete
router.put(
    "/:id",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "DOCTOR"
    ),
    updateAppointmentController
);


export default router;