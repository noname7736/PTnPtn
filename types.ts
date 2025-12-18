
export enum SystemStatus {
  ONLINE = 'ONLINE',
  RECOVERING = 'RECOVERING',
  OFFLINE = 'OFFLINE',
  ANALYZING = 'ANALYZING'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
}

export interface SystemMetrics {
  uptime: number;
  precisionRate: number;
  bitrate: string;
  frameRate: number;
  activeLinks: number;
}

export type EventType = 
  | 'ANOMALY_DETECTED' 
  | 'OPTIMIZATION_SUCCESS' 
  | 'MAINTENANCE_ALERT' 
  | 'SYNC_COMPLETE' 
  | 'LOGIC_UPDATE'
  | 'THREAT_NEUTRALIZED'
  | 'KERNEL_UPGRADE'
  | 'RECOVERY_INITIATED';

export interface SystemEvent {
  eventType: EventType;
  details: string;
  timestamp: string;
}
