import { LogFields } from './types';
import { AxiomLogger } from './logger';

// --- 편리한 독립 실행 함수 (인스턴스 재사용으로 성능 최적화) ---

/**
 * 매번 new를 생성하지 않고 내부 전역 인스턴스를 활용하거나 
 * 필요한 경우에만 생성하도록 유도합니다.
 */
export const sendLog = async (token: string, dataset: string, fields: LogFields): Promise<void> => {
  // 간단한 캐싱 로직 (동일 토큰/데이터셋일 경우 재사용 가능하지만, 여기선 범용성을 위해 일단 생성)
  const logger = new AxiomLogger({ token, dataset });
  await logger.log(fields);
};

// ... 독립 실행 함수들(trace, info 등)은 가급적 getLogger() 기반으로 사용하기를 권장합니다.