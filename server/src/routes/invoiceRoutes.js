import express from "express";

import {
    authenticate,
    authorizeRoles
} from "../middleware/authMiddleware.js";

import {
    createInvoiceController,
    getInvoiceController,
    updateInvoiceController
} from "../controllers/invoiceController.js";

const router = express.Router();

/*
    Create Invoice
    ADMIN / RECEPTIONIST
*/
router.post(
    "/:encounterId/invoice",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    createInvoiceController
);

/*
    Get Invoice
    ADMIN / RECEPTIONIST / DOCTOR / PATIENT

    Doctor and Patient ownership is checked
    inside the service layer.
*/
router.get(
    "/:encounterId/invoice",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST",
        "DOCTOR",
        "PATIENT"
    ),
    getInvoiceController
);

/*
    Update Invoice
    ADMIN / RECEPTIONIST
*/
router.put(
    "/:encounterId/invoice",
    authenticate,
    authorizeRoles(
        "ADMIN",
        "RECEPTIONIST"
    ),
    updateInvoiceController
);

export default router;