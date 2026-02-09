import type { TaskStatus } from '../../generated/prisma/client.js'

export type TaskAction =
  | 'validate'
  | 'start'
  | 'complete'
  | 'report_incident'
  | 'resolve_resume'
  | 'resolve_complete'
  | 'accept_fusion'
  | 'reject_fusion'
  | 'cancel'

interface Transition {
  action: TaskAction
  to: TaskStatus
}

const TRANSITIONS: Record<TaskStatus, Transition[]> = {
  PENDING_VALIDATION: [
    { action: 'validate', to: 'TODO' },
    { action: 'cancel', to: 'CANCELLED' },
  ],
  TODO: [
    { action: 'start', to: 'IN_PROGRESS' },
    { action: 'cancel', to: 'CANCELLED' },
  ],
  IN_PROGRESS: [
    { action: 'complete', to: 'COMPLETED' },
    { action: 'report_incident', to: 'INCIDENT' },
  ],
  COMPLETED: [],
  INCIDENT: [
    { action: 'resolve_resume', to: 'IN_PROGRESS' },
    { action: 'resolve_complete', to: 'COMPLETED' },
  ],
  FUSION_SUGGESTED: [
    { action: 'accept_fusion', to: 'CANCELLED' },
    { action: 'reject_fusion', to: 'PENDING_VALIDATION' },
  ],
  CANCELLED: [],
}

export function getNextStatus(currentStatus: TaskStatus, action: TaskAction): TaskStatus | null {
  const transitions = TRANSITIONS[currentStatus]
  const match = transitions.find((t) => t.action === action)
  return match?.to ?? null
}

export function getAllowedActions(currentStatus: TaskStatus): TaskAction[] {
  return TRANSITIONS[currentStatus].map((t) => t.action)
}

export function isTerminalState(status: TaskStatus): boolean {
  return TRANSITIONS[status].length === 0
}
