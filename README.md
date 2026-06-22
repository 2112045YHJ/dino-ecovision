# 🦖 EcoVision: Dino Revival

**EcoVision: Dino Revival** 통합 플랫폼의 공식 개발 저장소입니다.  
본 플랫폼은 **지자체별 에너지 데이터 시각화**와 **실시간 탄소 시계 연계형 공룡 육성 게이미피케이션**이 결합된 친환경 웹 애플리케이션입니다.

---

## 📁 디렉토리 구조 (Directory Layout)

```text
dino-ecovision/
├── backend/            # Java 17 / Spring Boot 3.5.x 백엔드 API 서버
├── frontend/           # React + TypeScript + Vite 프론트엔드 웹 앱
├── database/           # MySQL 8.0 DDL & DML 초기화 데이터
│   ├── schema.sql      # 데이터베이스 스키마 초기 적재 SQL
│   └── data.sql        # 미션 마스터 및 공룡 템플릿 마스터 데이터
├── docker-compose.yml  # MySQL & Redis 컨테이너 통합 오케스트레이션
└── README.md           # 본 문서
```

---

## 🛠️ 기술 스택 (Tech Stack)

### 백엔드 (Backend)
* **Language & Framework**: Java 17 / Spring Boot 3.5.x
* **Security & Auth**: Spring Security & JWT (Refresh Token 기반)
* **Data Access**: Spring Data JPA / QueryDSL (다차원 동적 조회 최적화)
* **Database Migration**: Flyway (데이터베이스 형상 관리 버전 통제)
* **Scheduling & Fault Tolerance**: ShedLock (분산형 스케줄링 락) / Resilience4j (서킷 브레이커 & Fallback)
* **XSS Prevention**: Jsoup (HTML 새니타이즈 필터링)

### 프론트엔드 (Frontend)
* **Language & Library**: React 18+ (Vite) / TypeScript
* **State Management**: Zustand (전역 상태 관리)
* **Data Visualization**: Recharts (동적 그래프 시각화 및 커스텀 애니메이션)
* **Aesthetics & UI**: Vanilla CSS / Sage & Cream 오가닉 컬러 시스템
* **Image Processing**: React-easy-crop (프로필 크롭 슬라이더 UI)

### 인프라 & 데이터베이스 (Infrastructure & DB)
* **DB & Cache**: MySQL 8.0 (InnoDB) / Redis (세션 및 락 관리)
* **Containerization**: Docker / Docker Compose

---

## 🌿 커뮤니티 및 플랫폼 고도화 내역

### 1. 백엔드 아키텍처 고도화
* **Flyway 데이터베이스 형상 관리 도입**
  * 데이터베이스의 DDL/DML 버전을 형상화하여 체계적으로 통제합니다 (`V1__init.sql`부터 `V6` 단계까지 순차 적용).
  * Hibernate 자동 DDL 생성을 검증 모드(`ddl-auto=validate`)로 전환하여 런타임 안정성을 확보했습니다.
* **ShedLock 분산 스케줄링 락 구축**
  * 다중 백엔드 인스턴스 환경에서 KEPCO(전기) / KECO(지자체) API 데이터 수집 배치가 중복 작동하지 않도록 분산 DB 락을 적용했습니다.
* **Resilience4j 서킷 브레이커 및 로컬 Fallback 적재**
  * 외부 공공 데이터 API 장애 발생 시 동기식 장애가 전파되는 것을 차단하고, 지자체/연도별 해시코드 기반 결정론적 시뮬레이션 데이터를 실시간 Seeding하도록 예외 대응 체계를 구축했습니다.
* **QueryDSL 다차원 검색 쿼리 연동**
  * 카테고리, 제목, 내용, 작성자 등의 동적 조건 필터 및 공백 제외 2글자 이상 검색 유효성 체크를 효율적으로 통합 수행하는 동적 QueryDSL 레이어를 도입했습니다.
* **Jsoup XSS 원천 방어 및 이미지 리소스 수명 주기 매핑**
  * HTML 허용 화이트리스트(`Safelist.relaxed()`)를 미세 튜닝하여 악성 스크립트 실행을 방지합니다.
  * 게시글 작성 중 업로드되었으나 최종 등록되지 않은 가비지 이미지 리소스를 매핑하여 매일 새벽 정기 배치 작업으로 삭제하는 리소스 최적화 스케줄러를 적용했습니다.
* **일일 포인트 획득 상한 제한 필터**
  * 어뷰징 차단을 위해 사용자의 일일 최대 획득 포인트를 350점으로 제한하는 실시간 필터 및 예외 사유 누적 기록 기능을 구축했습니다.

