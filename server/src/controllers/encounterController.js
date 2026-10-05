import {
    createEncounter,
    getEncounters,
    getEncounterById,
    updateEncounter
} from "../services/encounterService.js";


export const createEncounterController = async (req, res) => {
    try {
        const {
            appointmentId,
            diagnosis,
            clinicalNotes
        } = req.body;

        if (
            appointmentId === undefined ||
            appointmentId === null
        ) {
            return res.status(400).json({
                message: "appointmentId is required"
            });
        }

        const parsedAppointmentId = Number(appointmentId);

        if (
            !Number.isInteger(parsedAppointmentId) ||
            parsedAppointmentId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid appointment ID"
            });
        }

        if (
            diagnosis !== undefined &&
            diagnosis !== null &&
            typeof diagnosis !== "string"
        ) {
            return res.status(400).json({
                message: "Diagnosis must be a string or null"
            });
        }

        if (
            clinicalNotes !== undefined &&
            clinicalNotes !== null &&
            typeof clinicalNotes !== "string"
        ) {
            return res.status(400).json({
                message: "Clinical notes must be a string or null"
            });
        }

        const encounter = await createEncounter({
            appointmentId: parsedAppointmentId,
            doctorUserId: req.user.id,
            diagnosis:
                typeof diagnosis === "string"
                    ? diagnosis.trim()
                    : diagnosis,
            clinicalNotes:
                typeof clinicalNotes === "string"
                    ? clinicalNotes.trim()
                    : clinicalNotes
        });

        return res.status(201).json({
            message: "Encounter created successfully",
            encounter
        });

    } catch (error) {
        console.error(
            "Create encounter error:",
            error
        );

        if (error.code === "APPOINTMENT_NOT_FOUND") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (
            error.code === "INVALID_APPOINTMENT_STATUS"
        ) {
            return res.status(400).json({
                message: error.message
            });
        }

        if (
            error.code === "ENCOUNTER_ACCESS_DENIED"
        ) {
            return res.status(403).json({
                message: error.message
            });
        }

        if (
            error.code === "ENCOUNTER_ALREADY_EXISTS"
        ) {
            return res.status(409).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to create encounter"
        });
    }
};


export const getEncountersController = async (req, res) => {
    try {
        const encounters = await getEncounters({
            userId: req.user.id,
            role: req.user.role
        });

        return res.status(200).json({
            count: encounters.length,
            encounters
        });

    } catch (error) {
        console.error(
            "Get encounters error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch encounters"
        });
    }
};


export const getEncounterByIdController = async (
    req,
    res
) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        const encounter =
            await getEncounterById(
                id,
                {
                    userId: req.user.id,
                    role: req.user.role
                }
            );

        if (!encounter) {
            return res.status(404).json({
                message: "Encounter not found"
            });
        }

        return res.status(200).json({
            encounter
        });

    } catch (error) {
        console.error(
            "Get encounter error:",
            error
        );

        if (
            error.code === "ENCOUNTER_ACCESS_DENIED"
        ) {
            return res.status(403).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to fetch encounter"
        });
    }
};


export const updateEncounterController = async (
    req,
    res
) => {
    try {
        const id = Number(req.params.id);

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                message: "Invalid encounter ID"
            });
        }

        const {
            diagnosis,
            clinicalNotes
        } = req.body;

        if (
            diagnosis === undefined &&
            clinicalNotes === undefined
        ) {
            return res.status(400).json({
                message:
                    "Diagnosis or clinicalNotes is required"
            });
        }

        if (
            diagnosis !== undefined &&
            diagnosis !== null &&
            typeof diagnosis !== "string"
        ) {
            return res.status(400).json({
                message: "Diagnosis must be a string or null"
            });
        }

        if (
            clinicalNotes !== undefined &&
            clinicalNotes !== null &&
            typeof clinicalNotes !== "string"
        ) {
            return res.status(400).json({
                message:
                    "Clinical notes must be a string or null"
            });
        }

        const encounter =
            await updateEncounter(
                id,
                {
                    diagnosis:
                        typeof diagnosis === "string"
                            ? diagnosis.trim()
                            : diagnosis,

                    clinicalNotes:
                        typeof clinicalNotes === "string"
                            ? clinicalNotes.trim()
                            : clinicalNotes
                },
                {
                    userId: req.user.id
                }
            );

        if (!encounter) {
            return res.status(404).json({
                message: "Encounter not found"
            });
        }

        return res.status(200).json({
            message: "Encounter updated successfully",
            encounter
        });

    } catch (error) {
        console.error(
            "Update encounter error:",
            error
        );

        if (
            error.code === "ENCOUNTER_ACCESS_DENIED"
        ) {
            return res.status(403).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to update encounter"
        });
    }
};