import {
    createLabResult,
    getLabResult,
    updateLabResult
} from "../services/labResultService.js";


const parsePositiveInteger = (value) => {

    const number = Number(value);

    if (
        !Number.isInteger(number) ||
        number <= 0
    ) {
        return null;
    }

    return number;
};


/*
 * POST /api/encounters/:encounterId/lab-orders/:labOrderId/result
 */
export const createLabResultController = async (
    req,
    res
) => {

    try {

        const encounterId =
            parsePositiveInteger(
                req.params.encounterId
            );

        const labOrderId =
            parsePositiveInteger(
                req.params.labOrderId
            );

        if (!encounterId) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        if (!labOrderId) {
            return res.status(400).json({
                message: "Invalid lab order ID"
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

        const result =
            await createLabResult({
                encounterId,
                labOrderId,
                userId: req.user.id,
                resultValue: req.body.resultValue,
                referenceRange: req.body.referenceRange,
                remarks: req.body.remarks,
                completedAt: req.body.completedAt
            });

        return res.status(201).json({
            message: "Lab result created successfully",
            result
        });

    } catch (error) {

        console.error(
            "Create lab result error:",
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
 * GET /api/encounters/:encounterId/lab-orders/:labOrderId/result
 */
export const getLabResultController = async (
    req,
    res
) => {

    try {

        const encounterId =
            parsePositiveInteger(
                req.params.encounterId
            );

        const labOrderId =
            parsePositiveInteger(
                req.params.labOrderId
            );

        if (!encounterId) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        if (!labOrderId) {
            return res.status(400).json({
                message: "Invalid lab order ID"
            });
        }

        const result =
            await getLabResult({
                encounterId,
                labOrderId,
                userId: req.user.id,
                role: req.user.role
            });

        return res.status(200).json({
            result
        });

    } catch (error) {

        console.error(
            "Get lab result error:",
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
 * PUT /api/encounters/:encounterId/lab-orders/:labOrderId/result
 */
export const updateLabResultController = async (
    req,
    res
) => {

    try {

        const encounterId =
            parsePositiveInteger(
                req.params.encounterId
            );

        const labOrderId =
            parsePositiveInteger(
                req.params.labOrderId
            );

        if (!encounterId) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        if (!labOrderId) {
            return res.status(400).json({
                message: "Invalid lab order ID"
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

        const result =
            await updateLabResult({
                encounterId,
                labOrderId,
                userId: req.user.id,
                resultValue: req.body.resultValue,
                referenceRange: req.body.referenceRange,
                remarks: req.body.remarks,
                completedAt: req.body.completedAt
            });

        return res.status(200).json({
            message: "Lab result updated successfully",
            result
        });

    } catch (error) {

        console.error(
            "Update lab result error:",
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