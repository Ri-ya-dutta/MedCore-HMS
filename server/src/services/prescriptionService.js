import { pool } from "../config/db.js";


const getEncounterContext = async (encounterId) => {
    const result = await pool.query(
        `
        SELECT
            e."id",
            p."userId" AS "patientUserId",
            d."userId" AS "doctorUserId"
        FROM "encounter" e
        LEFT JOIN "patient" p
            ON p."id" = e."patientId"
        LEFT JOIN "doctor" d
            ON d."id" = e."doctorId"
        WHERE e."id" = $1
        `,
        [encounterId]
    );

    return result.rows[0] || null;
};


const authorizeEncounterAccess = ({
    encounter,
    userId,
    role
}) => {

    if (role === "ADMIN") {
        return;
    }

    if (role === "DOCTOR") {
        if (
            encounter.doctorUserId === null ||
            Number(encounter.doctorUserId) !== Number(userId)
        ) {
            const error = new Error(
                "You are not authorized to access prescriptions for this encounter"
            );
            error.statusCode = 403;
            throw error;
        }

        return;
    }

    if (role === "PATIENT") {
        if (
            encounter.patientUserId === null ||
            Number(encounter.patientUserId) !== Number(userId)
        ) {
            const error = new Error(
                "You are not authorized to access prescriptions for this encounter"
            );
            error.statusCode = 403;
            throw error;
        }

        return;
    }

    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
};


const getPrescriptionByIdForEncounter = async (
    client,
    encounterId,
    prescriptionId
) => {

    const prescriptionResult = await client.query(
        `
        SELECT
            p."id",
            p."encounterId",
            p."instructions",
            p."createdAt"
        FROM "prescription" p
        WHERE
            p."id" = $1
            AND p."encounterId" = $2
        `,
        [prescriptionId, encounterId]
    );

    if (prescriptionResult.rows.length === 0) {
        return null;
    }

    const prescription = prescriptionResult.rows[0];

    const itemsResult = await client.query(
        `
        SELECT
            "id",
            "prescriptionId",
            "medicineName",
            "dosage",
            "frequency",
            "duration",
            "instructions"
        FROM "prescriptionItem"
        WHERE "prescriptionId" = $1
        ORDER BY "id"
        `,
        [prescriptionId]
    );

    prescription.items = itemsResult.rows;

    return prescription;
};


