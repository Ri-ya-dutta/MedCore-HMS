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
                "You are not authorized to access lab orders for this encounter"
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
                "You are not authorized to access lab orders for this encounter"
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


const getResultForOrder = async (
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


const getLabOrderRecord = async (
    client,
    encounterId,
    labOrderId
) => {

    const result = await client.query(
        `
        SELECT
            "id",
            "encounterId",
            "testName",
            "status",
            "notes",
            "createdAt",
            "updatedAt"
        FROM "labOrder"
        WHERE
            "id" = $1
            AND "encounterId" = $2
        `,
        [
            labOrderId,
            encounterId
        ]
    );

    if (result.rows.length === 0) {
        return null;
    }

    const labOrder = result.rows[0];

    labOrder.result = await getResultForOrder(
        client,
        labOrderId
    );

    return labOrder;
};


const validateCreateData = ({
    testName,
    notes
}) => {

    if (
        typeof testName !== "string" ||
        testName.trim() === ""
    ) {
        const error = new Error(
            "testName is required"
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        notes !== undefined &&
        notes !== null &&
        typeof notes !== "string"
    ) {
        const error = new Error(
            "notes must be a string"
        );
        error.statusCode = 400;
        throw error;
    }
};


const validateUpdateData = ({
    testName,
    notes,
    status
}) => {

    if (
        testName !== undefined &&
        testName !== null &&
        (
            typeof testName !== "string" ||
            testName.trim() === ""
        )
    ) {
        const error = new Error(
            "testName must be a non-empty string"
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        notes !== undefined &&
        notes !== null &&
        typeof notes !== "string"
    ) {
        const error = new Error(
            "notes must be a string"
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        status !== undefined &&
        ![
            "ORDERED",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED"
        ].includes(status)
    ) {
        const error = new Error(
            "Invalid lab order status"
        );
        error.statusCode = 400;
        throw error;
    }
};


const validateStatusTransition = ({
    currentStatus,
    nextStatus,
    hasResult
}) => {

    if (nextStatus === currentStatus) {
        return;
    }

    const allowedTransitions = {
        ORDERED: [
            "IN_PROGRESS",
            "CANCELLED"
        ],
        IN_PROGRESS: [
            "COMPLETED",
            "CANCELLED"
        ],
        COMPLETED: [],
        CANCELLED: []
    };

    if (
        !allowedTransitions[currentStatus]?.includes(
            nextStatus
        )
    ) {
        const error = new Error(
            `Invalid status transition from ${currentStatus} to ${nextStatus}`
        );
        error.statusCode = 400;
        throw error;
    }

    if (
        nextStatus === "COMPLETED" &&
        !hasResult
    ) {
        const error = new Error(
            "Lab order cannot be marked COMPLETED before a result is recorded"
        );
        error.statusCode = 400;
        throw error;
    }
};


/*
 * Create a lab order.
 *
 * Every newly created order starts as ORDERED.
 */
export const createLabOrder = async ({
    encounterId,
    userId,
    testName,
    notes
}) => {

    const encounter = await getEncounterContext(
        encounterId
    );

    if (!encounter) {
        const error = new Error(
            "Encounter not found"
        );
        error.statusCode = 404;
        throw error;
    }

    if (
        encounter.doctorUserId === null ||
        Number(encounter.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You are not authorized to create a lab order for this encounter"
        );
        error.statusCode = 403;
        throw error;
    }

    validateCreateData({
        testName,
        notes
    });

    const result = await pool.query(
        `
        INSERT INTO "labOrder"
        (
            "encounterId",
            "testName",
            "notes"
        )
        VALUES ($1, $2, $3)
        RETURNING
            "id",
            "encounterId",
            "testName",
            "status",
            "notes",
            "createdAt",
            "updatedAt"
        `,
        [
            encounterId,
            testName.trim(),
            notes ?? null
        ]
    );

    return {
        ...result.rows[0],
        result: null
    };
};


/*
 * Get all lab orders for an encounter.
 */
export const getLabOrdersByEncounter = async ({
    encounterId,
    userId,
    role
}) => {

    const encounter = await getEncounterContext(
        encounterId
    );

    if (!encounter) {
        const error = new Error(
            "Encounter not found"
        );
        error.statusCode = 404;
        throw error;
    }

    authorizeEncounterAccess({
        encounter,
        userId,
        role
    });

    const result = await pool.query(
        `
        SELECT
            "id",
            "encounterId",
            "testName",
            "status",
            "notes",
            "createdAt",
            "updatedAt"
        FROM "labOrder"
        WHERE "encounterId" = $1
        ORDER BY "createdAt", "id"
        `,
        [encounterId]
    );

    const labOrders = [];

    for (const labOrder of result.rows) {

        const labResult =
            await getResultForOrder(
                pool,
                labOrder.id
            );

        labOrders.push({
            ...labOrder,
            result: labResult
        });
    }

    return labOrders;
};


/*
 * Get one lab order belonging to an encounter.
 */
export const getLabOrder = async ({
    encounterId,
    labOrderId,
    userId,
    role
}) => {

    const encounter = await getEncounterContext(
        encounterId
    );

    if (!encounter) {
        const error = new Error(
            "Encounter not found"
        );
        error.statusCode = 404;
        throw error;
    }

    authorizeEncounterAccess({
        encounter,
        userId,
        role
    });

    const labOrder = await getLabOrderRecord(
        pool,
        encounterId,
        labOrderId
    );

    if (!labOrder) {
        const error = new Error(
            "Lab order not found for this encounter"
        );
        error.statusCode = 404;
        throw error;
    }

    return labOrder;
};


/*
 * Update lab order.
 */
export const updateLabOrder = async ({
    encounterId,
    labOrderId,
    userId,
    testName,
    notes,
    status
}) => {

    const encounter = await getEncounterContext(
        encounterId
    );

    if (!encounter) {
        const error = new Error(
            "Encounter not found"
        );
        error.statusCode = 404;
        throw error;
    }

    if (
        encounter.doctorUserId === null ||
        Number(encounter.doctorUserId) !== Number(userId)
    ) {
        const error = new Error(
            "You are not authorized to update this lab order"
        );
        error.statusCode = 403;
        throw error;
    }

    if (
        testName === undefined &&
        notes === undefined &&
        status === undefined
    ) {
        const error = new Error(
            "At least one field is required for update"
        );
        error.statusCode = 400;
        throw error;
    }

    validateUpdateData({
        testName,
        notes,
        status
    });

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existing =
            await getLabOrderRecord(
                client,
                encounterId,
                labOrderId
            );

        if (!existing) {
            const error = new Error(
                "Lab order not found for this encounter"
            );
            error.statusCode = 404;
            throw error;
        }

        const nextStatus =
            status ?? existing.status;

        validateStatusTransition({
            currentStatus: existing.status,
            nextStatus,
            hasResult: existing.result !== null
        });

        const fields = [];
        const values = [labOrderId];

        if (testName !== undefined) {
            fields.push(
                `"testName" = $${values.length + 1}`
            );
            values.push(testName.trim());
        }

        if (notes !== undefined) {
            fields.push(
                `"notes" = $${values.length + 1}`
            );
            values.push(notes);
        }

        if (status !== undefined) {
            fields.push(
                `"status" = $${values.length + 1}`
            );
            values.push(status);
        }

        fields.push(`"updatedAt" = now()`);

        const result = await client.query(
            `
            UPDATE "labOrder"
            SET ${fields.join(", ")}
            WHERE
                "id" = $1
                AND "encounterId" = $${values.length + 1}
            RETURNING
                "id",
                "encounterId",
                "testName",
                "status",
                "notes",
                "createdAt",
                "updatedAt"
            `,
            [
                ...values,
                encounterId
            ]
        );

        const updated = result.rows[0];

        updated.result =
            await getResultForOrder(
                client,
                labOrderId
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