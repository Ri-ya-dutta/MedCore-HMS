import { pool } from "../config/db.js";


const getLabOrderContext = async (
    encounterId,
    labOrderId
) => {

    const result = await pool.query(
        `
        SELECT
            lo."id",
            lo."encounterId",
            lo."status",
            p."userId" AS "patientUserId",
            d."userId" AS "doctorUserId"
        FROM "labOrder" lo
        JOIN "encounter" e
            ON e."id" = lo."encounterId"
        LEFT JOIN "patient" p
            ON p."id" = e."patientId"
        LEFT JOIN "doctor" d
            ON d."id" = e."doctorId"
        WHERE
            lo."id" = $1
            AND lo."encounterId" = $2
        `,
        [
            labOrderId,
            encounterId
        ]
    );

    return result.rows[0] || null;
};


const authorizeResultAccess = ({
    order,
    userId,
    role
}) => {

    if (role === "ADMIN") {
        return;
    }

    if (role === "DOCTOR") {
        if (
            order.doctorUserId === null ||
            Number(order.doctorUserId) !== Number(userId)
        ) {
            const error = new Error(
                "You are not authorized to access this lab result"
            );
            error.statusCode = 403;
            throw error;
        }

        return;
    }

    if (role === "PATIENT") {
        if (
            order.patientUserId === null ||
            Number(order.patientUserId) !== Number(userId)
        ) {
            const error = new Error(
                "You are not authorized to access this lab result"
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


const validateResultData = ({
    resultValue,
    referenceRange,
    remarks,
    completedAt
}) => {

    if (
        typeof resultValue !== "string" ||
        resultValue.trim() === ""
    ) {
        const error = new Error(
            "resultValue is required"
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        referenceRange !== undefined &&
        referenceRange !== null &&
        typeof referenceRange !== "string"
    ) {
        const error = new Error(
            "referenceRange must be a string"
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        remarks !== undefined &&
        remarks !== null &&
        typeof remarks !== "string"
    ) {
        const error = new Error(
            "remarks must be a string"
        );
        error.statusCode = 400;
        throw error;
    }

    if (completedAt !== undefined) {

        if (
            typeof completedAt !== "string" ||
            Number.isNaN(Date.parse(completedAt))
        ) {
            const error = new Error(
                "completedAt must be a valid date/time string"
            );
            error.statusCode = 400;
            throw error;
        }
    }
};


const getResult = async (
    client,
    labOrderId
) => {

    const result = await client.query(
        `
        SELECT
            "id",
            "labOrderId",
            "resultValue",
            "referenceRange",
            "remarks",
            "completedAt"
        FROM "labResult"
        WHERE "labOrderId" = $1
        `,
        [labOrderId]
    );

    return result.rows[0] || null;
};


/*
 * Create the single result for a lab order.
 *
 * Result creation completes the lab order.
 */
export const createLabResult = async ({
    encounterId,
    labOrderId,
    userId,
    resultValue,
    referenceRange,
    remarks,
    completedAt
}) => {

    const order = await getLabOrderContext(
        encounterId,
        labOrderId
    );

    if (!order) {
        const error = new Error(
            "Lab order not found for this encounter"
        );
        error.statusCode = 404;
        throw error;
    }

    if (
        order.doctorUserId === null ||
        Number(order.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You are not authorized to create this lab result"
        );
        error.statusCode = 403;
        throw error;
    }

    if (order.status === "CANCELLED") {
        const error = new Error(
            "Cannot create a result for a cancelled lab order"
        );
        error.statusCode = 400;
        throw error;
    }

    if (order.status !== "IN_PROGRESS") {
        const error = new Error(
            "Lab order must be IN_PROGRESS before recording a result"
        );
        error.statusCode = 400;
        throw error;
    }

    validateResultData({
        resultValue,
        referenceRange,
        remarks,
        completedAt
    });

    const existing = await pool.query(
        `
        SELECT "id"
        FROM "labResult"
        WHERE "labOrderId" = $1
        `,
        [labOrderId]
    );

    if (existing.rows.length > 0) {
        const error = new Error(
            "A result already exists for this lab order"
        );
        error.statusCode = 409;
        throw error;
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const resultInsert =
            await client.query(
                `
                INSERT INTO "labResult"
                (
                    "labOrderId",
                    "resultValue",
                    "referenceRange",
                    "remarks",
                    "completedAt"
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    "id",
                    "labOrderId",
                    "resultValue",
                    "referenceRange",
                    "remarks",
                    "completedAt"
                `,
                [
                    labOrderId,
                    resultValue.trim(),
                    referenceRange ?? null,
                    remarks ?? null,
                    completedAt
                        ? new Date(completedAt)
                        : new Date()
                ]
            );

        await client.query(
            `
            UPDATE "labOrder"
            SET
                "status" = 'COMPLETED',
                "updatedAt" = now()
            WHERE
                "id" = $1
                AND "encounterId" = $2
            `,
            [
                labOrderId,
                encounterId
            ]
        );

        const response = {
            ...resultInsert.rows[0],
            labOrderStatus: "COMPLETED"
        };

        await client.query("COMMIT");

        return response;

    } catch (error) {

        await client.query("ROLLBACK");

        if (error.code === "23505") {
            const conflictError = new Error(
                "A result already exists for this lab order"
            );
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw error;

    } finally {
        client.release();
    }
};


/*
 * Get result.
 */
export const getLabResult = async ({
    encounterId,
    labOrderId,
    userId,
    role
}) => {

    const order = await getLabOrderContext(
        encounterId,
        labOrderId
    );

    if (!order) {
        const error = new Error(
            "Lab order not found for this encounter"
        );
        error.statusCode = 404;
        throw error;
    }

    authorizeResultAccess({
        order,
        userId,
        role
    });

    const result = await getResult(
        pool,
        labOrderId
    );

    if (!result) {
        const error = new Error(
            "Lab result not found for this lab order"
        );
        error.statusCode = 404;
        throw error;
    }

    return result;
};


/*
 * Update result.
 */
export const updateLabResult = async ({
    encounterId,
    labOrderId,
    userId,
    resultValue,
    referenceRange,
    remarks,
    completedAt
}) => {

    const order = await getLabOrderContext(
        encounterId,
        labOrderId
    );

    if (!order) {
        const error = new Error(
            "Lab order not found for this encounter"
        );
        error.statusCode = 404;
        throw error;
    }

    if (
        order.doctorUserId === null ||
        Number(order.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You are not authorized to update this lab result"
        );
        error.statusCode = 403;
        throw error;
    }

    const providedFields = {
        resultValue,
        referenceRange,
        remarks,
        completedAt
    };

    const hasAnyField =
        Object.values(providedFields)
            .some((value) => value !== undefined);

    if (!hasAnyField) {
        const error = new Error(
            "At least one field is required for update"
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        resultValue !== undefined ||
        referenceRange !== undefined ||
        remarks !== undefined ||
        completedAt !== undefined
    ) {

        if (
            resultValue !== undefined
        ) {
            validateResultData({
                resultValue,
                referenceRange: undefined,
                remarks: undefined,
                completedAt: undefined
            });
        }

        if (
            referenceRange !== undefined &&
            referenceRange !== null &&
            typeof referenceRange !== "string"
        ) {
            const error = new Error(
                "referenceRange must be a string"
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            remarks !== undefined &&
            remarks !== null &&
            typeof remarks !== "string"
        ) {
            const error = new Error(
                "remarks must be a string"
            );
            error.statusCode = 400;
            throw error;
        }

        if (completedAt !== undefined) {
            if (
                typeof completedAt !== "string" ||
                Number.isNaN(Date.parse(completedAt))
            ) {
                const error = new Error(
                    "completedAt must be a valid date/time string"
                );
                error.statusCode = 400;
                throw error;
            }
        }
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const existing = await getResult(
            client,
            labOrderId
        );

        if (!existing) {
            const error = new Error(
                "Lab result not found for this lab order"
            );
            error.statusCode = 404;
            throw error;
        }

        const fields = [];
        const values = [labOrderId];

        if (resultValue !== undefined) {
            fields.push(
                `"resultValue" = $${values.length + 1}`
            );
            values.push(resultValue.trim());
        }

        if (referenceRange !== undefined) {
            fields.push(
                `"referenceRange" = $${values.length + 1}`
            );
            values.push(referenceRange);
        }

        if (remarks !== undefined) {
            fields.push(
                `"remarks" = $${values.length + 1}`
            );
            values.push(remarks);
        }

        if (completedAt !== undefined) {
            fields.push(
                `"completedAt" = $${values.length + 1}`
            );
            values.push(new Date(completedAt));
        }

        const updatedResult =
            await client.query(
                `
                UPDATE "labResult"
                SET ${fields.join(", ")}
                WHERE "labOrderId" = $1
                RETURNING
                    "id",
                    "labOrderId",
                    "resultValue",
                    "referenceRange",
                    "remarks",
                    "completedAt"
                `,
                values
            );

        await client.query(
            `
            UPDATE "labOrder"
            SET
                "status" = 'COMPLETED',
                "updatedAt" = now()
            WHERE
                "id" = $1
                AND "encounterId" = $2
            `,
            [
                labOrderId,
                encounterId
            ]
        );

        await client.query("COMMIT");

        return updatedResult.rows[0];

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {
        client.release();
    }
};