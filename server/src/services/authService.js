import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

const SALT_ROUNDS = 12;


export const registerUser = async ({
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
}) => {
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Create the login account.
        const userResult = await client.query(
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

        const user = userResult.rows[0];

        // Create the patient's medical profile and link it
        // to the account created in this transaction.
        const patientResult = await client.query(
            `
            INSERT INTO patient (
                "firstName",
                "lastName",
                "dateOfBirth",
                gender,
                phone,
                email,
                address,
                "emergencyContact",
                "bloodGroup",
                "userId"
            )
            VALUES (
                $1,
                $2,
                ($3 || ' 00:00:00+00')::timestamptz,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10
            )
            RETURNING *
            `,
            [
                firstName.trim(),
                lastName.trim(),
                dateOfBirth,
                gender,
                phone.trim(),
                normalizedEmail,
                address?.trim() || null,
                emergencyContact?.trim() || null,
                bloodGroup?.trim() || null,
                user.id
            ]
        );

        await client.query("COMMIT");

        return {
            user,
            patient: patientResult.rows[0]
        };
    } catch (error) {
        // Never leave just one of the two records committed.
        try {
            await client.query("ROLLBACK");
        } catch {
            // Preserve the original database error.
        }

        // Handle duplicate emails, including concurrent requests
        // that race against the database's unique constraint.
        if (
            error.code === "23505" &&
            error.constraint === "user_email_key"
        ) {
            const duplicateError = new Error(
                "Email is already registered"
            );

            duplicateError.code = "EMAIL_EXISTS";
            throw duplicateError;
        }

        throw error;
    } finally {
        client.release();
    }
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