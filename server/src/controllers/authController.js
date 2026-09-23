import { registerUser } from "../services/authService.js";

export const register = async (req, res) => {
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

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long",
            });
        }

        const user = await registerUser({
            email,
            password,
        });

        return res.status(201).json({
            message: "Registration successful",
            user,
        });
    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "EMAIL_EXISTS") {
            return res.status(409).json({
                message: "Email is already registered",
            });
        }

        return res.status(500).json({
            message: "Registration failed",
        });
    }
};