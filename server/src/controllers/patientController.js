import { createPatient } from "../services/patientService.js";

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
            bloodGroup,
            userId
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
            bloodGroup,
            userId
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