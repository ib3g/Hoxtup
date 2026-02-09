export const TASK_STATUS_COLORS: Record<string, string> = {
  PENDING_VALIDATION: 'bg-warning/10 text-warning border-warning',
  TODO: 'bg-brand-primary/10 text-brand-primary border-brand-primary',
  IN_PROGRESS: 'bg-cta/10 text-cta border-cta',
  COMPLETED: 'bg-success/10 text-success border-success',
  INCIDENT: 'bg-danger/10 text-danger border-danger',
  FUSION_SUGGESTED: 'bg-info/10 text-info border-info',
  CANCELLED: 'bg-muted text-muted-foreground border-muted',
}

export const TASK_STATUS_CARD_STYLES: Record<string, string> = {
  PENDING_VALIDATION: 'border-l-warning bg-warning/5',
  TODO: 'border-l-brand-primary',
  IN_PROGRESS: 'border-l-cta',
  COMPLETED: 'border-l-success opacity-60',
  INCIDENT: 'border-l-danger bg-danger/5',
  CANCELLED: 'border-l-muted-foreground opacity-40',
}

export const TASK_STATUS_KEY_MAP: Record<string, string> = {
  PENDING_VALIDATION: 'pendingValidation',
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  INCIDENT: 'incident',
  FUSION_SUGGESTED: 'fusionSuggested',
  CANCELLED: 'cancelled',
}

export function taskStatusKey(status: string): string {
  return TASK_STATUS_KEY_MAP[status] ?? status
}

export const TASK_TYPE_KEY_MAP: Record<string, string> = {
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
  INSPECTION: 'inspection',
  CHECK_IN: 'checkIn',
  CHECK_OUT: 'checkOut',
  TURNOVER: 'turnover',
  OTHER: 'other',
}

export function taskTypeKey(type: string): string {
  return TASK_TYPE_KEY_MAP[type] ?? type
}

export const TITLE_OPTIONS = ['cleaningAfterDeparture', 'cleaningBeforeArrival', 'generalCleaning', 'quickCleaning'] as const

export const TITLE_TO_TYPE: Record<string, string> = {
  cleaningAfterDeparture: 'CLEANING',
  cleaningBeforeArrival: 'CLEANING',
  generalCleaning: 'CLEANING',
  quickCleaning: 'CLEANING',
}
