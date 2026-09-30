import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

const SALT_ROUNDS = 12;

export const registerUser = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUserResult = await pool.query(
        `
        SELECT *
        FROM "user"
        WHERE email = $1
        `,
        [normalizedEmail]
    );

    if (existingUserResult.rows.length > 0) {
        const error = new Error("Email is already registered");
        error.code = "EMAIL_EXISTS";
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
        `
        INSERT INTO "user" (
            email,
            "passwordHash",
            role,
            "isActive"
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            email,
            role,
            "isActive",
            "createdAt"
        `,
        [
            normalizedEmail,
            passwordHash,
            "PATIENT",
            true
        ]
    );

    const user = result.rows[0];

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
    };
};

export const loginUser = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
        `
        SELECT *
        FROM "user"
        WHERE email = $1
        `,
        [normalizedEmail]
    );

    const user = result.rows[0];

    if (!user) {
        const error = new Error("Invalid credentials");
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("Account is inactive");
        error.code = "ACCOUNT_INACTIVE";
        throw error;
    }

    const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!passwordMatches) {
        const error = new Error("Invalid credentials");
        error.code = "INVALID_CREDENTIALS";
        throw error;
    }

    return user;
};