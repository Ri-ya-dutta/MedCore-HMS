import { pool } from "../config/db.js";

const PAYMENT_STATUSES = [
    "PENDING",
    "PARTIAL",
    "PAID",
    "CANCELLED"
];

function validateIntegerId(value, fieldName) {
    const id = Number(value);

    if (!Number.isInteger(id) || id <= 0) {
        const error = new Error(`${fieldName} must be a valid positive integer`);
        error.statusCode = 400;
        throw error;
    }

    return id;
}

function validatePaymentStatus(status) {
    if (!PAYMENT_STATUSES.includes(status)) {
        const error = new Error(
            `paymentStatus must be one of: ${PAYMENT_STATUSES.join(", ")}`
        );
        error.statusCode = 400;
        throw error;
    }
}

function validateItems(items) {
    if (!Array.isArray(items)) {
        const error = new Error("items must be an array");
        error.statusCode = 400;
        throw error;
    }

    if (items.length === 0) {
        const error = new Error("Invoice must contain at least one item");
        error.statusCode = 400;
        throw error;
    }

    return items.map((item, index) => {
        if (
            !item ||
            typeof item !== "object" ||
            Array.isArray(item)
        ) {
            const error = new Error(
                `Invoice item ${index + 1} must be an object`
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            typeof item.description !== "string" ||
            item.description.trim().length === 0
        ) {
            const error = new Error(
                `Invoice item ${index + 1}: description is required`
            );
            error.statusCode = 400;
            throw error;
        }

        if (
            typeof item.amount !== "number" ||
            !Number.isFinite(item.amount) ||
            item.amount <= 0
        ) {
            const error = new Error(
                `Invoice item ${index + 1}: amount must be a positive number`
            );
            error.statusCode = 400;
            throw error;
        }

        return {
            description: item.description.trim(),
            amount: Number(item.amount.toFixed(2))
        };
    });
}

function calculateTotal(items) {
    const total = items.reduce(
        (sum, item) => sum + item.amount,
        0
    );

    return Number(total.toFixed(2));
}

function validatePaymentTransition(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) {
        return;
    }

    const allowedTransitions = {
        PENDING: ["PARTIAL", "PAID", "CANCELLED"],
        PARTIAL: ["PAID", "CANCELLED"],
        PAID: [],
        CANCELLED: []
    };

    if (!allowedTransitions[currentStatus]?.includes(nextStatus)) {
        const error = new Error(
            `Invalid payment status transition: ${currentStatus} -> ${nextStatus}`
        );
        error.statusCode = 400;
        throw error;
    }
}

async function getEncounterWithOwnership(client, encounterId) {
    const result = await client.query(
        `
        SELECT
            e."id",
            e."patientId",
            e."doctorId",
            p."userId" AS "patientUserId",
            d."userId" AS "doctorUserId"
        FROM "encounter" e
        JOIN "patient" p
            ON p."id" = e."patientId"
        JOIN "doctor" d
            ON d."id" = e."doctorId"
        WHERE e."id" = $1
        `,
        [encounterId]
    );

    return result.rows[0] || null;
}

async function ensureEncounterExists(client, encounterId) {
    const result = await client.query(
        `
        SELECT "id"
        FROM "encounter"
        WHERE "id" = $1
        `,
        [encounterId]
    );

    if (result.rowCount === 0) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }
}

async function checkReadAccess(client, encounterId, user) {
    const encounter = await getEncounterWithOwnership(
        client,
        encounterId
    );

    if (!encounter) {
        const error = new Error("Encounter not found");
        error.statusCode = 404;
        throw error;
    }

    if (user.role === "PATIENT") {
        if (Number(encounter.patientUserId) !== Number(user.id)) {
            const error = new Error(
                "You do not have access to this encounter"
            );
            error.statusCode = 403;
            throw error;
        }
    }

    if (user.role === "DOCTOR") {
        if (Number(encounter.doctorUserId) !== Number(user.id)) {
            const error = new Error(
                "You are not assigned to this encounter"
            );
            error.statusCode = 403;
            throw error;
        }
    }

    return encounter;
}

