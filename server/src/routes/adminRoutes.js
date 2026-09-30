import express from "express";

import {
    authenticate,
    authorizeRoles
} from "../middleware/authMiddleware.js";

import {
    createHospitalController,
    getHospitalsController,
    updateHospitalController,
    createDepartmentController,
    getDepartmentsController,
    updateDepartmentController,
    createUserController,
    getUsersController,
    updateUserRoleController,
    updateUserStatusController,
    createDoctorController,
    getDoctorsController,
    updateDoctorController,
    linkPatientToUserController
} from "../controllers/adminController.js";

const router = express.Router();

router.use(
    authenticate,
    authorizeRoles("ADMIN")
);

/* Hospital */
router.post(
    "/hospitals",
    createHospitalController
);

router.get(
    "/hospitals",
    getHospitalsController
);

router.put(
    "/hospitals/:id",
    updateHospitalController
);

/* Department */
router.post(
    "/departments",
    createDepartmentController
);

router.get(
    "/departments",
    getDepartmentsController
);

router.put(
    "/departments/:id",
    updateDepartmentController
);

/* Users */
router.post(
    "/users",
    createUserController
);


router.get(
    "/users",
    getUsersController
);

router.put(
    "/users/:id/role",
    updateUserRoleController
);

router.put(
    "/users/:id/status",
    updateUserStatusController
);

/* Doctors */
router.post(
    "/doctors",
    createDoctorController
);

router.get(
    "/doctors",
    getDoctorsController
);

router.put(
    "/doctors/:id",
    updateDoctorController
);

router.put(
    "/patients/:patientId/link-user",
    linkPatientToUserController
);

export default router;

