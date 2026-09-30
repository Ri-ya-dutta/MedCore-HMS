import {
    createPatient,
    getPatientById,
    updatePatient,
    getPatients,
    getPatientByUserId
} from "../services/patientService.js";

export const createPatientController = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phone,
            email,
            address,
            emergencyContact,
            bloodGroup
        } = req.body;

        // Required fields
        if (
            !firstName ||
            !lastName ||
            !dateOfBirth ||
            !gender ||
            !phone
        ) {
            return res.status(400).json({
                message: "First name, last name, date of birth, gender and phone are required"
            });
        }

        // Basic type validation
        if (
            typeof firstName !== "string" ||
            typeof lastName !== "string" ||
            typeof dateOfBirth !== "string" ||
            typeof gender !== "string" ||
            typeof phone !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid patient data"
            });
        }

        // Allowed gender values
        const allowedGenders = ["MALE", "FEMALE", "OTHER"];

        if (!allowedGenders.includes(gender)) {
            return res.status(400).json({
                message: "Invalid gender"
            });
        }

        const patient = await createPatient({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth,
            gender,
            phone: phone.trim(),
            email,
            address,
            emergencyContact,
            bloodGroup
        });

        return res.status(201).json({
            message: "Patient created successfully",
            patient
        });
    } catch (error) {
        console.error("Create patient error:", error);

        return res.status(500).json({
            message: "Failed to create patient"
        });
    }
};

export const getPatientByIdController = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid patient ID"
            });
        }

        const patient = await getPatientById(id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        // Patients can only view their own patient profile.
        if (
            req.user.role === "PATIENT" &&
            patient.userId !== req.user.id
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        return res.status(200).json({
            patient
        });
    } catch (error) {
        console.error("Get patient error:", error);

        return res.status(500).json({
            message: "Failed to fetch patient"
        });
    }
};

export const getMyPatientProfileController = async (req, res) => {
    try {
        const patient = await getPatientByUserId(req.user.id);

        if (!patient) {
            return res.status(404).json({
                message: "Patient profile is not linked to this account"
            });
        }

        return res.status(200).json(patient);
    } catch (error) {
        console.error(
            "Get my patient profile error:",
            error
        );

        return res.status(500).json({
            message: "Failed to get patient profile"
        });
    }
};

export const updatePatientController = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid patient ID"
            });
        }

        const existingPatient = await getPatientById(id);

        if (!existingPatient) {
            return res.status(404).json({
                message: "Patient not found"
            });
        }

        // Patients can update only their own basic profile.
        if (
            req.user.role === "PATIENT" &&
            existingPatient.userId !== req.user.id
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phone,
            email,
            address,
            emergencyContact,
            bloodGroup
        } = req.body;

        if (gender !== undefined) {
            const allowedGenders = ["MALE", "FEMALE", "OTHER"];

            if (!allowedGenders.includes(gender)) {
                return res.status(400).json({
                    message: "Invalid gender"
                });
            }
        }

        const updatedPatient = await updatePatient(id, {
            firstName: firstName?.trim(),
            lastName: lastName?.trim(),
            dateOfBirth,
            gender,
            phone: phone?.trim(),
            email: email?.trim(),
            address: address?.trim(),
            emergencyContact: emergencyContact?.trim(),
            bloodGroup: bloodGroup?.trim()
        });

        return res.status(200).json({
            message: "Patient updated successfully",
            patient: updatedPatient
        });
    } catch (error) {
        console.error("Update patient error:", error);

        return res.status(500).json({
            message: "Failed to update patient"
        });
    }
};

export const getPatientsController = async (req, res) => {
    try {
        const search =
            typeof req.query.search === "string"
                ? req.query.search.trim()
                : "";

        const patients = await getPatients(search);

        return res.status(200).json({
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error("Get patients error:", error);

        return res.status(500).json({
            message: "Failed to fetch patients"
        });
    }
};