async function getInvoiceRecord(client, invoiceId) {
    const invoiceResult = await client.query(
        `
        SELECT
            "id",
            "encounterId",
            "paymentStatus",
            "totalAmount",
            "createdAt",
            "updatedAt"
        FROM "invoice"
        WHERE "id" = $1
        `,
        [invoiceId]
    );

    if (invoiceResult.rowCount === 0) {
        return null;
    }

    const invoice = invoiceResult.rows[0];

    const itemResult = await client.query(
        `
        SELECT
            "id",
            "invoiceId",
            "description",
            "amount"
        FROM "invoiceItem"
        WHERE "invoiceId" = $1
        ORDER BY "id" ASC
        `,
        [invoiceId]
    );

    return {
        ...invoice,
        items: itemResult.rows
    };
}

export async function createInvoice(encounterIdValue, data) {
    const encounterId = validateIntegerId(
        encounterIdValue,
        "encounterId"
    );

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        const error = new Error("Request body must be an object");
        error.statusCode = 400;
        throw error;
    }

    if (Object.prototype.hasOwnProperty.call(data, "totalAmount")) {
        const error = new Error(
            "totalAmount is calculated by the server and must not be provided"
        );
        error.statusCode = 400;
        throw error;
    }

    if (!Object.prototype.hasOwnProperty.call(data, "items")) {
        const error = new Error("items is required");
        error.statusCode = 400;
        throw error;
    }

    const items = validateItems(data.items);

    const paymentStatus = data.paymentStatus ?? "PENDING";
    validatePaymentStatus(paymentStatus);

    const totalAmount = calculateTotal(items);

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await ensureEncounterExists(client, encounterId);

        const existingInvoice = await client.query(
            `
            SELECT "id"
            FROM "invoice"
            WHERE "encounterId" = $1
            `,
            [encounterId]
        );

        if (existingInvoice.rowCount > 0) {
            const error = new Error(
                "Invoice already exists for this encounter"
            );
            error.statusCode = 409;
            throw error;
        }

        const invoiceResult = await client.query(
            `
            INSERT INTO "invoice" (
                "encounterId",
                "paymentStatus",
                "totalAmount"
            )
            VALUES ($1, $2, $3)
            RETURNING
                "id",
                "encounterId",
                "paymentStatus",
                "totalAmount",
                "createdAt",
                "updatedAt"
            `,
            [
                encounterId,
                paymentStatus,
                totalAmount
            ]
        );

        const invoice = invoiceResult.rows[0];

        for (const item of items) {
            await client.query(
                `
                INSERT INTO "invoiceItem" (
                    "invoiceId",
                    "description",
                    "amount"
                )
                VALUES ($1, $2, $3)
                `,
                [
                    invoice.id,
                    item.description,
                    item.amount
                ]
            );
        }

        const completeInvoice = await getInvoiceRecord(
            client,
            invoice.id
        );

        await client.query("COMMIT");

        return completeInvoice;
    } catch (error) {
        await client.query("ROLLBACK");

        if (error.code === "23505") {
            error.statusCode = 409;
            error.message =
                "Invoice already exists for this encounter";
        }

        throw error;
    } finally {
        client.release();
    }
}

export async function getInvoiceByEncounter(
    encounterIdValue,
    user
) {
    const encounterId = validateIntegerId(
        encounterIdValue,
        "encounterId"
    );

    const client = await pool.connect();

    try {
        await checkReadAccess(
            client,
            encounterId,
            user
        );

        const result = await client.query(
            `
            SELECT "id"
            FROM "invoice"
            WHERE "encounterId" = $1
            `,
            [encounterId]
        );

        if (result.rowCount === 0) {
            const error = new Error(
                "Invoice not found for this encounter"
            );
            error.statusCode = 404;
            throw error;
        }

        return await getInvoiceRecord(
            client,
            result.rows[0].id
        );
    } finally {
        client.release();
    }
}

