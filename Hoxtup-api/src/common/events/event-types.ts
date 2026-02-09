export interface ReservationEvent {
  reservationId: string
  propertyId: string
  organizationId: string
  guestName: string
  checkIn: Date
  checkOut: Date
}

export interface ReservationUpdateEvent extends ReservationEvent {
  oldCheckIn: Date
  oldCheckOut: Date
  source: 'ical_sync' | 'manual'
}

export interface ReservationCancelEvent extends ReservationEvent {
  source: 'ical_sync' | 'manual'
}

export interface TaskConflictEvent {
  taskId: string
  reservationId: string
  organizationId: string
  conflictingTaskIds: string[]
}

export interface TaskStateChangedEvent {
  taskId: string
  organizationId: string
  previousStatus: string
  newStatus: string
  action: string
  actorId: string
  timestamp: Date
}

export interface TaskIncidentReportedEvent {
  taskId: string
  organizationId: string
  propertyId: string
  actorId: string
  timestamp: Date
}

export interface SyncFailureEvent {
  sourceId: string
  propertyId: string
  organizationId: string
  sourceName: string
  errorMessage: string
  failingSince: Date
}

export const EVENT = {
  RESERVATION_CREATED: 'reservation.created',
  RESERVATION_UPDATED: 'reservation.updated',
  RESERVATION_CANCELLED: 'reservation.cancelled',
  SYNC_FAILURE_ALERT: 'sync.failure_alert',
  TASK_CONFLICT_DETECTED: 'task.conflict_detected',
  TASK_CREATED: 'task.created',
  TASK_ASSIGNED: 'task.assigned',
  TASK_STATE_CHANGED: 'task.state_changed',
  TASK_INCIDENT_REPORTED: 'task.incident_reported',
  TASK_OVERDUE: 'task.overdue',
  STOCK_ALERT: 'stock.alert',
} as const
