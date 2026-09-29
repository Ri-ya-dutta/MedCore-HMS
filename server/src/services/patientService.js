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
    const patient = await db.orm.public.Patient
        .where({ id })
        .first();

    if (!patient) {
        return null;
    }

    const updatedPatient = await db.orm.public.Patient.update(
        { id },
        {
            firstName: firstName ?? patient.firstName,
            lastName: lastName ?? patient.lastName,
            dateOfBirth: dateOfBirth
                ? Temporal.Instant.from(`${dateOfBirth}T00:00:00Z`)
                : patient.dateOfBirth,
            gender: gender ?? patient.gender,
            phone: phone ?? patient.phone,
            email: email ?? patient.email,
            address: address ?? patient.address,
            emergencyContact: emergencyContact ?? patient.emergencyContact,
            bloodGroup: bloodGroup ?? patient.bloodGroup
        }
    );

    return updatedPatient;
};

export const getPatients = async (search) => {
    const patients = await db.orm.public.Patient.all();

    if (!search) {
        return patients;
    }

    const normalizedSearch = search.toLowerCase();

    return patients.filter((patient) => {
        return (
            patient.firstName.toLowerCase().includes(normalizedSearch) ||
            patient.lastName.toLowerCase().includes(normalizedSearch) ||
            patient.phone.toLowerCase().includes(normalizedSearch) ||
            patient.email?.toLowerCase().includes(normalizedSearch)
        );
    });
};