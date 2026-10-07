import {
    createPrescription,
    getPrescriptionsByEncounter,
    getPrescription,
    updatePrescription
} from "../services/prescriptionService.js";


const parsePositiveInteger = (value) => {

    const number = Number(value);

    if (!Number.isInteger(number) || number <= 0) {
        return null;
    }

    return number;
};


/*
 * POST /api/encounters/:encounterId/prescriptions
 */
export const createPrescriptionController = async (req, res) => {

    try {
        const encounterId =
            parsePositiveInteger(req.params.encounterId);

        if (!encounterId) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({
                message: "Request body is required"
            });
        }

        const prescription = await createPrescription({
            encounterId,
            userId: req.user.id,
            instructions: req.body.instructions,
            items: req.body.items
        });

        return res.status(201).json({
            message: "Prescription created successfully",
            prescription
        });

    } catch (error) {

        console.error(
            "Create prescription error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};


/*
 * GET /api/encounters/:encounterId/prescriptions
 */
export const getPrescriptionsController = async (req, res) => {

    try {
        const encounterId =
            parsePositiveInteger(req.params.encounterId);

        if (!encounterId) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        const prescriptions =
            await getPrescriptionsByEncounter({
                encounterId,
                userId: req.user.id,
                role: req.user.role
            });

        return res.status(200).json({
            prescriptions
        });

    } catch (error) {

        console.error(
            "Get prescriptions error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};


/*
 * GET /api/encounters/:encounterId/prescriptions/:prescriptionId
 */
export const getPrescriptionController = async (req, res) => {

    try {
        const encounterId =
            parsePositiveInteger(req.params.encounterId);

        const prescriptionId =
            parsePositiveInteger(req.params.prescriptionId);

        if (!encounterId) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        if (!prescriptionId) {
            return res.status(400).json({
                message: "Invalid prescription ID"
            });
        }

        const prescription =
            await getPrescription({
                encounterId,
                prescriptionId,
                userId: req.user.id,
                role: req.user.role
            });

        return res.status(200).json({
            prescription
        });

    } catch (error) {

        console.error(
            "Get prescription error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};


/*
 * PUT /api/encounters/:encounterId/prescriptions/:prescriptionId
 */
export const updatePrescriptionController = async (req, res) => {

    try {
        const encounterId =
            parsePositiveInteger(req.params.encounterId);

        const prescriptionId =
            parsePositiveInteger(req.params.prescriptionId);

        if (!encounterId) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        if (!prescriptionId) {
            return res.status(400).json({
                message: "Invalid prescription ID"
            });
        }

        if (
            !req.body ||
            typeof req.body !== "object" ||
            Array.isArray(req.body)
        ) {
            return res.status(400).json({
                message: "Request body is required"
            });
        }

        const prescription =
            await updatePrescription({
                encounterId,
                prescriptionId,
                userId: req.user.id,
                instructions: req.body.instructions,
                items: req.body.items
            });

        return res.status(200).json({
            message: "Prescription updated successfully",
            prescription
        });

    } catch (error) {

        console.error(
            "Update prescription error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};