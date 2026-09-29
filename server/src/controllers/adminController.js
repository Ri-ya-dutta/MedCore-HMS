import { db } from "../prisma/db.ts";

import {
    createHospital,
    getHospitals,
    updateHospital,

    createDepartment,
    getDepartments,
    updateDepartment,

    createUser,
    getUsers,
    updateUserRole,
    updateUserStatus,

    createDoctor,
    getDoctors,
    updateDoctor
} from "../services/adminService.js";


/* =========================
   HOSPITAL
========================= */

export const createHospitalController = async (req, res) => {
    try {
        const {
            name,
            address,
            phone,
            email
        } = req.body;

        if (!name || typeof name !== "string") {
            return res.status(400).json({
                message: "Hospital name is required"
            });
        }

        const hospital = await createHospital({
            name: name.trim(),
            address: typeof address === "string"
                ? address.trim()
                : address,
            phone: typeof phone === "string"
                ? phone.trim()
                : phone,
            email: typeof email === "string"
                ? email.trim()
                : email
        });

        return res.status(201).json({
            message: "Hospital created successfully",
            hospital
        });

    } catch (error) {
        console.error("Create hospital error:", error);

        return res.status(500).json({
            message: "Failed to create hospital"
        });
    }
};


export const getHospitalsController = async (req, res) => {
    try {
        const hospitals = await getHospitals();

        return res.status(200).json({
            count: hospitals.length,
            hospitals
        });

    } catch (error) {
        console.error("Get hospitals error:", error);

        return res.status(500).json({
            message: "Failed to fetch hospitals"
        });
    }
};


export const updateHospitalController = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid hospital ID"
            });
        }

        const {
            name,
            address,
            phone,
            email
        } = req.body;

        const hospital = await updateHospital(id, {
            name: name?.trim(),
            address: address?.trim(),
            phone: phone?.trim(),
            email: email?.trim()
        });

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        return res.status(200).json({
            message: "Hospital updated successfully",
            hospital
        });

    } catch (error) {
        console.error("Update hospital error:", error);

        return res.status(500).json({
            message: "Failed to update hospital"
        });
    }
};


/* =========================
   DEPARTMENT
========================= */

export const createDepartmentController = async (req, res) => {
    try {
        const {
            name,
            description,
            hospitalId
        } = req.body;

        if (
            !name ||
            typeof name !== "string" ||
            hospitalId === undefined
        ) {
            return res.status(400).json({
                message: "Department name and hospital ID are required"
            });
        }

        const parsedHospitalId = Number(hospitalId);

        if (!Number.isInteger(parsedHospitalId) || parsedHospitalId <= 0) {
            return res.status(400).json({
                message: "Invalid hospital ID"
            });
        }

        const hospital = await db.orm.public.Hospital
            .where({ id: parsedHospitalId })
            .first();

        if (!hospital) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        const department = await createDepartment({
            name: name.trim(),
            description: typeof description === "string"
                ? description.trim()
                : description,
            hospitalId: parsedHospitalId
        });

        return res.status(201).json({
            message: "Department created successfully",
            department
        });

    } catch (error) {
        console.error("Create department error:", error);

        return res.status(500).json({
            message: "Failed to create department"
        });
    }
};


export const getDepartmentsController = async (req, res) => {
    try {
        const departments = await getDepartments();

        return res.status(200).json({
            count: departments.length,
            departments
        });

    } catch (error) {
        console.error("Get departments error:", error);

        return res.status(500).json({
            message: "Failed to fetch departments"
        });
    }
};


export const updateDepartmentController = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid department ID"
            });
        }

        const {
            name,
            description,
            hospitalId
        } = req.body;

        let parsedHospitalId;

        if (hospitalId !== undefined) {
            parsedHospitalId = Number(hospitalId);

            if (
                !Number.isInteger(parsedHospitalId) ||
                parsedHospitalId <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid hospital ID"
                });
            }

            const hospital = await db.orm.public.Hospital
                .where({ id: parsedHospitalId })
                .first();

            if (!hospital) {
                return res.status(404).json({
                    message: "Hospital not found"
                });
            }
        }

        const department = await updateDepartment(id, {
            name: name?.trim(),
            description: description?.trim(),
            hospitalId: parsedHospitalId
        });

        if (!department) {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        return res.status(200).json({
            message: "Department updated successfully",
            department
        });

    } catch (error) {
        console.error("Update department error:", error);

        return res.status(500).json({
            message: "Failed to update department"
        });
    }
};


/* =========================
   USERS
========================= */

