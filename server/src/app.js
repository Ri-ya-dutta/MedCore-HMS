import express from "express";
import { db } from "./prisma/db.ts";

import { pool } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/appointments", appointmentRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "MedCore HMS API is running!"
    });
});

app.get("/db-test", async (req, res) => {
    try {
        const users = await db.orm.public.User.all();

        res.json({
            message: "Database connection successful!",
            users
        });
    } catch (error) {
        console.error("Database test failed:", error);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.get("/pg-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT 1 AS connected");

        res.json({
            message: "PostgreSQL connection successful!",
            result: result.rows
        });
    } catch (error) {
        console.error("PostgreSQL connection failed:", error);

        res.status(500).json({
            message: "PostgreSQL connection failed"
        });
    }
});

export default app;