import bcrypt from "bcryptjs";
import { db } from "../prisma/db.ts";
import { pool } from "../config/db.js";

/* =========================
   HOSPITAL
========================= */

export const createHospital = async ({
    name,
    address,
    phone,
    email
}) => {
    const result = await pool.query(
        `
        INSERT INTO hospital (
            name,
            address,
            phone,
            email
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            name,
            address ?? null,
            phone ?? null,
            email ?? null
        ]
    );

    return result.rows[0];
};

export const getHospitals = async () => {
    const result = await pool.query(
        `
        SELECT *
        FROM hospital
        ORDER BY id
        `
    );

    return result.rows;
};

export const updateHospital = async (
    id,
    {
        name,
        address,
        phone,
        email
    }
) => {
    const existingResult = await pool.query(
        `
        SELECT *
        FROM hospital
        WHERE id = $1
        `,
        [id]
    );

    const hospital = existingResult.rows[0];

    if (!hospital) {
        return null;
    }

    const result = await pool.query(
        `
        UPDATE hospital
        SET
            name = $1,
            address = $2,
            phone = $3,
            email = $4,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
        `,
        [
            name ?? hospital.name,
            address ?? hospital.address,
            phone ?? hospital.phone,
            email ?? hospital.email,
            id
        ]
    );

    return result.rows[0];
};

/* =========================
   DEPARTMENT
========================= */

export const createDepartment = async ({
    name,
    description,
    hospitalId
}) => {
    const result = await pool.query(
        `
        INSERT INTO department (
            name,
            description,
            "hospitalId"
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [
            name,
            description ?? null,
            hospitalId
        ]
    );

    return result.rows[0];
};

export const getDepartments = async () => {
    const result = await pool.query(
        `
        SELECT *
        FROM department
        ORDER BY id
        `
    );

    return result.rows;
};

export const updateDepartment = async (
    id,
    {
        name,
        description,
        hospitalId
    }
) => {
    const existingResult = await pool.query(
        `
        SELECT *
        FROM department
        WHERE id = $1
        `,
        [id]
    );

    const department = existingResult.rows[0];

    if (!department) {
        return null;
    }

    const result = await pool.query(
        `
        UPDATE department
        SET
            name = $1,
            description = $2,
            "hospitalId" = $3,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $4
        RETURNING *
        `,
        [
            name ?? department.name,
            description ?? department.description,
            hospitalId ?? department.hospitalId,
            id
        ]
    );

    return result.rows[0];
};


/* =========================
   USERS
========================= */

export const createUser = async ({
    email,
    password,
    role
}) => {
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

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
        `
        INSERT INTO "user" (
            email,
            "passwordHash",
            role,
            "isActive"
        )
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [
            normalizedEmail,
            passwordHash,
            role,
            true
        ]
    );

    return result.rows[0];
};

export const getUsers = async () => {
    const result = await pool.query(
        `
        SELECT
            id,
            email,
            role,
            "isActive",
            "createdAt",
            "updatedAt"
        FROM "user"
        ORDER BY id
        `
    );

    return result.rows;
};

export const updateUserRole = async (id, role) => {
    const existingResult = await pool.query(
        `
        SELECT *
        FROM "user"
        WHERE id = $1
        `,
        [id]
    );

    const user = existingResult.rows[0];

    if (!user) {
        return null;
    }

    const result = await pool.query(
        `
        UPDATE "user"
        SET
            role = $1,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING
            id,
            email,
            role,
            "isActive",
            "createdAt",
            "updatedAt"
        `,
        [
            role,
            id
        ]
    );

    return result.rows[0];
};

export const updateUserStatus = async (id, isActive) => {
    const existingResult = await pool.query(
        `
        SELECT *
        FROM "user"
        WHERE id = $1
        `,
        [id]
    );

    const user = existingResult.rows[0];

    if (!user) {
        return null;
    }

    const result = await pool.query(
        `
        UPDATE "user"
        SET
            "isActive" = $1,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING
            id,
            email,
            role,
            "isActive",
            "createdAt",
            "updatedAt"
        `,
        [
            isActive,
            id
        ]
    );

    return result.rows[0];
};

/* =========================
   DOCTORS
========================= */

export const createDoctor = async ({
    firstName,
    lastName,
    specialization,
    phone,
    licenseNumber,
    userId,
    departmentId
}) => {
    const userResult = await pool.query(
        `
        SELECT *
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

    if (user.role !== "DOCTOR") {
        const error = new Error("User must have DOCTOR role");
        error.code = "INVALID_DOCTOR_ROLE";
        throw error;
    }

    const departmentResult = await pool.query(
        `
        SELECT *
        FROM department
        WHERE id = $1
        `,
        [departmentId]
    );

    const department = departmentResult.rows[0];

    if (!department) {
        const error = new Error("Department not found");
        error.code = "DEPARTMENT_NOT_FOUND";
        throw error;
    }

    const result = await pool.query(
        `
        INSERT INTO doctor (
            "firstName",
            "lastName",
            specialization,
            phone,
            "licenseNumber",
            "userId",
            "departmentId"
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        `,
        [
            firstName,
            lastName,
            specialization,
            phone ?? null,
            licenseNumber,
            userId,
            departmentId
        ]
    );

    return result.rows[0];
};

export const getDoctors = async () => {
    const result = await pool.query(
        `
        SELECT *
        FROM doctor
        ORDER BY id
        `
    );

    return result.rows;
};

export const updateDoctor = async (
    id,
    {
        firstName,
        lastName,
        specialization,
        phone,
        licenseNumber,
        departmentId
    }
) => {
    const existingResult = await pool.query(
        `
        SELECT *
        FROM doctor
        WHERE id = $1
        `,
        [id]
    );

    const doctor = existingResult.rows[0];

    if (!doctor) {
        return null;
    }

    if (departmentId !== undefined) {
        const departmentResult = await pool.query(
            `
            SELECT *
            FROM department
            WHERE id = $1
            `,
            [departmentId]
        );

        const department = departmentResult.rows[0];

        if (!department) {
            const error = new Error("Department not found");
            error.code = "DEPARTMENT_NOT_FOUND";
            throw error;
        }
    }

    const result = await pool.query(
        `
        UPDATE doctor
        SET
            "firstName" = $1,
            "lastName" = $2,
            specialization = $3,
            phone = $4,
            "licenseNumber" = $5,
            "departmentId" = $6,
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *
        `,
        [
            firstName ?? doctor.firstName,
            lastName ?? doctor.lastName,
            specialization ?? doctor.specialization,
            phone ?? doctor.phone,
            licenseNumber ?? doctor.licenseNumber,
            departmentId ?? doctor.departmentId,
            id
        ]
    );

    return result.rows[0];
};

export const linkPatientToUser = async (
    patientId,
    userId
) => {
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
            "Only PATIENT users can be linked to patient records"
        );

        error.code = "INVALID_USER_ROLE";
        throw error;
    }

    if (!user.isActive) {
        const error = new Error("User account is inactive");
        error.code = "USER_INACTIVE";
        throw error;
    }

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