export const createUserController = async (req, res) => {
    try {
        const {
            email,
            password,
            role
        } = req.body;

        const allowedRoles = [
            "ADMIN",
            "DOCTOR",
            "RECEPTIONIST",
            "PATIENT"
        ];

        if (
            !email ||
            typeof email !== "string" ||
            !password ||
            typeof password !== "string" ||
            !role
        ) {
            return res.status(400).json({
                message: "Email, password and role are required"
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters long"
            });
        }

        const user = await createUser({
            email,
            password,
            role
        });

        return res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });

    } catch (error) {
        console.error("Create user error:", error);

        if (error.code === "EMAIL_EXISTS") {
            return res.status(409).json({
                message: "Email is already registered"
            });
        }

        return res.status(500).json({
            message: "Failed to create user"
        });
    }
};


export const getUsersController = async (req, res) => {
    try {
        const users = await getUsers();

        return res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        return res.status(500).json({
            message: "Failed to fetch users"
        });
    }
};


export const updateUserRoleController = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { role } = req.body;

        const allowedRoles = [
            "ADMIN",
            "DOCTOR",
            "RECEPTIONIST",
            "PATIENT"
        ];

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const user = await updateUserRole(id, role);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User role updated successfully",
            user
        });

    } catch (error) {
        console.error("Update user role error:", error);

        return res.status(500).json({
            message: "Failed to update user role"
        });
    }
};


export const updateUserStatusController = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { isActive } = req.body;

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be a boolean"
            });
        }

        const user = await updateUserStatus(id, isActive);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "User status updated successfully",
            user
        });

    } catch (error) {
        console.error("Update user status error:", error);

        return res.status(500).json({
            message: "Failed to update user status"
        });
    }
};


/* =========================
   DOCTORS
========================= */

export const createDoctorController = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            specialization,
            phone,
            licenseNumber,
            userId,
            departmentId
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !specialization ||
            !licenseNumber ||
            userId === undefined ||
            departmentId === undefined
        ) {
            return res.status(400).json({
                message: "Required doctor fields are missing"
            });
        }

        const parsedUserId = Number(userId);
        const parsedDepartmentId = Number(departmentId);

        if (
            !Number.isInteger(parsedUserId) ||
            parsedUserId <= 0 ||
            !Number.isInteger(parsedDepartmentId) ||
            parsedDepartmentId <= 0
        ) {
            return res.status(400).json({
                message: "Invalid user ID or department ID"
            });
        }

        const doctor = await createDoctor({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            specialization: specialization.trim(),
            phone: phone?.trim(),
            licenseNumber: licenseNumber.trim(),
            userId: parsedUserId,
            departmentId: parsedDepartmentId
        });

        return res.status(201).json({
            message: "Doctor created successfully",
            doctor
        });

    } catch (error) {
        console.error("Create doctor error:", error);

        if (error.code === "USER_NOT_FOUND") {
            return res.status(404).json({
                message: "Doctor user not found"
            });
        }

        if (error.code === "INVALID_DOCTOR_ROLE") {
            return res.status(400).json({
                message: "Selected user must have DOCTOR role"
            });
        }

        if (error.code === "DEPARTMENT_NOT_FOUND") {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        return res.status(500).json({
            message: "Failed to create doctor"
        });
    }
};


export const getDoctorsController = async (req, res) => {
    try {
        const doctors = await getDoctors();

        return res.status(200).json({
            count: doctors.length,
            doctors
        });

    } catch (error) {
        console.error("Get doctors error:", error);

        return res.status(500).json({
            message: "Failed to fetch doctors"
        });
    }
};


export const updateDoctorController = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "Invalid doctor ID"
            });
        }

        const {
            firstName,
            lastName,
            specialization,
            phone,
            licenseNumber,
            departmentId
        } = req.body;

        let parsedDepartmentId;

        if (departmentId !== undefined) {
            parsedDepartmentId = Number(departmentId);

            if (
                !Number.isInteger(parsedDepartmentId) ||
                parsedDepartmentId <= 0
            ) {
                return res.status(400).json({
                    message: "Invalid department ID"
                });
            }
        }

        const doctor = await updateDoctor(id, {
            firstName: firstName?.trim(),
            lastName: lastName?.trim(),
            specialization: specialization?.trim(),
            phone: phone?.trim(),
            licenseNumber: licenseNumber?.trim(),
            departmentId: parsedDepartmentId
        });

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found"
            });
        }

        return res.status(200).json({
            message: "Doctor updated successfully",
            doctor
        });

    } catch (error) {
        console.error("Update doctor error:", error);

        if (error.code === "DEPARTMENT_NOT_FOUND") {
            return res.status(404).json({
                message: "Department not found"
            });
        }

        return res.status(500).json({
            message: "Failed to update doctor"
        });
    }
};