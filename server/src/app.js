import express from "express";
import { db } from "./prisma/db.ts";
import authRoutes from "./routes/authRoutes.js";


const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

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

export default app;