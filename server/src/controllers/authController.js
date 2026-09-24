import { 
    registerUser,
    loginUser
} from "../services/authService.js";

 import { generateToken } from "../utils/jwt.js";
 import { db } from "../prisma/db.ts";

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
        const user = await db.orm.public.User
            .where({ id: req.user.id })
            .first();

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