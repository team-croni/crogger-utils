import { Axiom, IngestOptions } from '@axiomhq/js';

// --- 타입 정의 ---
export type LogLevel = 'trace' | 'debug' | 'info' | 'success' | 'warn' | 'error' | 'fatal';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
export type LogCategory = 'APP' | 'SERVER' | 'DATABASE' | 'SOCKET' | 'HEALTH' | 'SCHEDULER' | string;

export interface LogFields {
  level: LogLevel;
  message: string;
  timestamp?: Date;
  category?: LogCategory;
  method?: HttpMethod;
  statusCode?: number;
  host?: string;
  path?: string;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  duration?: number;
  [key: string]: any;
}

export interface AxiomLoggerConfig {
  token: string;
  dataset: string;
  ingestOptions?: IngestOptions;
  defaultFields?: Record<string, any>;
  // 비동기(Promise)를 지원하도록 개선
  beforeSend?: (log: LogFields & { timestamp: Date }) =>
    ((LogFields & { timestamp: Date }) | null) | Promise<(LogFields & { timestamp: Date }) | null>;
  onError?: (error: Error) => void;
}