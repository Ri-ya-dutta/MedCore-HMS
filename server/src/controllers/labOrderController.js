import {
    createLabOrder,
    getLabOrdersByEncounter,
    getLabOrder,
    updateLabOrder
} from "../services/labOrderService.js";


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
 * POST /api/encounters/:encounterId/lab-orders
 */
export const createLabOrderController = async (
    req,
    res
) => {

    try {

        const encounterId =
            parsePositiveInteger(
                req.params.encounterId
            );

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

        const labOrder =
            await createLabOrder({
                encounterId,
                userId: req.user.id,
                testName: req.body.testName,
                notes: req.body.notes
            });

        return res.status(201).json({
            message: "Lab order created successfully",
            labOrder
        });

    } catch (error) {

        console.error(
            "Create lab order error:",
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
 * GET /api/encounters/:encounterId/lab-orders
 */
export const getLabOrdersController = async (
    req,
    res
) => {

    try {

        const encounterId =
            parsePositiveInteger(
                req.params.encounterId
            );

        if (!encounterId) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        const labOrders =
            await getLabOrdersByEncounter({
                encounterId,
                userId: req.user.id,
                role: req.user.role
            });

        return res.status(200).json({
            labOrders
        });

    } catch (error) {

        console.error(
            "Get lab orders error:",
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
 * GET /api/encounters/:encounterId/lab-orders/:labOrderId
 */
export const getLabOrderController = async (
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

        const labOrder =
            await getLabOrder({
                encounterId,
                labOrderId,
                userId: req.user.id,
                role: req.user.role
            });

        return res.status(200).json({
            labOrder
        });

    } catch (error) {

        console.error(
            "Get lab order error:",
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
 * PUT /api/encounters/:encounterId/lab-orders/:labOrderId
 */
export const updateLabOrderController = async (
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

        const labOrder =
            await updateLabOrder({
                encounterId,
                labOrderId,
                userId: req.user.id,
                testName: req.body.testName,
                notes: req.body.notes,
                status: req.body.status
            });

        return res.status(200).json({
            message: "Lab order updated successfully",
            labOrder
        });

    } catch (error) {

        console.error(
            "Update lab order error:",
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