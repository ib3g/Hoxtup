# Story 3.6: Incident Reporting

## Epic: 3 - Task Management & Team Coordination

As a **staff member**,
I want to quickly report problems I encounter during task execution with minimal friction,
So that my manager is immediately aware and can take action while I continue working.

## Requirements Covered

- FR17: Incident reporting (type dropdown, optional photo, optional text; instant notification to Manager/Admin)

## Acceptance Criteria

**Given** I am a Staff Autonomous member with a task in IN_PROGRESS state
**When** I tap "Report Problem" (always accessible during task execution)
**Then** I see the IncidentReportForm with maximum 3 fields:
- Type (required): dropdown — Équipement / Stock / Propreté / Autre
- Photo (optional): single tap opens camera, thumbnail preview
- Description (optional): textarea with placeholder "Décrivez brièvement..."

**Given** I submit an incident report
**When** I tap "Envoyer" (red `#C45B4A` button)
**Then** the task transitions to `INCIDENT` state
**And** a `task_incident_reported` event is emitted
**And** I see instant feedback: red toast "Rapport envoyé à [Admin Name]"
**And** I can continue to my next task

**Given** the incident includes a photo
**When** I take or select a photo
**Then** the photo is resized client-side (max 1200px, WebP) before upload
**And** uploaded via multipart/form-data to the API
**And** stored on the VPS filesystem with access protected by authentication

**Given** an incident is reported
**When** the Owner/Admin/Manager views the incident
**Then** they see: reporter name, task title, property, incident type, photo (if any), description (if any), timestamp
**And** they have resolution options: "Resolved" (task → COMPLETED), "Create repair task" (new task from incident), "Resume task" (task → IN_PROGRESS)

**Given** an incident is resolved with "Create repair task"
**When** the admin creates the repair task
**Then** a new task is created with type MAINTENANCE, linked to the incident
**And** it enters the task lifecycle at `TODO` state (skips validation since Admin created it)

**Given** the form is used in the field
**When** I interact with it
**Then** all touch targets are minimum 48x48px
**And** the form is usable with wet hands (large buttons, no precise gestures)
**And** the form works offline (queued and synced when connection returns)

**Given** an incident is reported
**When** the reporter's manager views their notification feed
**Then** they see: "Fatima a signalé un problème: [type] sur [Property]" with deep link to the incident

## Technical Notes

- API endpoint: `POST /api/v1/tasks/:id/incident` — body: multipart (type, photo, description)
- Prisma model: `Incident` with `task_id`, `reporter_id`, `type`, `photo_url`, `description`, `status` (open/resolved), `resolution`, `resolved_by_id`, `resolved_at`
- Photo storage: `uploads/incidents/{org_id}/{incident_id}.webp` on VPS
- Photo resize: client-side canvas API, max 1200px longest side, WebP format
- IncidentReportForm: full-screen sheet on mobile, dialog on tablet/desktop
- Offline: incident data queued in IndexedDB, synced via service worker on reconnect
- Events: `task_incident_reported` → notification system (Epic 4)
