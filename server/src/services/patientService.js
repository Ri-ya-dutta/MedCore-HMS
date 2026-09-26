import { db } from "../prisma/db.ts";

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
    const patient = await db.orm.public.Patient.create({
        firstName,
        lastName,
        dateOfBirth: Temporal.Instant.from(`${dateOfBirth}T00:00:00Z`),
        gender,
        phone,
        email: email || null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        bloodGroup: bloodGroup || null,
        userId: userId || null
    });

    return patient;
};

export const getPatientById = async (id) => {
    const patient = await db.orm.public.Patient
        .where({ id })
        .first();

    return patient;
};