const validateItem = (item, index) => {

    if (!item || typeof item !== "object" || Array.isArray(item)) {
        const error = new Error(
            `Prescription item ${index + 1} must be an object`
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        typeof item.medicineName !== "string" ||
        item.medicineName.trim() === ""
    ) {
        const error = new Error(
            `Prescription item ${index + 1}: medicineName is required`
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        typeof item.dosage !== "string" ||
        item.dosage.trim() === ""
    ) {
        const error = new Error(
            `Prescription item ${index + 1}: dosage is required`
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        typeof item.frequency !== "string" ||
        item.frequency.trim() === ""
    ) {
        const error = new Error(
            `Prescription item ${index + 1}: frequency is required`
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        item.duration !== undefined &&
        item.duration !== null &&
        typeof item.duration !== "string"
    ) {
        const error = new Error(
            `Prescription item ${index + 1}: duration must be a string`
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        item.instructions !== undefined &&
        item.instructions !== null &&
        typeof item.instructions !== "string"
    ) {
        const error = new Error(
            `Prescription item ${index + 1}: instructions must be a string`
        );
        error.statusCode = 400;
        throw error;
    }
};


const validateItems = (items, required = false) => {

    if (items === undefined) {
        if (required) {
            const error = new Error("At least one prescription item is required");
            error.statusCode = 400;
            throw error;
        }

        return;
    }

    if (!Array.isArray(items)) {
        const error = new Error("items must be an array");
        error.statusCode = 400;
        throw error;
    }

    if (items.length === 0) {
        const error = new Error(
            "A prescription must contain at least one item"
        );
        error.statusCode = 400;
        throw error;
    }

    items.forEach((item, index) => {
        validateItem(item, index);
    });
};


/*
 * Create a prescription for an encounter.
 */
export const createPrescription = async ({
    encounterId,
    userId,
    instructions,
    items
}) => {

    const encounter = await getEncounterContext(encounterId);

    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    if (
        encounter.doctorUserId === null ||
        Number(encounter.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You are not authorized to create a prescription for this encounter"
        );
        error.statusCode = 403;
        throw error;
    }

    validateItems(items, true);

    if (
        instructions !== undefined &&
        instructions !== null &&
        typeof instructions !== "string"
    ) {
        const error = new Error("instructions must be a string");
        error.statusCode = 400;
        throw error;
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const prescriptionResult = await client.query(
            `
            INSERT INTO "prescription"
            (
                "encounterId",
                "instructions"
            )
            VALUES ($1, $2)
            RETURNING
                "id",
                "encounterId",
                "instructions",
                "createdAt"
            `,
            [
                encounterId,
                instructions ?? null
            ]
        );

        const prescription = prescriptionResult.rows[0];

        for (const item of items) {
            await client.query(
                `
                INSERT INTO "prescriptionItem"
                (
                    "prescriptionId",
                    "medicineName",
                    "dosage",
                    "frequency",
                    "duration",
                    "instructions"
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                `,
                [
                    prescription.id,
                    item.medicineName.trim(),
                    item.dosage.trim(),
                    item.frequency.trim(),
                    item.duration ?? null,
                    item.instructions ?? null
                ]
            );
        }

        const completePrescription =
            await getPrescriptionByIdForEncounter(
                client,
                encounterId,
                prescription.id
            );

        await client.query("COMMIT");

        return completePrescription;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
};


/*
 * Get all prescriptions for an encounter.
 */
export const getPrescriptionsByEncounter = async ({
    encounterId,
    userId,
    role
}) => {

    const encounter = await getEncounterContext(encounterId);

    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    authorizeEncounterAccess({
        encounter,
        userId,
        role
    });

    const prescriptionResult = await pool.query(
        `
        SELECT
            p."id",
            p."encounterId",
            p."instructions",
            p."createdAt"
        FROM "prescription" p
        WHERE p."encounterId" = $1
        ORDER BY p."createdAt", p."id"
        `,
        [encounterId]
    );

    const prescriptions = [];

    for (const prescription of prescriptionResult.rows) {

        const itemsResult = await pool.query(
            `
            SELECT
                "id",
                "prescriptionId",
                "medicineName",
                "dosage",
                "frequency",
                "duration",
                "instructions"
            FROM "prescriptionItem"
            WHERE "prescriptionId" = $1
            ORDER BY "id"
            `,
            [prescription.id]
        );

        prescriptions.push({
            ...prescription,
            items: itemsResult.rows
        });
    }

    return prescriptions;
};


/*
 * Get one prescription belonging to a specific encounter.
 */
export const getPrescription = async ({
    encounterId,
    prescriptionId,
    userId,
    role
}) => {

    const encounter = await getEncounterContext(encounterId);

    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    authorizeEncounterAccess({
        encounter,
        userId,
        role
    });

    const prescription =
        await getPrescriptionByIdForEncounter(
            pool,
            encounterId,
            prescriptionId
        );

    if (!prescription) {
        const error = new Error(
            "Prescription not found for this encounter"
        );
        error.statusCode = 404;
        throw error;
    }

    return prescription;
};


/*
 * Update one prescription.
 *
 * If "items" is provided, the existing item set is replaced atomically.
 * If "items" is omitted, only prescription-level fields are updated.
 */
export const updatePrescription = async ({
    encounterId,
    prescriptionId,
    userId,
    instructions,
    items
}) => {

    const encounter = await getEncounterContext(encounterId);

    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    if (
        encounter.doctorUserId === null ||
        Number(encounter.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You are not authorized to update this prescription"
        );
        error.statusCode = 403;
        throw error;
    }

    if (instructions !== undefined && instructions !== null) {
        if (typeof instructions !== "string") {
            const error = new Error("instructions must be a string");
            error.statusCode = 400;
            throw error;
        }
    }

    validateItems(items, false);

    if (
        instructions === undefined &&
        items === undefined
    ) {
        const error = new Error(
            "At least one field is required for update"
        );
        error.statusCode = 400;
        throw error;
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existing = await getPrescriptionByIdForEncounter(
            client,
            encounterId,
            prescriptionId
        );

        if (!existing) {
            const error = new Error(
                "Prescription not found for this encounter"
            );
            error.statusCode = 404;
            throw error;
        }

        if (instructions !== undefined) {
            await client.query(
                `
                UPDATE "prescription"
                SET "instructions" = $1
                WHERE
                    "id" = $2
                    AND "encounterId" = $3
                `,
                [
                    instructions,
                    prescriptionId,
                    encounterId
                ]
            );
        }

        if (items !== undefined) {

            await client.query(
                `
                DELETE FROM "prescriptionItem"
                WHERE "prescriptionId" = $1
                `,
                [prescriptionId]
            );

            for (const item of items) {
                await client.query(
                    `
                    INSERT INTO "prescriptionItem"
                    (
                        "prescriptionId",
                        "medicineName",
                        "dosage",
                        "frequency",
                        "duration",
                        "instructions"
                    )
                    VALUES ($1, $2, $3, $4, $5, $6)
                    `,
                    [
                        prescriptionId,
                        item.medicineName.trim(),
                        item.dosage.trim(),
                        item.frequency.trim(),
                        item.duration ?? null,
                        item.instructions ?? null
                    ]
                );
            }
        }

        const updated =
            await getPrescriptionByIdForEncounter(
                client,
                encounterId,
                prescriptionId
            );

        await client.query("COMMIT");

        return updated;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
};