# 🦖 EcoVision: Dino Revival (커뮤니티 및 마이페이지 통합본)

**EcoVision: Dino Revival** 통합 플랫폼의 공식 개발 저장소(`feature/community-integration` 브랜치)입니다.  
본 프로젝트는 **에너지 데이터 시각화**와 **실시간 탄소 시계 연계형 공룡 육성 게이미피케이션**이 결합된 친환경 웹 애플리케이션입니다.  
본 문서에서는 이번 주에 집중 개발할 **커뮤니티 및 마이페이지** 기능의 구현 완성도와 각 파트별(BE/FE) 후속 작업 로드맵을 기술합니다.

---

## 📁 디렉토리 구조 (Directory Layout)

```
dino-ecovision/
├── backend/            # Java 17 / Spring Boot 3.4.x 백엔드
│   └── src/main/resources/db/migration/ # Flyway DB 형상 관리 DDL (V1, V2)
├── frontend/           # React 18 / TypeScript / Vite 프론트엔드
└── README.md           # 본 가이드 문서
```

---

## 🛠️ 기술 스택 (Tech Stack)

### 백엔드 (Backend)
* **Language/Framework**: Java 17 / Spring Boot 3.4.x
* **Security**: Spring Security & JWT Token Authentication
* **Database/ORM**: Spring Data JPA / MySQL 8.0
* **DB Migration**: **Flyway** (데이터베이스 형상 및 마이그레이션 버전 관리)
* **Distributed Locking**: **ShedLock (JdbcTemplate)** (다중 인스턴스 환경 분산 스케줄링 락 보장)
* **Fault Tolerance**: **Resilience4j Circuit Breaker** (한전/환경공단 외부 API 장애 전파 차단)

### 프론트엔드 (Frontend)
* **Language/Framework**: React 18 / TypeScript / Vite 8.x
* **State Management**: Zustand
* **Visualization**: Recharts & **Chart.js** (에너지 소비량/탄소 배출 시각화 차트)
* **Styling**: Vanilla CSS & Tailwind CSS (보태니컬 Sage & Cream 테마 적용)
* **HTTP Client**: Axios & Fetch API wrapper (`apiRequest.ts`)

---

## 📊 현재 구현된 작업 내용 및 완성도 평가

현재 커뮤니티 통합 브랜치 상에 구현된 주요 피처들의 완성도 진단입니다.

| 도메인 | 구현된 핵심 기능 | 백엔드(BE) 상태 | 프론트엔드(FE) 상태 | 기능 완성도 |
| :--- | :--- | :--- | :--- | :--- |
| **게시판** | 공지/자유 카테고리별 글쓰기, 조회, 삭제, 수정, 본문 내 스냅샷 임베드 연동 | 🟢 완료 (CRUD 완료, Specification 페이징 및 키워드 기반 상세 검색 완비) | 🟡 구현 완료 (상세 글 목록, 페이징 연동 완료. CSS 세부 다듬기 필요) | **85%** |
| **댓글** | 게시글별 댓글 작성, 삭제, 수정 | 🟢 완료 (CRUD 완료, Soft Delete 적용으로 DB 무결성 유지) | 🟡 구현 완료 (상세 보기 하단에 댓글 리스트 및 작성 폼 연동됨) | **90%** |
| **좋아요** | 게시글 추천 및 추천 취소, 포인트 연계 | 🟢 완료 (중복 추천 방지, 추천 시 작성자 +5 / 추천인 -1 차등 지급 완료) | 🟢 완료 (상세 화면 좋아요 토글 버튼 및 누적 추천 수 바인딩) | **95%** |
| **스냅샷** | 대시보드 내 에너지/탄소 배출 차트 메타데이터를 UUID 스냅샷으로 저장 및 불러오기 | 🟢 완료 (ChartSnapshot UUID 기반 생성 및 메타데이터 JSON 저장 구조 확보) | 🟡 구조화 완료 (스냅샷 저장 인터랙션 및 Chart.js 라이브러리 탑재) | **70%** |
| **마이페이지** | 프로필 개인정보 수정(닉네임, 지역, 아바타 변경), 작성글 리스트, 포인트 획득 타임라인 | 🟢 완료 (프로필 패치 API, PointHistory 리스트 조회 API 완비) | 🟢 완료 (내 작성 글 필터링, 포인트 변경 사유별 이모지 포맷팅 매핑) | **90%** |

