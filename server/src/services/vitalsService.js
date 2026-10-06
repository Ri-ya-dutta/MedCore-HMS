import { pool } from "../config/db.js";


/*
 * Get the encounter together with its patient and doctor ownership data.
 */
const getEncounterContext = async (encounterId) => {
    const result = await pool.query(
        `
        SELECT
            e."id",
            e."patientId",
            e."doctorId",
            p."userId" AS "patientUserId",
            d."userId" AS "doctorUserId"
        FROM "encounter" e
        LEFT JOIN "patient" p
            ON p."id" = e."patientId"
        LEFT JOIN "doctor" d
            ON d."id" = e."doctorId"
        WHERE e."id" = $1
        `,
        [encounterId]
    );

    return result.rows[0] || null;
};


/*
 * Create vitals for an encounter.
 */
export const createVitals = async ({
    encounterId,
    userId,
    bloodPressure,
    heartRate,
    respiratoryRate,
    spo2,
    temperature,
    recordedAt
}) => {

    const encounter = await getEncounterContext(encounterId);

    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    // The authenticated doctor must own the encounter.
    if (
        encounter.doctorUserId === null ||
        Number(encounter.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You are not authorized to manage vitals for this encounter"
        );
        error.statusCode = 403;
        throw error;
    }

    const existing = await pool.query(
        `
        SELECT "id"
        FROM "vitals"
        WHERE "encounterId" = $1
        `,
        [encounterId]
    );

    if (existing.rows.length > 0) {
        const error = new Error(
            "Vitals already exist for this encounter"
        );
        error.statusCode = 409;
        throw error;
    }

    try {
        const result = await pool.query(
            `
            INSERT INTO "vitals"
            (
                "encounterId",
                "bloodPressure",
                "heartRate",
                "respiratoryRate",
                "spo2",
                "temperature",
                "recordedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING
                "id",
                "encounterId",
                "bloodPressure",
                "heartRate",
                "respiratoryRate",
                "spo2",
                "temperature",
                "recordedAt"
            `,
            [
                encounterId,
                bloodPressure ?? null,
                heartRate ?? null,
                respiratoryRate ?? null,
                spo2 ?? null,
                temperature ?? null,
                recordedAt ?? new Date().toISOString()
            ]
        );

        return result.rows[0];
    } catch (error) {
        // Protect against the database unique constraint on encounterId.
        if (error.code === "23505") {
            const conflictError = new Error(
                "Vitals already exist for this encounter"
            );
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error;
    }
};


/*
 * Get vitals for a specific encounter.
 */
export const getVitalsByEncounter = async ({
    encounterId,
    userId,
    role
}) => {

    const encounter = await getEncounterContext(encounterId);

    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    // Doctor can only view their own encounter.
    if (role === "DOCTOR") {
        if (
            encounter.doctorUserId === null ||
            Number(encounter.doctorUserId) !== Number(userId)
        ) {
            const error = new Error(
                "You are not authorized to view vitals for this encounter"
            );
            error.statusCode = 403;
            throw error;
        }
    }

    // Patient can only view their own encounter.
    if (role === "PATIENT") {
        if (
            encounter.patientUserId === null ||
            Number(encounter.patientUserId) !== Number(userId)
        ) {
            const error = new Error(
                "You are not authorized to view vitals for this encounter"
            );
            error.statusCode = 403;
            throw error;
        }
    }

    const result = await pool.query(
        `
        SELECT
            "id",
            "encounterId",
            "bloodPressure",
            "heartRate",
            "respiratoryRate",
            "spo2",
            "temperature",
            "recordedAt"
        FROM "vitals"
        WHERE "encounterId" = $1
        `,
        [encounterId]
    );

    if (result.rows.length === 0) {
        const error = new Error(
            "Vitals not found for this encounter"
        );
        error.statusCode = 404;
        throw error;
    }

    return result.rows[0];
};


/*
 * Update vitals for an encounter.
 */
export const updateVitalsByEncounter = async ({
    encounterId,
    userId,
    updates
}) => {

    const encounter = await getEncounterContext(encounterId);

    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    // Only the doctor assigned to the encounter can update vitals.
    if (
        encounter.doctorUserId === null ||
        Number(encounter.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You are not authorized to update vitals for this encounter"
        );
        error.statusCode = 403;
        throw error;
    }

    const allowedFields = [
        "bloodPressure",
        "heartRate",
        "respiratoryRate",
        "spo2",
        "temperature",
        "recordedAt"
    ];

    const entries = Object.entries(updates).filter(
        ([key]) => allowedFields.includes(key)
    );

    if (entries.length === 0) {
        const error = new Error("No valid fields provided for update");
        error.statusCode = 400;
        throw error;
    }

    const existing = await pool.query(
        `
        SELECT "id"
        FROM "vitals"
        WHERE "encounterId" = $1
        `,
        [encounterId]
    );

    if (existing.rows.length === 0) {
        const error = new Error(
            "Vitals not found for this encounter"
        );
        error.statusCode = 404;
        throw error;
    }

    const setClauses = [];
    const values = [encounterId];

    entries.forEach(([field, value], index) => {
        setClauses.push(`"${field}" = $${index + 2}`);
        values.push(value);
    });

    const result = await pool.query(
        `
        UPDATE "vitals"
        SET ${setClauses.join(", ")}
        WHERE "encounterId" = $1
        RETURNING
            "id",
            "encounterId",
            "bloodPressure",
            "heartRate",
            "respiratoryRate",
            "spo2",
            "temperature",
            "recordedAt"
        `,
        values
    );

    return result.rows[0];
};