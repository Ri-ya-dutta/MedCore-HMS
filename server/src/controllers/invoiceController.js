import {
    createInvoice,
    getInvoiceByEncounter,
    updateInvoice
} from "../services/invoiceService.js";

function handleError(res, error) {
    console.error("Invoice controller error:", error);

    return res.status(error.statusCode || 500).json({
        message:
            error.statusCode
                ? error.message
                : "Internal server error"
    });
}

export async function createInvoiceController(req, res) {
    try {
        const invoice = await createInvoice(
            req.params.encounterId,
            req.body
        );

        return res.status(201).json({
            message: "Invoice created successfully",
            invoice
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function getInvoiceController(req, res) {
    try {
        const invoice = await getInvoiceByEncounter(
            req.params.encounterId,
            req.user
        );

        return res.status(200).json({
            message: "Invoice fetched successfully",
            invoice
        });
    } catch (error) {
        return handleError(res, error);
    }
}

export async function updateInvoiceController(req, res) {
    try {
        const invoice = await updateInvoice(
            req.params.encounterId,
            req.body
        );

        return res.status(200).json({
            message: "Invoice updated successfully",
            invoice
        });
    } catch (error) {
        return handleError(res, error);
    }
}