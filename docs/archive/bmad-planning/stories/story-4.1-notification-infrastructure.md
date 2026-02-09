# Story 4.1: Notification Infrastructure & Event Pipeline

## Epic: 4 - Notifications & Alerts

As a **platform operator**,
I want a reliable event-driven notification pipeline that processes events from all modules,
So that notifications are delivered consistently without blocking the main application flow.

## Requirements Covered

- FR42: In-app notifications (partial — infrastructure layer)
- Architecture: EventEmitter → BullMQ notification worker pipeline

## Acceptance Criteria

**Given** any module emits an event (reservation_created, task_assigned, etc.)
**When** the EventEmitter dispatches the event
**Then** the notification worker (BullMQ) picks it up asynchronously
**And** the main request flow is not blocked

**Given** the notification worker receives an event
**When** it processes the event
**Then** it creates a `Notification` record in the database
**And** it determines which users should receive the notification based on event type and user roles

**Given** the notification worker fails to process an event
**When** an error occurs
**Then** BullMQ retries the job with exponential backoff (3 attempts)
**And** failed jobs are logged with full context (event type, payload, error)
**And** after max retries, the job is moved to the dead letter queue

**Given** the notification system
**When** I inspect the data model
**Then** `Notification` has: id, organization_id, user_id (recipient), type, title, body, data (JSON payload), read_at, created_at
**And** notifications are tenant-scoped via RLS

**Given** multiple events are emitted simultaneously
**When** the BullMQ queue processes them
**Then** events are processed in order per queue
**And** the system handles at least 100 notifications per minute

**Given** the notification worker
**When** it processes a `task_assigned` event
**Then** it creates a notification for the assigned staff member
**And** the notification includes: task title, property name, scheduled time, deep link URL

## Technical Notes

- BullMQ queue: `notifications` with concurrency 5
- Worker: `Hoxtup-api/src/workers/notification.worker.ts`
- Event types enum: `RESERVATION_CREATED`, `TASK_ASSIGNED`, `TASK_OVERDUE`, `TASK_COMPLETED`, `INCIDENT_REPORTED`, `STOCK_ALERT`, `ICAL_SYNC_FAILURE`
- Notification model: `Notification` table with indexes on `user_id` + `read_at` for feed queries
- Deep link: `data.url` field containing the target screen path
- Redis-backed BullMQ with message durability
