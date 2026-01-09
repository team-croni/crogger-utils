import { AxiomLogger } from './logger';
import { AxiomLoggerConfig } from './types';

// --- 전역 인스턴스 관리 (싱글톤) ---

let globalLogger: AxiomLogger | null = null;

export const initializeLogger = (config: AxiomLoggerConfig): AxiomLogger => {
  globalLogger = new AxiomLogger(config);
  return globalLogger;
};

export const getLogger = (): AxiomLogger => {
  if (!globalLogger) {
    // 앱이 멈추지 않도록 경고 후 더미 반환 또는 에러 유지 (개발자 성향에 따라 선택)
    console.warn('Crogger-utils: Logger not initialized. Please call initializeLogger() first.');
  }
  return globalLogger!;
};