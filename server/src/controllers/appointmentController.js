import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment
} from "../services/appointmentService.js";


export const createAppointmentController = async (req, res) => {
    try {
        const {
            patientId,
            doctorId,
            appointmentAt,
            reason
        } = req.body;

        if (!patientId || !doctorId || !appointmentAt) {
            return res.status(400).json({
                message:
                    "patientId, doctorId and appointmentAt are required"
            });
        }

        const appointment = await createAppointment({
            patientId,
            doctorId,
            appointmentAt,
            reason
        });

        return res.status(201).json({
            message: "Appointment created successfully",
            appointment
        });

    } catch (error) {
        console.error(
            "Create appointment error:",
            error
        );

        if (error.code === "PATIENT_NOT_FOUND") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.code === "DOCTOR_NOT_FOUND") {
            return res.status(404).json({
                message: error.message
            });
        }

        if (error.code === "DOCTOR_ALREADY_BOOKED") {
            return res.status(409).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to create appointment"
        });
    }
};


export const getAppointmentsController = async (req, res) => {
    try {
        const appointments = await getAppointments({
            userId: req.user.id,
            role: req.user.role
        });

        return res.json({
            appointments
        });

    } catch (error) {
        console.error(
            "Get appointments error:",
            error
        );

        return res.status(500).json({
            message: "Failed to fetch appointments"
        });
    }
};


export const getAppointmentByIdController = async (req, res) => {
    try {
        const appointmentId = Number(req.params.id);

        if (!Number.isInteger(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID"
            });
        }

        const appointment =
            await getAppointmentById(
                appointmentId,
                {
                    userId: req.user.id,
                    role: req.user.role
                }
            );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        return res.json({
            appointment
        });

    } catch (error) {
        console.error(
            "Get appointment error:",
            error
        );
        
        if (error.code === "APPOINTMENT_ACCESS_DENIED") {
            return res.status(403).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to fetch appointment"
        });
    }
};


export const updateAppointmentController = async (req, res) => {
    try {
        const appointmentId = Number(req.params.id);

        if (!Number.isInteger(appointmentId)) {
            return res.status(400).json({
                message: "Invalid appointment ID"
            });
        }

        const {
            appointmentAt,
            reason,
            status
        } = req.body;

        if (
            status &&
            ![
                "SCHEDULED",
                "COMPLETED",
                "CANCELLED",
                "RESCHEDULED"
            ].includes(status)
        ) {
            return res.status(400).json({
                message: "Invalid appointment status"
            });
        }

        const appointment =
            await updateAppointment(
                appointmentId,
                {
                    appointmentAt,
                    reason,
                    status
                },
                {
                    userId: req.user.id,
                    role: req.user.role
                }
            );

        if (!appointment) {
            return res.status(404).json({
                message: "Appointment not found"
            });
        }

        return res.json({
            message: "Appointment updated successfully",
            appointment
        });

    } catch (error) {
        console.error(
            "Update appointment error:",
            error
        );
        if (error.code === "APPOINTMENT_ACCESS_DENIED") {
            return res.status(403).json({
                message: error.message
            });
        }
        if (error.code === "DOCTOR_ALREADY_BOOKED") {
            return res.status(409).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: "Failed to update appointment"
        });
    }
};