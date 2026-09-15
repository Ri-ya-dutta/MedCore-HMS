#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/c93aa4548fcac3f869475deceee7f119c2dfef413c2263e202d388d05a592ea9/contract';
import endContract from '../../snapshots/c93aa4548fcac3f869475deceee7f119c2dfef413c2263e202d388d05a592ea9/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'appointment',
        columns: [
          col('appointmentAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('doctorId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('patientId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('reason', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('SCHEDULED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'appointment_status_check_2c8db390',
            "\"status\" IN ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'department',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('hospitalId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'doctor',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('departmentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('firstName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lastName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('licenseNumber', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('specialization', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'encounter',
        columns: [
          col('appointmentId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('clinicalNotes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('diagnosis', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('doctorId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('patientId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'hospital',
        columns: [
          col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'invoice',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('encounterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('paymentStatus', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('totalAmount', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'invoice_paymentStatus_check_3188bacb',
            "\"paymentStatus\" IN ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'invoiceItem',
        columns: [
          col('amount', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('invoiceId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'labOrder',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('encounterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('notes', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('ORDERED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('testName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'labOrder_status_check_9aee8e9a',
            "\"status\" IN ('ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'labResult',
        columns: [
          col('completedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('labOrderId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('referenceRange', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('remarks', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('resultValue', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'patient',
        columns: [
          col('address', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('bloodGroup', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('dateOfBirth', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('emergencyContact', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('firstName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('gender', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('lastName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('phone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('userId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'patient_gender_check_30490488',
            "\"gender\" IN ('MALE', 'FEMALE', 'OTHER')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'prescription',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('encounterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('instructions', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'prescriptionItem',
        columns: [
          col('dosage', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('duration', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('frequency', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('instructions', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('medicineName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('prescriptionId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'user_role_check_c73d8ddd',
            "\"role\" IN ('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'vitals',
        columns: [
          col('bloodPressure', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('encounterId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('heartRate', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('recordedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('respiratoryRate', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('spo2', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
          col('temperature', 'float8', { codecRef: { codecId: 'pg/float8@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'doctor',
        constraint: 'doctor_licenseNumber_key',
        columns: ['licenseNumber'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'doctor',
        constraint: 'doctor_userId_key',
        columns: ['userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'encounter',
        constraint: 'encounter_appointmentId_key',
        columns: ['appointmentId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'invoice',
        constraint: 'invoice_encounterId_key',
        columns: ['encounterId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'labResult',
        constraint: 'labResult_labOrderId_key',
        columns: ['labOrderId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'patient',
        constraint: 'patient_userId_key',
        columns: ['userId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'vitals',
        constraint: 'vitals_encounterId_key',
        columns: ['encounterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'appointment',
        index: 'appointment_doctorId_idx_04369053',
        columns: ['doctorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'appointment',
        index: 'appointment_patientId_idx_e5f07e88',
        columns: ['patientId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'department',
        index: 'department_hospitalId_idx_94de2e98',
        columns: ['hospitalId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'doctor',
        index: 'doctor_departmentId_idx_8e261ed8',
        columns: ['departmentId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'encounter',
        index: 'encounter_doctorId_idx_04369053',
        columns: ['doctorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'encounter',
        index: 'encounter_patientId_idx_e5f07e88',
        columns: ['patientId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'invoiceItem',
        index: 'invoiceItem_invoiceId_idx_d5c4f70e',
        columns: ['invoiceId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'labOrder',
        index: 'labOrder_encounterId_idx_088c691b',
        columns: ['encounterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'prescription',
        index: 'prescription_encounterId_idx_088c691b',
        columns: ['encounterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'prescriptionItem',
        index: 'prescriptionItem_prescriptionId_idx_1e72349e',
        columns: ['prescriptionId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'appointment',
        foreignKey: {
          name: 'appointment_patientId_fkey',
          columns: ['patientId'],
          references: { schema: 'public', table: 'patient', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'appointment',
        foreignKey: {
          name: 'appointment_doctorId_fkey',
          columns: ['doctorId'],
          references: { schema: 'public', table: 'doctor', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'department',
        foreignKey: {
          name: 'department_hospitalId_fkey',
          columns: ['hospitalId'],
          references: { schema: 'public', table: 'hospital', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'doctor',
        foreignKey: {
          name: 'doctor_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'doctor',
        foreignKey: {
          name: 'doctor_departmentId_fkey',
          columns: ['departmentId'],
          references: { schema: 'public', table: 'department', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'encounter',
        foreignKey: {
          name: 'encounter_appointmentId_fkey',
          columns: ['appointmentId'],
          references: { schema: 'public', table: 'appointment', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'encounter',
        foreignKey: {
          name: 'encounter_patientId_fkey',
          columns: ['patientId'],
          references: { schema: 'public', table: 'patient', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'encounter',
        foreignKey: {
          name: 'encounter_doctorId_fkey',
          columns: ['doctorId'],
          references: { schema: 'public', table: 'doctor', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'invoice',
        foreignKey: {
          name: 'invoice_encounterId_fkey',
          columns: ['encounterId'],
          references: { schema: 'public', table: 'encounter', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'invoiceItem',
        foreignKey: {
          name: 'invoiceItem_invoiceId_fkey',
          columns: ['invoiceId'],
          references: { schema: 'public', table: 'invoice', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'labOrder',
        foreignKey: {
          name: 'labOrder_encounterId_fkey',
          columns: ['encounterId'],
          references: { schema: 'public', table: 'encounter', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'labResult',
        foreignKey: {
          name: 'labResult_labOrderId_fkey',
          columns: ['labOrderId'],
          references: { schema: 'public', table: 'labOrder', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'patient',
        foreignKey: {
          name: 'patient_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'prescription',
        foreignKey: {
          name: 'prescription_encounterId_fkey',
          columns: ['encounterId'],
          references: { schema: 'public', table: 'encounter', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'prescriptionItem',
        foreignKey: {
          name: 'prescriptionItem_prescriptionId_fkey',
          columns: ['prescriptionId'],
          references: { schema: 'public', table: 'prescription', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'vitals',
        foreignKey: {
          name: 'vitals_encounterId_fkey',
          columns: ['encounterId'],
          references: { schema: 'public', table: 'encounter', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
