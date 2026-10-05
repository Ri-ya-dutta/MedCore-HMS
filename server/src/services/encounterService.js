import { pool } from "../config/db.js";

/*
    Create an encounter from an existing appointment.

    Business rules:
    - Appointment must exist.
    - Appointment must be SCHEDULED or RESCHEDULED.
    - Appointment must belong to the authenticated doctor.
    - One appointment can have only one encounter.
    - patientId and doctorId come from the appointment.
*/
export const createEncounter = async ({
    appointmentId,
    doctorUserId,
    diagnosis,
    clinicalNotes
}) => {
    const appointmentResult = await pool.query(
        `
        SELECT
            a.id,
            a."patientId",
            a."doctorId",
            a.status,
            d."userId" AS "doctorUserId"
        FROM appointment a
        JOIN doctor d
            ON d.id = a."doctorId"
        WHERE a.id = $1
        `,
        [appointmentId]
    );

    const appointment = appointmentResult.rows[0];

    if (!appointment) {
        const error = new Error("Appointment not found");
        error.code = "APPOINTMENT_NOT_FOUND";
        throw error;
    }

    if (
        appointment.status !== "SCHEDULED" &&
        appointment.status !== "RESCHEDULED"
    ) {
        const error = new Error(
            "Encounter can only be created for a scheduled or rescheduled appointment"
        );

        error.code = "INVALID_APPOINTMENT_STATUS";
        throw error;
    }

    if (Number(appointment.doctorUserId) !== Number(doctorUserId)) {
        const error = new Error(
            "You can only create encounters for your own appointments"
        );

        error.code = "ENCOUNTER_ACCESS_DENIED";
        throw error;
    }

    /*
        Check whether this appointment already has an encounter.
        The database also has a UNIQUE constraint on appointmentId,
        so the duplicate is protected at the database level too.
    */
    const existingEncounterResult = await pool.query(
        `
        SELECT id
        FROM encounter
        WHERE "appointmentId" = $1
        `,
        [appointmentId]
    );

    if (existingEncounterResult.rows.length > 0) {
        const error = new Error(
            "An encounter already exists for this appointment"
        );

        error.code = "ENCOUNTER_ALREADY_EXISTS";
        throw error;
    }

    try {
        const result = await pool.query(
            `
            INSERT INTO encounter (
                "appointmentId",
                "patientId",
                "doctorId",
                diagnosis,
                "clinicalNotes"
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [
                appointment.id,
                appointment.patientId,
                appointment.doctorId,
                diagnosis ?? null,
                clinicalNotes ?? null
            ]
        );

        return result.rows[0];
    } catch (error) {
        /*
            Protect against a race condition where another request
            creates the encounter between our SELECT and INSERT.
        */
        if (error.code === "23505") {
            const duplicateError = new Error(
                "An encounter already exists for this appointment"
            );

            duplicateError.code = "ENCOUNTER_ALREADY_EXISTS";
            throw duplicateError;
        }

        throw error;
    }
};


/*
    Get all encounters visible to the current user.

    ADMIN   → all encounters
    DOCTOR  → only their own encounters
    PATIENT → only their own encounters
*/
export const getEncounters = async ({
    userId,
    role
}) => {
    let query = `
        SELECT
            e.id,
            e."appointmentId",
            e."patientId",
            e."doctorId",
            e.diagnosis,
            e."clinicalNotes",
            e."createdAt",
            e."updatedAt",

            a."appointmentAt",
            a.status AS "appointmentStatus",

            p."firstName" AS "patientFirstName",
            p."lastName" AS "patientLastName",

            d."firstName" AS "doctorFirstName",
            d."lastName" AS "doctorLastName",
            d.specialization AS "doctorSpecialization"

        FROM encounter e

        JOIN appointment a
            ON a.id = e."appointmentId"

        JOIN patient p
            ON p.id = e."patientId"

        JOIN doctor d
            ON d.id = e."doctorId"
    `;

    const values = [];

    if (role === "DOCTOR") {
        query += `
            WHERE d."userId" = $1
        `;

        values.push(userId);
    } else if (role === "PATIENT") {
        query += `
            WHERE p."userId" = $1
        `;

        values.push(userId);
    }

    query += `
        ORDER BY a."appointmentAt" DESC, e.id DESC
    `;

    const result = await pool.query(query, values);

    return result.rows;
};


/*
    Get one encounter.

    ADMIN   → any encounter
    DOCTOR  → own encounter only
    PATIENT → own encounter only
*/
export const getEncounterById = async (
    id,
    {
        userId,
        role
    }
) => {
    const result = await pool.query(
        `
        SELECT
            e.id,
            e."appointmentId",
            e."patientId",
            e."doctorId",
            e.diagnosis,
            e."clinicalNotes",
            e."createdAt",
            e."updatedAt",

            a."appointmentAt",
            a.status AS "appointmentStatus",

            p."firstName" AS "patientFirstName",
            p."lastName" AS "patientLastName",
            p."userId" AS "patientUserId",

            d."firstName" AS "doctorFirstName",
            d."lastName" AS "doctorLastName",
            d.specialization AS "doctorSpecialization",
            d."userId" AS "doctorUserId"

        FROM encounter e

        JOIN appointment a
            ON a.id = e."appointmentId"

        JOIN patient p
            ON p.id = e."patientId"

        JOIN doctor d
            ON d.id = e."doctorId"

        WHERE e.id = $1
        `,
        [id]
    );

    const encounter = result.rows[0];

    if (!encounter) {
        return null;
    }

    if (role === "ADMIN") {
        return encounter;
    }

    if (
        role === "DOCTOR" &&
        Number(encounter.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You can only view your own encounters"
        );

        error.code = "ENCOUNTER_ACCESS_DENIED";
        throw error;
    }

    if (
        role === "PATIENT" &&
        Number(encounter.patientUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You can only view your own encounters"
        );

        error.code = "ENCOUNTER_ACCESS_DENIED";
        throw error;
    }

    return encounter;
};


/*
    Update clinical information.

    Only the doctor who owns the encounter can update it.

    appointmentId, patientId and doctorId are intentionally NOT
    updateable because they define the encounter's relationship.
*/
export const updateEncounter = async (
    id,
    {
        diagnosis,
        clinicalNotes
    },
    {
        userId
    }
) => {
    const existingResult = await pool.query(
        `
        SELECT
            e.*,
            d."userId" AS "doctorUserId"
        FROM encounter e
        JOIN doctor d
            ON d.id = e."doctorId"
        WHERE e.id = $1
        `,
        [id]
    );

    const encounter = existingResult.rows[0];

    if (!encounter) {
        return null;
    }

    if (
        Number(encounter.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You can only update your own encounters"
        );

        error.code = "ENCOUNTER_ACCESS_DENIED";
        throw error;
    }

    const newDiagnosis =
        diagnosis === undefined
            ? encounter.diagnosis
            : diagnosis;

    const newClinicalNotes =
        clinicalNotes === undefined
            ? encounter.clinicalNotes
            : clinicalNotes;

    const result = await pool.query(
        `
        UPDATE encounter
        SET
            diagnosis = $1,
            "clinicalNotes" = $2,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
        `,
        [
            newDiagnosis,
            newClinicalNotes,
            id
        ]
    );

    return result.rows[0];
};