### 2. 프론트엔드 UI/UX 고도화
* **다중 차트 비교 및 스냅샷 보관함 추가**
  * 최대 5개 지자체의 전력 사용량 및 탄소 배출량을 하나의 그래프에서 시각화 비교하는 다중 차트 비교 기능을 대시보드에 구현했습니다.
  * 대시보드에서 비교/분석된 차트 상태를 내 보관함에 영구 보관할 수 있는 **"💾 차트 저장"** API 연동 및 삭제(`Delete`) 단추를 추가했습니다.
* **contenteditable 기반의 리치 WYSIWYG 에디터 구축**
  * Bold, Italic, Underline, Strikethrough 서식 및 Aa(글자 크기), 💧(글자 색상), 🖍️(형광펜) 기능 적용.
  * 로컬 이미지 드래그앤드롭 및 클립보드 붙여넣기 시 백엔드 즉시 자동 업로드 연동.
  * 이미지 마우스 드래그 리사이징 오버레이 핸들러 구현 및 테이블(표) 열 너비 마우스 드래그 리사이즈 기능 지원.
  * 2층 Sub Toolbar(단락 정렬, 리스트 작성, 가로 구분선, 인용구 블록)를 추가하여 오가닉한 워드 에디팅 경험을 제공합니다.
* **한 게시글 내 다중 차트 인라인 미리보기 (React Portal)**
  * 게시글 본문 내에 여러 개의 대시보드 공유 링크(`/embed/{uuid}`)를 삽입할 수 있도록 개선했습니다.
  * 에디터 하단의 분리된 미리보기 방식을 폐지하고, 에디터 작성 칸 내부에 링크 바로 위쪽으로 차트 위젯이 실시간으로 렌더링되도록 구현했습니다.
  * 직접 타이핑 시 커서 이탈을 방지하기 위해 임시 마커(`span#editor-cursor-marker`)를 활용해 Range 포커스를 복구하는 메커니즘을 적용했습니다.
  * 백엔드 Jsoup 보안 검사 과정에서 `data-uuid` 등의 속성이 삭제되어 저장되더라도 내부 텍스트 링크에서 UUID를 역추출해 내는 **자가 치유(Self-Healing)** 파서를 프론트/백에 동시 탑재해 100% 렌더링 호환성을 보장합니다.
  * 추천이나 댓글 입력 시 `dangerouslySetInnerHTML`의 DOM이 재구축되어 포탈 마운트가 소실(Detachment)되지 않도록 `React.useMemo` 기반의 렌더링 격리 최적화를 마쳤습니다.
* **마이페이지 아바타 편집 자르기(Crop)**
  * 프로필 이미지 설정 시 슬라이더 조절식 Crop 컴포넌트를 탑재하여 이모지와 일반 이미지 크롭 업로드를 모두 지원합니다.
* **내추럴 Sage & Cream 오가닉 디자인 테마 전면 교체**
  * 웜 화이트(`#FAF9F5`)와 세이지 그린(`#5F8C74`), 크림 아이보리 컬러 시스템을 일관되게 입혀 친환경 보태니컬 무드를 연출했습니다.
  * Recharts 차트 첫 진입 시 막대 그래프가 0%에서 부드럽게 솟구쳐 오르는 Staggered Grow-up 모션 연출 및 애니메이션을 전면 교체했습니다.

---

## 🚀 실행 방법 (Deployment & Run Guide)

### 1. Docker 기반 데이터베이스 & 캐시 기동
프로젝트 루트 폴더에 정의된 `docker-compose.yml`을 기동하여 MySQL 8.0과 Redis 컨테이너를 구동합니다.
* 실행 전 Docker Desktop 또는 Daemon이 실행 중인지 확인하세요.
```bash
# 프로젝트 루트 디렉토리에서 실행
docker-compose up -d
```
* **자동 데이터 초기화**: 컨테이너가 최초 기동 시 `database/schema.sql`과 `database/data.sql`을 읽어서 초기 테이블 스키마 생성 및 미션 마스터, 공룡 데이터 마스터 적재를 자동으로 끝마칩니다.

### 2. 백엔드 API 서버 실행
Spring Boot 백엔드를 빌드하고 가동합니다.
```bash
cd backend
# Windows Environment (PowerShell)
.\gradlew bootRun

# macOS / Linux / Bash Environment
./gradlew bootRun
```
* **버전 통제**: 서버가 켜질 때 DB 내의 `flyway_schema_history`를 확인하고 미적용된 마이그레이션 sql이 있다면 실행하여 DB 형상을 자동으로 싱크합니다.
* 백엔드 API 포트: `http://localhost:8080`

### 3. 프론트엔드 웹 앱 실행
Vite 기반의 리액트 프론트엔드를 구동합니다.
```bash
cd frontend
# 의존성 패키지 설치 (최초 1회)
npm install

# 로컬 개발 서버 구동
npm run dev
```
* **접속 주소**: 브라우저를 열고 `http://localhost:5173` 으로 접속합니다.
