# 🦖 EcoVision: Dino Revival

**EcoVision: Dino Revival** 통합 플랫폼의 공식 개발 저장소입니다.  
본 프로젝트는 **에너지 데이터 시각화**와 **실시간 탄소 시계 연계형 공룡 육성 게이미피케이션**이 결합된 친환경 웹 애플리케이션입니다.

---

## 📁 디렉토리 구조 (Directory Layout)

```
dino-ecovision/
├── backend/            # Java 17 / Spring Boot 3.4.x 백엔드
│   └── src/main/resources/db/migration/ # Flyway DB 형상 관리 스크립트 (V1, V2)
├── frontend/           # React + TypeScript + Vite 프론트엔드
└── README.md           # 본 문서
```

---

## 🛠️ 기술 스택 (Tech Stack)

### 백엔드 (Backend)
* Java 17
* Spring Boot 3.4.x
* Spring Security & JWT (accessToken)
* Spring Data JPA
* **Flyway** (데이터베이스 형상 및 마이그레이션 버전 관리)
* **ShedLock (JdbcTemplate)** (다중 인스턴스 환경 분산 스케줄링 락 보장)
* **Resilience4j Circuit Breaker** (한전/환경공단 외부 API 장애 전파 차단 및 내결함성 확보)
* MySQL Driver (Connector/J)

### 프론트엔드 (Frontend)
* React 18+ (Vite)
* TypeScript
* Zustand (전역 상태 관리)
* Recharts (에너지/탄소 시각화 차트)
* Vanilla CSS & Tailwind CSS (UI 컴포넌트 스타일링)
* Axios

### 데이터베이스 (Database)
* MySQL 8.0 (InnoDB, utf8mb4)

---

## 🚀 아키텍처 및 커뮤니티 통합 개선 사항 (Key Enhancements)

1. **Flyway 기반 DB 자동 마이그레이션 및 Validation 도입**
   * 수동 스크립트 실행 없이 데이터베이스 생성만 해 두면, 애플리케이션 시작 시 `V1__init.sql` (스키마+기초 데이터)과 `V2__create_shedlock_table.sql` 마이그레이션이 자동 수행됩니다.
   * `spring.jpa.hibernate.ddl-auto=validate` 모드로 설정하여 JPA 엔티티와 실제 스키마 간의 정합성을 엄격하게 검증합니다.
2. **ShedLock 분산 락**
   * 다중 백엔드 인스턴스 환경에서도 랭킹 갱신 및 외부 API 동기화 배치 스케줄 작업이 중복 실행되지 않도록 분산 락을 걸었습니다.
3. **Resilience4j 서킷 브레이커 & Fallback Seeding**
   * KEPCO/KECO 외부 연동 API 장애 및 `dummy-key` 상태에서도 시스템 마비를 방지하기 위한 서킷 브레이커를 설계했습니다.
   * API 통신 지연/실패 시 Fallback 메서드가 발령되어, 해당 지역 및 연도에 맞는 12개월의 시뮬레이션 데이터를 해시 시드 난수로 생성해 DB에 즉각 보강(Seeding)합니다.
4. **실시간 대시보드 자동 Seeding 및 Mock 탈피**
   * 사용자가 온보딩 시 어떤 임의 지역 코드를 사용하더라도, 대시보드 조회 시 DB에 통계가 없으면 백엔드가 실시간 자동 시뮬레이션 데이터를 DB에 적재하여 화면이 누락 없이 보이도록 조치했습니다.
   * 프론트엔드에서 API 통신 실패 시 가짜 데이터를 채워 넣던 `localStorage` Mock logic을 전면 걷어내고 100% 실제 데이터 기반 통신 및 에러 처리를 지원합니다.
5. **마이페이지 포인트 타임라인 및 프로필 개인정보 수정 모달**
   * 포인트 획득 타임라인 날짜 깨짐 버그(Spring Boot 3 직렬화 배열 규격 파싱)를 완벽히 해결하고 영문 사유 Enum 명칭을 가독성 높은 이모지와 한글 설명으로 번역 출력합니다.
   * 요약 카드 우측에 `⚙️ 수정` 버튼을 도입하여 사용자가 아바타 공룡 이모지 6종(`🦖`, `🦕`, `🐢`, `🐊`, `🐍`, `🦎`), 닉네임 유효성 변경, 거주지역(동네 리스트 API 연동) 변경을 즉각 수행하고 DB에 연동할 수 있도록 모달 UI를 제공합니다.

---

## 🚀 로컬 실행 방법 (Local Run Guide)

### 1. 데이터베이스 생성 (Database Setup)
로컬 MySQL 서버에 접속하여 빈 데이터베이스 `dino_ecovision`을 생성합니다. (Flyway가 기동되면서 테이블과 시드 데이터를 자동 생성합니다.)
```sql
CREATE DATABASE dino_ecovision DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 백엔드 실행 (Backend Boot)
`backend/src/main/resources/application.properties`에 본인의 로컬 MySQL 접속 정보(username, password)를 올바르게 작성한 뒤 백엔드를 실행합니다.
```bash
cd backend
./gradlew bootRun
```

### 3. 프론트엔드 실행 (Frontend Start)
```bash
cd frontend
npm install
npm run dev
```
접속 주소: `http://localhost:5173` (기본 Vite 포트)
