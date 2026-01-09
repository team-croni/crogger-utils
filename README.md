# Crogger Utils

`Crogger Utils`는 [Axiom](https://axiom.co/) 플랫폼을 위한 로깅 유틸리티입니다. Axiom JavaScript SDK를 기반으로 하며, 개발자가 더 구조화되고 효율적인 로깅 시스템을 구축할 수 있도록 비동기 훅, 에러 파싱, 싱글톤 패턴 등의 편의 기능을 제공합니다.

이 라이브러리는 [Croni](https://github.com/team-croni)에서 개발되었으며, Axiom 로거 대시보드 서비스인 [Crogger](https://github.com/team-croni/crogger)에 최적화된 로깅 유틸 라이브러리입니다.

## 📦 설치 방법

```bash
npm install crogger-utils

```

## ✨ 주요 특징

- **계층화된 로그 레벨**: `trace`, `debug`, `info`, `success`, `warn`, `error`, `fatal` 지원
- **스마트 에러 파싱**: `Error` 객체를 직접 전달하면 Stack Trace와 에러 메시지를 자동으로 추출하여 기록합니다.
- **비동기 Hook 지원**: 로그 전송 전 데이터를 가공하거나 필터링할 수 있는 비동기(`Promise`) `beforeSend`를 지원합니다.
- **구조화된 필드**: 타임스탬프, 카테고리, HTTP 메서드 등 표준 필드를 지원하며 커스텀 필드를 자유롭게 추가할 수 있습니다.
- **싱글톤 패턴**: 애플리케이션 어디서든 하나의 설정으로 로거 인스턴스를 공유하여 사용할 수 있습니다.
- **일괄 로깅(Bulk Logging)**: 여러 로그를 한 번의 요청으로 전송하여 네트워크 오버헤드를 줄입니다.

## 🚀 사용법

### 1. 기본 설정 (싱글톤 초기화)

애플리케이션의 엔트리 포인트(예: `index.ts`, `main.ts`)에서 로거를 초기화합니다.

```typescript
import { initializeLogger } from "crogger-utils";

initializeLogger({
  token: "your-axiom-token",
  dataset: "your-dataset-name",
  defaultFields: {
    service: "auth-api",
    env: "production",
  },
});
```

### 2. 로그 기록하기

초기화된 로거는 `getLogger()`를 통해 어디서든 가져와 사용할 수 있습니다.

```typescript
import { getLogger } from "crogger-utils";

const logger = getLogger();

// 기본적인 정보 로그
await logger.info("사용자가 로그인했습니다.", { userId: "user_123" });

// 에러 로그 (에러 객체 자동 처리)
try {
  throw new Error("데이터베이스 연결 실패");
} catch (e) {
  // 스택 트레이스, 메시지, 에러 이름이 자동으로 파싱되어 Axiom에 기록됩니다.
  await logger.error(e, { category: "DATABASE" });
}
```

### 3. 비동기 훅 활용 (고급)

로그를 전송하기 직전에 세션 정보를 추가하거나 특정 로그를 필터링할 수 있습니다.

```typescript
import { initializeLogger } from "crogger-utils";

const logger = initializeLogger({
  token: "your-axiom-token",
  dataset: "your-dataset-name",
  beforeSend: async (log) => {
    // 예: 비동기로 현재 유저 정보를 조회하여 로그에 결합
    const user = await fetchUserSession();
    log.userEmail = user.email;

    // 배포 환경에서 특정 로그 레벨은 전송하지 않도록 설정
    if (log.level === "trace" && process.env.NODE_ENV === "production") {
      return null; // null 반환 시 전송이 취소됩니다.
    }

    return log;
  },
});
```

### 4. 일괄 로깅 (Bulk Logging)

여러 개의 로그를 배열로 묶어 한 번에 전송합니다.

```typescript
const logs = [
  { level: "info", message: "배치 작업 시작" },
  { level: "debug", message: "중간 데이터 가공 완료" },
  { level: "success", message: "배치 작업 종료" },
];

await logger.bulkLog(logs);
```

## 📋 API 명세

### LogFields Interface

모든 로깅 메서드에서 사용할 수 있는 공통 데이터 구조입니다.

| 필드        | 타입          | 설명                                                        |
| ----------- | ------------- | ----------------------------------------------------------- |
| `level`     | `LogLevel`    | 로그 레벨 (trace, debug, info, success, warn, error, fatal) |
| `message`   | `string`      | 로그 메시지                                                 |
| `timestamp` | `Date`        | 로그 발생 시각 (기본값: 현재 시간)                          |
| `category`  | `LogCategory` | 로그 카테고리 (APP, SERVER, DATABASE, SOCKET 등)            |
| `userId`    | `string`      | 사용자 고유 식별자                                          |
| `requestId` | `string`      | 요청 추적 고유 식별자                                       |
| `duration`  | `number`      | 작업 소요 시간 (ms)                                         |
| `...custom` | `any`         | 추가적인 모든 커스텀 필드 지원                              |

### Exported Functions

- `initializeLogger(config)`: 전역 로거 인스턴스를 초기화합니다.
- `getLogger()`: 초기화된 로거 인스턴스를 반환합니다.
- `sendLog(token, dataset, fields)`: 인스턴스 없이 1회성 로그를 전송합니다.

## 📄 라이선스

이 프로젝트는 **MIT** 라이선스 하에 배포됩니다.
