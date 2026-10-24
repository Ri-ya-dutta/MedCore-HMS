import { 
    registerUser,
    loginUser
} from "../services/authService.js";

 import { generateToken } from "../utils/jwt.js";
 import { pool } from "../config/db.js";


export const register = async (req, res) => {
    try {
        const {
            email,
            password,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phone,
            address,
            emergencyContact,
            bloodGroup
        } = req.body ?? {};

        const requiredFields = [
            email,
            password,
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phone
        ];

        if (
            requiredFields.some(
                value => typeof value !== "string"
            )
        ) {
            return res.status(400).json({
                message: "All required fields must be strings"
            });
        }

        if (
            requiredFields.some(
                value => value.trim().length === 0
            )
        ) {
            return res.status(400).json({
                message:
                    "Email, password, first name, last name, date of birth, gender and phone are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        ) {
            return res.status(400).json({
                message: "Invalid email address"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters long"
            });
        }

        const optionalFields = [
            address,
            emergencyContact,
            bloodGroup
        ];

        if (
            optionalFields.some(
                value =>
                    value !== undefined &&
                    value !== null &&
                    typeof value !== "string"
            )
        ) {
            return res.status(400).json({
                message:
                    "Address, emergency contact and blood group must be strings"
            });
        }

        const normalizedGender = gender.trim().toUpperCase();
        const allowedGenders = [
            "MALE",
            "FEMALE",
            "OTHER"
        ];

        if (!allowedGenders.includes(normalizedGender)) {
            return res.status(400).json({
                message: "Invalid gender"
            });
        }

        const normalizedDateOfBirth = dateOfBirth.trim();
        const datePattern = /^\d{4}-\d{2}-\d{2}$/;
        const parsedDate = new Date(
            `${normalizedDateOfBirth}T00:00:00.000Z`
        );

        if (
            !datePattern.test(normalizedDateOfBirth) ||
            Number.isNaN(parsedDate.getTime()) ||
            parsedDate.toISOString().slice(0, 10) !==
                normalizedDateOfBirth ||
            normalizedDateOfBirth >
                new Date().toISOString().slice(0, 10)
        ) {
            return res.status(400).json({
                message:
                    "Date of birth must be a valid date in YYYY-MM-DD format and cannot be in the future"
            });
        }

        const { user, patient } = await registerUser({
            email: normalizedEmail,
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth: normalizedDateOfBirth,
            gender: normalizedGender,
            phone: phone.trim(),
            address,
            emergencyContact,
            bloodGroup
        });

        return res.status(201).json({
            message: "Registration successful",
            user,
            patient
        });
    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "EMAIL_EXISTS") {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        return res.status(500).json({
            message: "Registration failed"
        });
    }
};




export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        if (typeof email !== "string" || typeof password !== "string") {
            return res.status(400).json({
                message: "Email and password must be strings",
            });
        }

        const user = await loginUser({
            email,
            password,
        });

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        if (error.code === "INVALID_CREDENTIALS") {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        if (error.code === "ACCOUNT_INACTIVE") {
            return res.status(403).json({
                message: "Account is inactive",
            });
        }

        return res.status(500).json({
            message: "Login failed",
        });
    }
};


export const getMe = async (req, res) => {
    try {
        const result = await pool.query(
            `
            SELECT
                id,
                email,
                role,
                "isActive",
                "createdAt"
            FROM "user"
            WHERE id = $1
            `,
            [req.user.id]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Get current user error:", error);

        return res.status(500).json({
            message: "Failed to fetch user",
        });
    }
};

export const adminTest = async (req, res) => {
    return res.status(200).json({
        message: "Admin access granted",
        user: req.user,
    });
};