export async function updateInvoice(
    encounterIdValue,
    data
) {
    const encounterId = validateIntegerId(
        encounterIdValue,
        "encounterId"
    );

    if (!data || typeof data !== "object" || Array.isArray(data)) {
        const error = new Error("Request body must be an object");
        error.statusCode = 400;
        throw error;
    }

    if (Object.prototype.hasOwnProperty.call(data, "totalAmount")) {
        const error = new Error(
            "totalAmount is calculated by the server and cannot be updated directly"
        );
        error.statusCode = 400;
        throw error;
    }

    const hasItems = Object.prototype.hasOwnProperty.call(
        data,
        "items"
    );

    const hasPaymentStatus =
        Object.prototype.hasOwnProperty.call(
            data,
            "paymentStatus"
        );

    if (!hasItems && !hasPaymentStatus) {
        const error = new Error(
            "Provide items or paymentStatus to update the invoice"
        );
        error.statusCode = 400;
        throw error;
    }

    let items;

    if (hasItems) {
        items = validateItems(data.items);
    }

    if (
        hasPaymentStatus &&
        typeof data.paymentStatus !== "string"
    ) {
        const error = new Error(
            "paymentStatus must be a string"
        );
        error.statusCode = 400;
        throw error;
    }

    if (hasPaymentStatus) {
        validatePaymentStatus(data.paymentStatus);
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const existingInvoiceResult = await client.query(
            `
            SELECT
                "id",
                "paymentStatus",
                "totalAmount"
            FROM "invoice"
            WHERE "encounterId" = $1
            FOR UPDATE
            `,
            [encounterId]
        );

        if (existingInvoiceResult.rowCount === 0) {
            const encounter = await getEncounterWithOwnership(
                client,
                encounterId
            );

            if (!encounter) {
                const error = new Error("Encounter not found");
                error.statusCode = 404;
                throw error;
            }

            const error = new Error(
                "Invoice not found for this encounter"
            );
            error.statusCode = 404;
            throw error;
        }

        const existingInvoice =
            existingInvoiceResult.rows[0];

        const currentStatus =
            existingInvoice.paymentStatus;

        const nextStatus = hasPaymentStatus
            ? data.paymentStatus
            : currentStatus;

        validatePaymentTransition(
            currentStatus,
            nextStatus
        );

        if (
            hasItems &&
            (currentStatus === "PAID" ||
                currentStatus === "CANCELLED")
        ) {
            const error = new Error(
                `Cannot modify invoice items when paymentStatus is ${currentStatus}`
            );
            error.statusCode = 400;
            throw error;
        }

        const nextTotal = hasItems
            ? calculateTotal(items)
            : Number(existingInvoice.totalAmount);

        const updatedInvoiceResult = await client.query(
            `
            UPDATE "invoice"
            SET
                "paymentStatus" = $1,
                "totalAmount" = $2,
                "updatedAt" = now()
            WHERE "id" = $3
            RETURNING
                "id",
                "encounterId",
                "paymentStatus",
                "totalAmount",
                "createdAt",
                "updatedAt"
            `,
            [
                nextStatus,
                nextTotal,
                existingInvoice.id
            ]
        );

        if (hasItems) {
            await client.query(
                `
                DELETE FROM "invoiceItem"
                WHERE "invoiceId" = $1
                `,
                [existingInvoice.id]
            );

            for (const item of items) {
                await client.query(
                    `
                    INSERT INTO "invoiceItem" (
                        "invoiceId",
                        "description",
                        "amount"
                    )
                    VALUES ($1, $2, $3)
                    `,
                    [
                        existingInvoice.id,
                        item.description,
                        item.amount
                    ]
                );
            }
        }

        const completeInvoice = await getInvoiceRecord(
            client,
            updatedInvoiceResult.rows[0].id
        );

        await client.query("COMMIT");

        return completeInvoice;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}