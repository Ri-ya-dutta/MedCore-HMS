import { pool } from "../config/db.js";

export const createAppointment = async ({
    patientId,
    doctorId,
    appointmentAt,
    reason
}) => {
    // Verify patient exists
    const patientResult = await pool.query(
        `
        SELECT id
        FROM patient
        WHERE id = $1
        `,
        [patientId]
    );

    if (patientResult.rows.length === 0) {
        const error = new Error("Patient not found");
        error.code = "PATIENT_NOT_FOUND";
        throw error;
    }

    // Verify doctor exists
    const doctorResult = await pool.query(
        `
        SELECT id
        FROM doctor
        WHERE id = $1
        `,
        [doctorId]
    );

    if (doctorResult.rows.length === 0) {
        const error = new Error("Doctor not found");
        error.code = "DOCTOR_NOT_FOUND";
        throw error;
    }

    // Prevent double-booking the same doctor
    const existingAppointment = await pool.query(
        `
        SELECT id
        FROM appointment
        WHERE "doctorId" = $1
          AND "appointmentAt" = $2
          AND status IN ('SCHEDULED', 'RESCHEDULED')
        `,
        [doctorId, appointmentAt]
    );

    if (existingAppointment.rows.length > 0) {
        const error = new Error(
            "Doctor already has an appointment at this time"
        );
        error.code = "DOCTOR_ALREADY_BOOKED";
        throw error;
    }

    const result = await pool.query(
        `
        INSERT INTO appointment (
            "patientId",
            "doctorId",
            "appointmentAt",
            reason
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            patientId,
            doctorId,
            appointmentAt,
            reason || null
        ]
    );

    return result.rows[0];
};


export const getAppointments = async ({
    userId,
    role
}) => {
    let query = `
        SELECT
            a.id,
            a."patientId",
            a."doctorId",
            a."appointmentAt",
            a.reason,
            a.status,
            a."createdAt",
            a."updatedAt",

            p."firstName" AS "patientFirstName",
            p."lastName" AS "patientLastName",

            d."firstName" AS "doctorFirstName",
            d."lastName" AS "doctorLastName",
            d.specialization AS "doctorSpecialization"

        FROM appointment a

        JOIN patient p
            ON p.id = a."patientId"

        JOIN doctor d
            ON d.id = a."doctorId"
    `;

    const values = [];

    // Patient sees only their own appointments
    if (role === "PATIENT") {
        query += `
            JOIN "user" u
                ON u.id = p."userId"
            WHERE u.id = $1
        `;

        values.push(userId);
    }

    // Doctor sees their own appointments
    else if (role === "DOCTOR") {
        query += `
            WHERE d."userId" = $1
        `;

        values.push(userId);
    }

    query += `
        ORDER BY a."appointmentAt" ASC
    `;

    const result = await pool.query(query, values);

    return result.rows;
};


export const getAppointmentById = async (
    id,
    {
        userId,
        role
    }
) => {
    const result = await pool.query(
        `
        SELECT
            a.id,
            a."patientId",
            a."doctorId",
            a."appointmentAt",
            a.reason,
            a.status,
            a."createdAt",
            a."updatedAt",

            p."firstName" AS "patientFirstName",
            p."lastName" AS "patientLastName",

            d."firstName" AS "doctorFirstName",
            d."lastName" AS "doctorLastName",
            d.specialization AS "doctorSpecialization",

            p."userId" AS "patientUserId",
            d."userId" AS "doctorUserId"

        FROM appointment a

        JOIN patient p
            ON p.id = a."patientId"

        JOIN doctor d
            ON d.id = a."doctorId"

        WHERE a.id = $1
        `,
        [id]
    );

    const appointment = result.rows[0];

    if (!appointment) {
        return null;
    }

    // ADMIN and RECEPTIONIST can view any appointment
    if (
        role === "ADMIN" ||
        role === "RECEPTIONIST"
    ) {
        return appointment;
    }

    // DOCTOR can view only their own appointments
    if (
        role === "DOCTOR" &&
        appointment.doctorUserId !== userId
    ) {
        const error = new Error(
            "You can only view your own appointments"
        );

        error.code = "APPOINTMENT_ACCESS_DENIED";

        throw error;
    }

    // PATIENT can view only their own appointments
    if (
        role === "PATIENT" &&
        appointment.patientUserId !== userId
    ) {
        const error = new Error(
            "You can only view your own appointments"
        );

        error.code = "APPOINTMENT_ACCESS_DENIED";

        throw error;
    }

    return appointment;
};

export const updateAppointment = async (
   id,
    {
        appointmentAt,
        reason,
        status
    },
    {
        userId,
        role
    }
) => {
    const existingResult = await pool.query(
        `
        SELECT *
        FROM appointment
        WHERE id = $1
        `,
        [id]
    );

    const appointment = existingResult.rows[0];

    if (!appointment) {
        return null;
    }
    if (role === "DOCTOR") {
    const doctorResult = await pool.query(
        `
        SELECT id
        FROM doctor
        WHERE id = $1
          AND "userId" = $2
        `,
        [appointment.doctorId, userId]
    );

    if (doctorResult.rows.length === 0) {
        const error = new Error(
            "You can only update your own appointments"
        );

        error.code = "APPOINTMENT_ACCESS_DENIED";

        throw error;
    }
}

    const newAppointmentAt =
        appointmentAt ?? appointment.appointmentAt;

    const newReason =
        reason ?? appointment.reason;

    const newStatus =
        status ?? appointment.status;

    // If appointment time is changing,
    // check whether the doctor is already booked.
    if (appointmentAt) {
        const conflictResult = await pool.query(
            `
            SELECT id
            FROM appointment
            WHERE "doctorId" = $1
              AND "appointmentAt" = $2
              AND id <> $3
              AND status IN ('SCHEDULED', 'RESCHEDULED')
            `,
            [
                appointment.doctorId,
                appointmentAt,
                id
            ]
        );

        if (conflictResult.rows.length > 0) {
            const error = new Error(
                "Doctor already has an appointment at this time"
            );

            error.code = "DOCTOR_ALREADY_BOOKED";

            throw error;
        }
    }

    const result = await pool.query(
        `
        UPDATE appointment
        SET
            "appointmentAt" = $1,
            reason = $2,
            status = $3,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
        `,
        [
            newAppointmentAt,
            newReason,
            newStatus,
            id
        ]
    );

    return result.rows[0];
};