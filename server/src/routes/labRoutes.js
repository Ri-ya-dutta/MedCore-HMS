import express from "express";

import {
    authenticate,
    authorizeRoles
} from "../middleware/authMiddleware.js";

import {
    createLabOrderController,
    getLabOrdersController,
    getLabOrderController,
    updateLabOrderController
} from "../controllers/labOrderController.js";

import {
    createLabResultController,
    getLabResultController,
    updateLabResultController
} from "../controllers/labResultController.js";


const router = express.Router();


/* =========================
   LAB ORDERS
   ========================= */

// Create lab order
router.post(
    "/:encounterId/lab-orders",
    authenticate,
    authorizeRoles("DOCTOR"),
    createLabOrderController
);


// Get all lab orders
router.get(
    "/:encounterId/lab-orders",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "PATIENT"
    ),
    getLabOrdersController
);


// Get one lab order
router.get(
    "/:encounterId/lab-orders/:labOrderId",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "PATIENT"
    ),
    getLabOrderController
);


// Update lab order
router.put(
    "/:encounterId/lab-orders/:labOrderId",
    authenticate,
    authorizeRoles("DOCTOR"),
    updateLabOrderController
);


/* =========================
   LAB RESULTS
   ========================= */

// Create result
router.post(
    "/:encounterId/lab-orders/:labOrderId/result",
    authenticate,
    authorizeRoles("DOCTOR"),
    createLabResultController
);


// Get result
router.get(
    "/:encounterId/lab-orders/:labOrderId/result",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "DOCTOR",
        "PATIENT"
    ),
    getLabResultController
);


// Update result
router.put(
    "/:encounterId/lab-orders/:labOrderId/result",
    authenticate,
    authorizeRoles("DOCTOR"),
    updateLabResultController
);


export default router;