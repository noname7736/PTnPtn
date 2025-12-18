
export enum SystemStatus {
  ONLINE = 'ONLINE',
  AUTONOMOUS = 'AUTONOMOUS',
  LOCKED = 'LOCKED',
  ANALYZING = 'ANALYZING',
  EXECUTING = 'EXECUTING',
  OFFLINE_SYNC = 'OFFLINE_SYNC',
  DOWNTIME_CATCHUP = 'DOWNTIME_CATCHUP'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SOVEREIGN';
  message: string;
}

export interface SystemMetrics {
  uptime: number;
  lastActive: number;
  precisionRate: number;
  bitrate: string;
  frameRate: number;
  activeLinks: number;
  totalDataProcessed: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export interface CalibrationTelemetry {
  targetMood: 'AGITATED' | 'CALM' | 'EMPOWERED' | 'RESISTANT' | 'SUBMISSIVE';
  lockStrength: number;
  socialAnchorStatus: 'OPEN' | 'ANCHORING' | 'LOCKED' | 'ABSOLUTE';
}

export type EventType = 
  | 'IDENTITY_LOCK_ENGAGED'
  | 'SOCIAL_ANCHOR_VERIFIED'
  | 'AUTONOMOUS_HEARTBEAT'
  | 'LOGIC_CORE_OPTIMIZED'
  | 'TARGET_BEHAVIOR_SYNC'
  | 'NETWORK_OMNISCIENCE_ACTIVE';

export interface SystemEvent {
  eventType: EventType;
  details: string;
  timestamp: string;
}
