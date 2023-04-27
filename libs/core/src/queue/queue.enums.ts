export enum EQueueStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED',
  DELAYED = 'DELAYED',
}
export enum EQueueStatusLabel {
  PENDING = 'Pending',
  IN_PROGRESS = 'In progress',
  FAILED = 'Failed',
  DELAYED = 'Delayed',
}

// DO NOT rename these enum values, because they are needed for database sorting
export enum EQueuePriority {
  LOWEST = '1_lowest',
  LOWER = '2_lower',
  LOW = '3_low',
  NORMAL = '5_normal',
  HIGH = '7_high',
  HIGHER = '8_higher',
  HIGHEST = '9_highest',
}
