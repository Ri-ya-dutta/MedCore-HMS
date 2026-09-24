import bcrypt from "bcryptjs";
import { db } from "../prisma/db.ts";

const SALT_ROUNDS = 12;

export const registerUser = async ({ email, password }) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await db.orm.public.User
        .where({ email: normalizedEmail })
        .first();

    if (existingUser) {
        const error = new Error("Email is already registered");
        error.code = "EMAIL_EXISTS";
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await db.orm.public.User.create({
        email: normalizedEmail,
        passwordHash,
        role: "PATIENT",
    });

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

    const user = await db.orm.public.User
        .where({ email: normalizedEmail })
        .first();

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