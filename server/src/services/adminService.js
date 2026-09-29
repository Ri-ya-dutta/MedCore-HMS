import bcrypt from "bcryptjs";
import { db } from "../prisma/db.ts";

/* =========================
   HOSPITAL
========================= */

export const createHospital = async ({
    name,
    address,
    phone,
    email
}) => {
    return await db.orm.public.Hospital.create({
        name,
        address: address || null,
        phone: phone || null,
        email: email || null
    });
};

export const getHospitals = async () => {
    return await db.orm.public.Hospital.all();
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
    const hospital = await db.orm.public.Hospital
        .where({ id })
        .first();

    if (!hospital) {
        return null;
    }

    return await db.orm.public.Hospital.update(
        { id },
        {
            name: name ?? hospital.name,
            address: address ?? hospital.address,
            phone: phone ?? hospital.phone,
            email: email ?? hospital.email
        }
    );
};


/* =========================
   DEPARTMENT
========================= */

export const createDepartment = async ({
    name,
    description,
    hospitalId
}) => {
    return await db.orm.public.Department.create({
        name,
        description: description || null,
        hospitalId
    });
};

export const getDepartments = async () => {
    return await db.orm.public.Department.all();
};

export const updateDepartment = async (
    id,
    {
        name,
        description,
        hospitalId
    }
) => {
    const department = await db.orm.public.Department
        .where({ id })
        .first();

    if (!department) {
        return null;
    }

    return await db.orm.public.Department.update(
        { id },
        {
            name: name ?? department.name,
            description: description ?? department.description,
            hospitalId: hospitalId ?? department.hospitalId
        }
    );
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

    const existingUser = await db.orm.public.User
        .where({ email: normalizedEmail })
        .first();

    if (existingUser) {
        const error = new Error("Email is already registered");
        error.code = "EMAIL_EXISTS";
        throw error;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    return await db.orm.public.User.create({
        email: normalizedEmail,
        passwordHash,
        role,
        isActive: true
    });
};

export const getUsers = async () => {
    const users = await db.orm.public.User.all();

    return users.map((user) => ({
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    }));
};

export const updateUserRole = async (id, role) => {
    const user = await db.orm.public.User
        .where({ id })
        .first();

    if (!user) {
        return null;
    }

    const updatedUser = await db.orm.public.User.update(
        { id },
        {
            role
        }
    );

    return {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
    };
};

export const updateUserStatus = async (id, isActive) => {
    const user = await db.orm.public.User
        .where({ id })
        .first();

    if (!user) {
        return null;
    }

    const updatedUser = await db.orm.public.User.update(
        { id },
        {
            isActive
        }
    );

    return {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
    };
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
    const user = await db.orm.public.User
        .where({ id: userId })
        .first();

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

    const department = await db.orm.public.Department
        .where({ id: departmentId })
        .first();

    if (!department) {
        const error = new Error("Department not found");
        error.code = "DEPARTMENT_NOT_FOUND";
        throw error;
    }

    return await db.orm.public.Doctor.create({
        firstName,
        lastName,
        specialization,
        phone: phone || null,
        licenseNumber,
        userId,
        departmentId
    });
};

export const getDoctors = async () => {
    return await db.orm.public.Doctor.all();
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
    const doctor = await db.orm.public.Doctor
        .where({ id })
        .first();

    if (!doctor) {
        return null;
    }

    if (departmentId !== undefined) {
        const department = await db.orm.public.Department
            .where({ id: departmentId })
            .first();

        if (!department) {
            const error = new Error("Department not found");
            error.code = "DEPARTMENT_NOT_FOUND";
            throw error;
        }
    }

    return await db.orm.public.Doctor.update(
        { id },
        {
            firstName: firstName ?? doctor.firstName,
            lastName: lastName ?? doctor.lastName,
            specialization: specialization ?? doctor.specialization,
            phone: phone ?? doctor.phone,
            licenseNumber: licenseNumber ?? doctor.licenseNumber,
            departmentId: departmentId ?? doctor.departmentId
        }
    );
};