---

## 🛠️ BE & FE 파트별 향후 태스크 (To-Do List)

팀원들이 기능 고도화를 진행할 때 우선적으로 해결해야 할 마일스톤 항목입니다.

### 🧱 백엔드(BE) 담당자가 해야 할 작업
1. **API 문서 자동화 (Swagger 연동)**
   * `springdoc-openapi-starter-webmvc-ui` 의존성을 구성하여 `/swagger-ui.html`을 통해 프론트엔드와 실시간 API 명세 공유.
2. **로컬 개발용 더미 데이터 스크립트 작성 (`data.sql` 보완)**
   * 게시판 목록 및 마이페이지 포인트 이력 화면 테스트를 위해 최소 30개 이상의 임의 테스트 쿼리 생성 및 적재.
3. **이미지 파일 업로드 인프라 설계**
   * 게시글 및 프로필 이미지 저장을 위한 AWS S3 연동 업로드 API 설계 및 로컬 임시 저장소 예외 처리 구현.

### 🎨 프론트엔드(FE) 담당자가 해야 할 작업
1. **차트 작성 화면에서 스냅샷 저장 연동**
   * 대시보드 화면에 '스냅샷 저장' 버튼을 추가하고, 클릭 시 차트 메타데이터를 백엔드 API `/api/posts/chart-snapshot`으로 전송하여 UUID를 발급받는 흐름 구현.
2. **에러 핸들링 UI/UX 개선 및 공통 토스트(Toast) 알림 컴포넌트 추가**
   * API 호출 실패(401 Unauthorized, 403 Forbidden, 닉네임 중복 등) 시 브라우저 얼럿 대신 직관적인 경고 애니메이션 토스트 제공.
3. **UI/UX 세부 디자인 폴리싱 (Vanilla CSS)**
   * 마이페이지 탭 전환 애니메이션 추가 및 커뮤니티 글쓰기/상세 페이지 내 Sage & Cream(#FAF9F5, #2E7D32) 웜 가든 테마 디자인 일관성 강화.

---

## 🚀 로컬 실행 방법 (Local Run Guide)

### 1. 데이터베이스 생성 (Database Setup)
로컬 MySQL 서버에 접속하여 빈 데이터베이스 `dino_ecovision`을 생성합니다. (Flyway가 기동되면서 테이블과 시드 데이터를 자동 생성합니다.)
```sql
CREATE DATABASE dino_ecovision DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 백엔드 실행 (Backend Boot)
`backend/src/main/resources/application.properties`에 본인의 로컬 MySQL 접속 정보(username, password)를 올바르게 작성한 뒤 백엔드를 빌드 및 실행합니다.
```bash
cd backend
./gradlew compileJava    # 컴파일 정상 여부 확인
./gradlew bootRun        # 서버 구동
```

### 3. 프론트엔드 실행 (Frontend Start)
```bash
cd frontend
npm install              # 라이브러리 설치
npm run build            # 빌드 검증 및 린트 검사
npm run dev              # 개발 서버 실행
```
* 접속 주소: `http://localhost:5173` (기본 Vite 포트)

---

> [!WARNING]
> **브랜치 작업 주의 사항**
> * 공동 개발 중 깃 충돌을 방지하기 위해 파일 수정 전 항상 `git pull origin feature/community-integration`을 실행해 주십시오.
> * 커밋 메시지는 한국어 협업 가이드라인(`태그(도메인): 한글 설명`)을 필두로 명확히 작성하여 커밋해주시기 바랍니다. (예: `feat(community-be): ...` 또는 `feat(community-fe): ...`)
