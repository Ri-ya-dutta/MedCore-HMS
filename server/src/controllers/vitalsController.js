import {
    createVitals,
    getVitalsByEncounter,
    updateVitalsByEncounter
} from "../services/vitalsService.js";


const isValidNumber = (value) => {
    return typeof value === "number" && Number.isFinite(value);
};


const validateVitalsFields = (body, { requireClinicalValue = false } = {}) => {

    const allowedFields = [
        "bloodPressure",
        "heartRate",
        "respiratoryRate",
        "spo2",
        "temperature",
        "recordedAt"
    ];

    const providedFields = Object.keys(body);

    const invalidFields = providedFields.filter(
        (field) => !allowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
        return `Unknown field(s): ${invalidFields.join(", ")}`;
    }

    if (
        body.bloodPressure !== undefined &&
        body.bloodPressure !== null &&
        typeof body.bloodPressure !== "string"
    ) {
        return "bloodPressure must be a string";
    }

    if (
        body.heartRate !== undefined &&
        body.heartRate !== null &&
        !isValidNumber(body.heartRate)
    ) {
        return "heartRate must be a valid number";
    }

    if (
        body.respiratoryRate !== undefined &&
        body.respiratoryRate !== null &&
        !isValidNumber(body.respiratoryRate)
    ) {
        return "respiratoryRate must be a valid number";
    }

    if (
        body.spo2 !== undefined &&
        body.spo2 !== null &&
        !isValidNumber(body.spo2)
    ) {
        return "spo2 must be a valid number";
    }

    if (
        body.temperature !== undefined &&
        body.temperature !== null &&
        !isValidNumber(body.temperature)
    ) {
        return "temperature must be a valid number";
    }

    if (
        body.recordedAt !== undefined &&
        body.recordedAt !== null
    ) {
        if (
            typeof body.recordedAt !== "string" ||
            Number.isNaN(Date.parse(body.recordedAt))
        ) {
            return "recordedAt must be a valid date/time string";
        }
    }

    if (requireClinicalValue) {
        const clinicalFields = [
            "bloodPressure",
            "heartRate",
            "respiratoryRate",
            "spo2",
            "temperature"
        ];

        const hasClinicalValue = clinicalFields.some(
            (field) =>
                body[field] !== undefined &&
                body[field] !== null
        );

        if (!hasClinicalValue) {
            return "At least one clinical vital field is required";
        }
    }

    return null;
};


/*
 * POST /api/encounters/:encounterId/vitals
 */
export const createVitalsController = async (req, res) => {

    try {
        const encounterId = Number(req.params.encounterId);

        if (
            !Number.isInteger(encounterId) ||
            encounterId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        if (!req.body || typeof req.body !== "object") {
            return res.status(400).json({
                message: "Request body is required"
            });
        }

        const validationError = validateVitalsFields(
            req.body,
            { requireClinicalValue: true }
        );

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const vitals = await createVitals({
            encounterId,
            userId: req.user.id,
            bloodPressure: req.body.bloodPressure,
            heartRate: req.body.heartRate,
            respiratoryRate: req.body.respiratoryRate,
            spo2: req.body.spo2,
            temperature: req.body.temperature,
            recordedAt: req.body.recordedAt
        });

        return res.status(201).json({
            message: "Vitals created successfully",
            vitals
        });

    } catch (error) {
        console.error("Create vitals error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};


/*
 * GET /api/encounters/:encounterId/vitals
 */
export const getVitalsByEncounterController = async (req, res) => {

    try {
        const encounterId = Number(req.params.encounterId);

        if (
            !Number.isInteger(encounterId) ||
            encounterId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        const vitals = await getVitalsByEncounter({
            encounterId,
            userId: req.user.id,
            role: req.user.role
        });

        return res.status(200).json({
            vitals
        });

    } catch (error) {
        console.error("Get vitals error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};


/*
 * PUT /api/encounters/:encounterId/vitals
 */
export const updateVitalsByEncounterController = async (req, res) => {

    try {
        const encounterId = Number(req.params.encounterId);

        if (
            !Number.isInteger(encounterId) ||
            encounterId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        if (!req.body || typeof req.body !== "object") {
            return res.status(400).json({
                message: "Request body is required"
            });
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "At least one field is required for update"
            });
        }

        const validationError = validateVitalsFields(req.body);

        if (validationError) {
            return res.status(400).json({
                message: validationError
            });
        }

        const vitals = await updateVitalsByEncounter({
            encounterId,
            userId: req.user.id,
            updates: req.body
        });

        return res.status(200).json({
            message: "Vitals updated successfully",
            vitals
        });

    } catch (error) {
        console.error("Update vitals error:", error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : "Internal server error"
        });
    }
};