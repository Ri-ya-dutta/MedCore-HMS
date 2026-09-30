import { pool } from "../config/db.js";

export const createPatient = async ({
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
}) => {
    const result = await pool.query(
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
            $1, $2, ($3 || ' 00:00:00+00')::timestamptz, $4, $5,
            $6, $7, $8, $9, $10
        )
        RETURNING *
        `,
        [
            firstName,
            lastName,
            dateOfBirth,
            gender,
            phone,
            email || null,
            address || null,
            emergencyContact || null,
            bloodGroup || null,
            userId || null
        ]
    );

    return result.rows[0];
};

export const getPatientById = async (id) => {
    const result = await pool.query(
        `
        SELECT *
        FROM patient
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0] || null;
};

export const getPatientByUserId = async (userId) => {
    const result = await pool.query(
        `
        SELECT *
        FROM patient
        WHERE "userId" = $1
        `,
        [userId]
    );

    return result.rows[0] || null;
};

export const updatePatient = async (
    id,
    {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        email,
        address,
        emergencyContact,
        bloodGroup
    }
) => {
    const existingResult = await pool.query(
        `
        SELECT *
        FROM patient
        WHERE id = $1
        `,
        [id]
    );

    const patient = existingResult.rows[0];

    if (!patient) {
        return null;
    }

    const result = await pool.query(
        `
        UPDATE patient
        SET
            "firstName" = $1,
            "lastName" = $2,
            "dateOfBirth" = CASE
                WHEN $3::text IS NULL THEN "dateOfBirth"
                ELSE ($3::text || ' 00:00:00+00')::timestamptz
            END,
            gender = $4,
            phone = $5,
            email = $6,
            address = $7,
            "emergencyContact" = $8,
            "bloodGroup" = $9,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $10
        RETURNING *
        `,
        [
            firstName ?? patient.firstName,
            lastName ?? patient.lastName,
            dateOfBirth ?? null,
            gender ?? patient.gender,
            phone ?? patient.phone,
            email ?? patient.email,
            address ?? patient.address,
            emergencyContact ?? patient.emergencyContact,
            bloodGroup ?? patient.bloodGroup,
            id
        ]
    );

    return result.rows[0];
};

export const getPatients = async (search) => {
    let query = `
        SELECT *
        FROM patient
    `;

    const values = [];

    if (search) {
        values.push(`%${search.toLowerCase()}%`);

        query += `
            WHERE
                LOWER("firstName") LIKE $1
                OR LOWER("lastName") LIKE $1
                OR LOWER(phone) LIKE $1
                OR LOWER(email) LIKE $1
        `;
    }

    query += `
        ORDER BY id
    `;

    const result = await pool.query(query, values);

    return result.rows;
};

export const linkPatientToUser = async (patientId, userId) => {
    // Check patient exists
    const patientResult = await pool.query(
        `
        SELECT *
        FROM patient
        WHERE id = $1
        `,
        [patientId]
    );

    const patient = patientResult.rows[0];

    if (!patient) {
        const error = new Error("Patient not found");
        error.code = "PATIENT_NOT_FOUND";
        throw error;
    }

    // Check user exists and is a PATIENT
    const userResult = await pool.query(
        `
        SELECT
            id,
            email,
            role,
            "isActive"
        FROM "user"
        WHERE id = $1
        `,
        [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
        const error = new Error("User not found");
        error.code = "USER_NOT_FOUND";
        throw error;
    }

    if (user.role !== "PATIENT") {
        const error = new Error(
            "Only users with PATIENT role can be linked to a patient"
        );

        error.code = "INVALID_USER_ROLE";
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("User account is inactive");
        error.code = "USER_INACTIVE";
        throw error;
    }

    // Patient already linked
    if (patient.userId !== null) {
        if (patient.userId === userId) {
            return patient;
        }

        const error = new Error(
            "Patient is already linked to another user"
        );

        error.code = "PATIENT_ALREADY_LINKED";
        throw error;
    }

    // User already linked to another patient
    const existingPatientResult = await pool.query(
        `
        SELECT id
        FROM patient
        WHERE "userId" = $1
        `,
        [userId]
    );

    if (existingPatientResult.rows.length > 0) {
        const error = new Error(
            "User is already linked to another patient"
        );

        error.code = "USER_ALREADY_LINKED";
        throw error;
    }

    // Link patient and user
    const result = await pool.query(
        `
        UPDATE patient
        SET
            "userId" = $1,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
        `,
        [userId, patientId]
    );

    return result.rows[0];
};