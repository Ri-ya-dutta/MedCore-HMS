import express from "express";
import cors from "cors";

import { pool } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";

const app = express();

app.use(
    cors({
        origin: true
    })
);

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

app.get("/pg-test", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT 1 AS connected"
        );

        res.json({
            message: "PostgreSQL connection successful!",
            result: result.rows
        });
    } catch (error) {
        console.error(
            "PostgreSQL connection failed:",
            error
        );

        res.status(500).json({
            message: "PostgreSQL connection failed"
        });
    }
});

export default app;