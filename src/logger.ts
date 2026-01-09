import { Axiom } from '@axiomhq/js';
import { AxiomLoggerConfig, LogFields } from './types';

// --- 메인 클래스 ---
export class AxiomLogger {
  private client: Axiom;
  private dataset: string;
  private ingestOptions?: import('@axiomhq/js').IngestOptions;
  private defaultFields: Record<string, any>;
  private config: AxiomLoggerConfig;

  constructor(config: AxiomLoggerConfig) {
    this.client = new Axiom({ token: config.token });
    this.dataset = config.dataset;
    this.ingestOptions = config.ingestOptions;
    this.defaultFields = config.defaultFields || {};
    this.config = config;
  }

  /**
   * 내부 공통 로그 전송 로직
   */
  async log(fields: LogFields): Promise<void> {
    try {
      const logEntryWithTimestamp = {
        ...this.defaultFields,
        ...fields,
        timestamp: fields.timestamp || new Date(),
      };

      let finalLogEntry = logEntryWithTimestamp;

      // beforeSend 훅 (비동기 처리 대응)
      if (this.config.beforeSend) {
        const result = await this.config.beforeSend(logEntryWithTimestamp);
        if (!result) return; // null 반환 시 전송 중단
        finalLogEntry = result;
      }

      await this.client.ingest(this.dataset, [finalLogEntry], this.ingestOptions);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  // --- 레벨별 메서드 (에러 객체 자동 처리 포함) ---

  async trace(msg: string, fields?: Record<string, any>) { await this.log({ level: 'trace', message: msg, ...fields }); }
  async debug(msg: string, fields?: Record<string, any>) { await this.log({ level: 'debug', message: msg, ...fields }); }
  async info(msg: string, fields?: Record<string, any>) { await this.log({ level: 'info', message: msg, ...fields }); }
  async success(msg: string, fields?: Record<string, any>) { await this.log({ level: 'success', message: msg, ...fields }); }
  async warn(msg: string, fields?: Record<string, any>) { await this.log({ level: 'warn', message: msg, ...fields }); }

  /**
   * Error 객체를 직접 전달받을 수 있도록 개선된 error 메서드
   */
  async error(messageOrError: string | Error, fields?: Record<string, any>): Promise<void> {
    if (messageOrError instanceof Error) {
      await this.log({
        level: 'error',
        message: messageOrError.message,
        stack: messageOrError.stack,
        errorName: messageOrError.name,
        ...fields,
      });
    } else {
      await this.log({ level: 'error', message: messageOrError, ...fields });
    }
  }

  async fatal(msg: string, fields?: Record<string, any>) { await this.log({ level: 'fatal', message: msg, ...fields }); }

  /**
   * 대량 로그 전송 최적화
   */
  async bulkLog(logs: LogFields[]): Promise<void> {
    try {
      const processedLogs = await Promise.all(
        logs.map(async (log) => {
          const entry = { ...this.defaultFields, ...log, timestamp: log.timestamp || new Date() };
          if (this.config.beforeSend) {
            return await this.config.beforeSend(entry);
          }
          return entry;
        })
      );

      const finalLogs = processedLogs.filter((l): l is (LogFields & { timestamp: Date }) => l !== null);
      if (finalLogs.length === 0) return;

      await this.client.ingest(this.dataset, finalLogs, this.ingestOptions);
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private handleError(error: Error) {
    if (this.config.onError) {
      this.config.onError(error);
    } else {
      console.error('[Crogger-utils] Axiom Log Fail:', error.message);
    }
  }
}