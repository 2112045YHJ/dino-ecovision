# 🚶‍♂️ 대시보드 롤백, 실시간 에디터 임베드 연동 및 Sage & Cream 테마 적용 보고서

대시보드를 세미 프로젝트의 select 드롭다운 기반 레이아웃으로 롤백하고, 글 작성 시 본문 내의 공유 URL(`/embed/{uuid}`)을 감지해 차트 위젯을 실시간 렌더링하며, 대시보드와 차트의 컬러 시스템을 **Sage & Cream** UI/UX 개발 가이드 스펙에 맞춰 수정한 구현 보고서입니다.

---

## 🛠️ 변경 및 추가 사항

### 1. 대시보드 레이아웃 및 필터 기능 롤백 (세미 프로젝트 사양 동기화)

* **[Dashboard.tsx](file:///C:/final/dino-ecovision/frontend/src/pages/Dashboard.tsx) [MODIFY]**
  * 연도 선택: 드롭다운 형식 (`2020` ~ `2026`년 선택 가능)으로 롤백했습니다.
  * 지역 선택: 드롭다운 형식 (`전국 (모든 지역)`, `서울특별시 중구`, `서울특별시 강남구`, `경기도 수원시`)으로 변경했습니다.
  * `selectedRegion`이 `""`(전국)인 경우, 백엔드 API `/api/data/summary`에 전국 대용 코드 `"1111000000"`을 전달하여 호출하도록 유연하게 설계했습니다.
  * 상단에 '연간 총 전력 사용량' 카드 1개를 렌더링하도록 변경하고, 차트 데이터 중 전기(`energyType === "ELECTRICITY"`)에 해당하는 사용량을 계산해 총합을 출력하도록 구현했습니다.
  * 기존의 다크한 톤(`bg-slate-900` 등)을 전면 제거하고, 웜 화이트 `#FAF9F5` 배경 및 Pure Surface `#FFFFFF` 카드 기반의 화사한 톤으로 리팩토링했습니다.
  * GNB 상단 고정을 위해 `<Header />` 컴포넌트를 마운트하고, 세미 스타일의 `← 홈으로 돌아가기` 뒤로 가기 링크를 추가했습니다.

### 2. Sage & Cream 웜 오가닉(Warm Organic) 차트 테마 적용

* **[EnergyChart.tsx](file:///C:/final/dino-ecovision/frontend/src/components/charts/EnergyChart.tsx) [MODIFY]**
  * 다크 네온 느낌의 배경을 제거하고, `bg-white border border-[#E8F2EC] rounded-3xl p-6 shadow-sm` 스타일을 적용해 가시성을 향상시켰습니다.
  * 차트 텍스트 컬러를 `#2C3531`(Soft Charcoal)로 변경하여 눈의 피로를 최소화했습니다.
  * **전력 막대:** Sage Green 계열 (`bg-gradient-to-t from-[#5F8C74] to-[#7EA993]`)
  * **가스 막대:** Terracotta Orange 계열 (`bg-gradient-to-t from-[#E07A5F] to-[#F29F80]`)
  * Y축 눈금 및 X축 텍스트 색상을 부드러운 회색과 차콜 계열로 정돈하여 보태니컬 컨셉과 어우러지게 조정했습니다.
* **[EmbedChart.tsx](file:///C:/final/dino-ecovision/frontend/src/components/charts/EmbedChart.tsx) [MODIFY]**
  * 게시글에 삽입되는 임베드 차트의 막대 호버 색상을 테라코타 오렌지에서 짙은 세이지 그린 (`#4d735f`)으로 조정하여, 범례(탄소 배출량 주황색)와 전기 사용량 막대의 혼동 우려를 불식하고 테마 색감을 통일했습니다.

### 3. 글 작성(에디터) 실시간 임베드 차트 미리보기 연동

* **[CommunityWritePage.tsx](file:///C:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
  * 내용(`content`) 에디터 본문을 매 렌더링 시 감시하여, 텍스트 내에 `/embed/{uuid}` (또는 `mock-snap-{id}`) 패턴이 존재할 경우 정규식으로 해당 UUID를 즉시 추출합니다.
  * 정규식: `/\/embed\/([a-zA-Z0-9-]+)/i`
  * 링크가 감지되면 에디터 텍스트아리아 바로 아래에 **"📊 본문 내 삽입된 대시보드 차트 미리보기"** 영역을 띄우고, `EmbedChart`를 동적 마운트하여 실시간 미리보기 기능을 제공합니다.
  * 본문의 스냅샷 링크 추가 방식과 시너지를 낼 수 있도록 완벽히 연동했습니다.
* **[CommunityDetailPage.tsx](file:///C:/final/dino-ecovision/frontend/src/pages/CommunityDetailPage.tsx) [MODIFY]**
  * 상세 페이지 본문에서 스냅샷 UUID를 파싱하는 정규식을 `[a-zA-Z0-9-]+` 범용 문자열 탐색으로 변경하여, 모든 ID 형식 체계(UUID 및 Mock ID)에서 완벽히 임베드 차트를 렌더링하도록 보장합니다.

---

## 🌿 조원 신규 작업 브랜치 병합 및 정합성 검증 완료

로컬 작업 브랜치(`feature/community-integration`) 상에 조원들의 최신 기능 및 버그 수정 사항이 포함된 원격 브랜치들을 안전하게 병합하고 충돌을 수동 해결했습니다.

### 1. 병합된 원격 브랜치 목록
1. **`origin/main` (공통 메인 브랜치):**
   * 온보딩, 공룡 실물 API, 포인트/댓글 조회 로직 등 전체 통합본 병합.
   * **발생한 충돌 수동 해결 (7개 파일):**
     * `RegionController.java`, `RegionDto.java`, `RegionService.java`: `ApiResponse` 포맷 통일 및 `regionId` 필드 통합
     * `UserController.java`, `UserService.java`: 마이페이지 탭 기능 및 포인트/댓글 조회 로직 유지하며 신규 API들과 병합
     * `App.tsx`: 와일드카드 라우트 정합성 유지하며 라우트 리스트 통합
     * `HomePage.tsx`: Sage & Cream 테마 레이아웃 및 로그아웃 버튼을 적용하면서 실제 `myDino` 랜더링 로직 통합
2. **`origin/feature/missions-api` (미션 API 브랜치):**
   * 미션 트랜잭션, 미션 스케줄러 및 온보딩/사용자 도메인 추가 사항 병합.
   * **충돌 없이 자동 병합 완료.**
3. **`origin/bugfix/onboarding-409-error` (온보딩 오류 수정 브랜치):**
   * 온보딩 진행 중 중단 시 발생하는 409 에러 수정 사항 병합.
   * **`UserRepository.java` 충돌 수동 해결:** `existsByNickname`과 `existsByNicknameAndIdNot` 메서드가 둘 다 포함될 수 있도록 정리.
4. **`origin/feature/core-home-mission-dino-quiz-ui` (홈/미션/공룡/퀴즈 UI 브랜치):**
   * 온보딩 공룡 선택 단계의 완료 흐름 수정 사항 병합.
   * **충돌 없이 자동 병합 완료.**

### 2. 빌드 결과 및 추가 이슈 해결
* **프론트엔드 빌드:** `npm run build` 컴파일(Vite/TypeScript) **정상 통과** (Vite build 완료)
* **백엔드 빌드:** `gradle compileJava` 및 `gradle build -x test` **정상 통과 (BUILD SUCCESSFUL)**
* **Bean 중복 로드 예외 해결 (BeanDefinitionOverrideException):**
  * `gradle bootRun` 기동 시, `missions-api` 브랜치에서 신규 추가된 `mypage` 패키지의 `PointHistoryRepository` 빈 이름이 기존 `user` 패키지의 빈 이름(`pointHistoryRepository`)과 충돌하여 부팅에 실패하는 현상을 확인했습니다.
  * 물리적으로 동일한 `point_history` 테이블에 매핑되어 있는 두 엔티티/레포지토리 중 불필요하게 중복 정의된 `com.ecovision.app.domain.mypage` 패키지 하위의 `PointHistory.java` 및 `PointHistoryRepository.java`를 삭제했습니다.
  * 기존 `com.ecovision.app.domain.user` 패키지 산하의 엔티티와 레포지토리로 일원화하고, `MissionService.java` 내의 참조 및 생성 로직(빌더 패턴 활용)을 업데이트하여 빈 이름 충돌을 영구적으로 해소했습니다.

---

## 🚀 커뮤니티 통합 및 AWS 배포 아키텍처 개선 (Flyway, ShedLock, Resilience4j, 실데이터 연동)

실제 AWS에 배포하고 다중 스케일링 환경에서 서비스를 운영할 때 발생할 수 있는 여러 구조적 리스크를 해소하고, 로컬 및 서버 간의 데이터 일치를 보장하기 위한 아키텍처 개선 작업을 완료했습니다.

### 1. Flyway 데이터베이스 형상 관리 도입
* **[V1__init.sql](file:///C:/final/dino-ecovision/backend/src/main/resources/db/migration/V1__init.sql) 및 [V2__create_shedlock_table.sql](file:///C:/final/dino-ecovision/backend/src/main/resources/db/migration/V2__create_shedlock_table.sql) [NEW]**
  * 로컬 개발 데이터베이스 환경과 프로덕션 환경의 데이터베이스 스키마 및 마스터 데이터를 안전하고 명시적으로 이관하기 위해 Flyway 라이브러리를 구축했습니다.
  * 기존 백엔드 내의 `schema.sql` 및 `data.sql`은 Flyway 표준과 마찰을 피하기 위해 제거/주석처리하고, `V1__init.sql`로 이전 및 통합 완료했습니다.
  * 분산형 스케줄러 락 관리를 위해 `shedlock` 테이블을 정의하는 마이그레이션 DDL `V2__create_shedlock_table.sql`을 추가했습니다.
* **[application.properties](file:///C:/final/dino-ecovision/backend/src/main/resources/application.properties) [MODIFY]**
  * 무분별하게 엔티티 구조를 스키마에 동기화하던 JPA DDL 자동 생성 설정을 `spring.jpa.hibernate.ddl-auto=validate` 모드로 엄격히 잠그고, Flyway 단일 툴로만 DB 마이그레이션을 단행하도록 구성했습니다.
* **JPA Entity / DDL 타입 검증 오류 해결 (Double ➡️ BigDecimal) [MODIFY]**
  * `energy_usages` 테이블의 `carbon_emission_kg` 및 `usage_amount` DDL 컬럼 타입(`DECIMAL`)과 자바 엔티티 필드 타입(`Double`) 간의 Hibernate 스키마 validation 불일치 오류를 발견하고 조치했습니다.
  * **[EnergyUsage.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/entity/EnergyUsage.java)** 엔티티 및 **[EnergyUsageSumDto.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/dto/EnergyUsageSumDto.java)**의 타입 정의를 `BigDecimal`로 변경하고, **[DataCollectionService.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/service/DataCollectionService.java)** 내에서 `BigDecimal.valueOf(...)` 변환을 연동하여, 부트 기동 및 스키마 validate 검사를 에러 없이 통과했습니다.

### 2. ShedLock 분산 락 및 스케줄러 보장
* **[ShedLockConfig.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/global/config/ShedLockConfig.java) [NEW]**
  * 다중 백엔드 인스턴스를 운영하는 AWS 배포 환경에서 랭킹 갱신, KEPCO/KECO 에너지 데이터 수집 등 주기적인 Batch 작업이 중복 실행되는 것을 막기 위한 분산 락 라이브러리 설정을 추가했습니다. `JdbcTemplateLockProvider`를 빈으로 등록했습니다.
* **스케줄러 락 바인딩 [MODIFY]**
  * **[RankingScheduler.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/ranking/scheduler/RankingScheduler.java)** 및 **[EnergyDataBatchJob.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/scheduler/EnergyDataBatchJob.java)**의 주기적 스케줄 메서드에 `@SchedulerLock(name = "...", lockAtLeastFor = "...", lockAtMostFor = "...")` 어노테이션을 부착하여, 클러스터링 모드에서도 단 1회만 배치 작업이 수행되도록 정합성을 보장했습니다.

### 3. Resilience4j 서킷 브레이커 및 실시간 시뮬레이션 Seeding
* **[DataCollectionService.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/service/DataCollectionService.java) [MODIFY]**
  * 한국전력(KEPCO) 및 한국환경공단(KECO) 공공 데이터 API 통신 실패 및 `dummy-key` 지정 시 전체 백엔드 시스템에 동기 장애 전파가 일어나지 않도록 Resilience4j 서킷 브레이커를 설계했습니다.
  * API 에러나 타임아웃 발생 시 호출될 fallback 메서드(`kepcoFallback`, `kecoFallback`)를 작성하고, 해당 지자체 및 연도에 맞는 12개월의 시뮬레이션 전력/가스 데이터를 지역명 해시코드를 활용한 결정론적 난수 생성기로 seeding(적재)하도록 구현했습니다.
* **[DataController.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/controller/DataController.java) [MODIFY]**
  * 대시보드 조회 시 가입 온보딩 단계에서 선택한 지자체 전력 데이터가 DB에 적재되어 있지 않은 경우, 차트가 하얗게 무시되는 UX 에러가 발생했습니다.
  * 백엔드 컨트롤러 레벨에서 조회 실패 감지 시, `DataCollectionService`를 통해 해당 지자체의 2026년도 시뮬레이션 데이터를 즉시 Seeding하여 데이터베이스에 밀어 넣은 후 정상적으로 응답 데이터를 재조회해 반환하도록 동적 적재 흐름을 완성했습니다.

### 4. 프론트엔드 API Mock 코드 차단 및 마이페이지 실데이터 바인딩
* **[communityApi.ts](file:///C:/final/dino-ecovision/frontend/src/api/communityApi.ts) / [dashboardApi.ts](file:///C:/final/dino-ecovision/frontend/src/api/dashboardApi.ts) [MODIFY]**
  * 통신 실패 시 프론트엔드가 강제로 가짜 게시물이나 차트 데이터를 local storage에 저장/로드하며 동작을 속이던 try-catch Mock 땜빵 구문들을 완전 제거했습니다. API 통신 실패 시 투명하게 오류를 상위 단으로 전파하여 사용자가 에러 처리 및 세션 갱신을 진행할 수 있도록 개선했습니다.
  * 컴파일 에러를 야기하는 미사용 로컬 persistence helper 함수들(`getLocalPosts`, `saveLocalPosts`, `getLocalSnapshots`, `saveLocalSnapshots`) 및 관련 Mock 데이터셋 상수를 제거하여 TypeScript 엄격 검증(error TS6133)을 완벽하게 통과했습니다.
* **[MyPage.tsx](file:///C:/final/dino-ecovision/frontend/src/pages/MyPage.tsx) [MODIFY]**
  * 마이페이지 내 프로필 정보(이메일, 포인트, 탄소량 등), 포인트 획득 타임라인, 내가 작성한 게시글 조회 로직에서 localStorage fallback 코드를 일절 삭제했습니다.
  * 모든 데이터를 백엔드 API인 `/api/me`, `/api/me/points`, `fetchPosts` 호출 결과로만 바인딩되도록 편집했습니다.
  * 본인 작성글 조회 시, 기존 Mock ID 기반 필터링(`p.authorId === 101`)을 제거하고 백엔드로부터 가져온 닉네임(`p.authorNickname === profile.nickname`)만을 필터 조건으로 작동하도록 정리하여 데이터 무결성을 보장했습니다.

### 5. 마이페이지 포인트 이력 친절화 및 날짜 렌더링 정상화
* **날짜 배열 파싱 적용:** Spring Boot 3 의 날짜 직렬화 배열 규격을 파싱하는 `formatDateTime` 함수를 구현하여 `1970. 1. 1.`로 렌더링되던 Unix Epoch 버그를 영구 조치했습니다.
* **사유 한글 맵핑 완료:** `COMMENT_WRITE` ➡️ `💬 댓글 작성 보상`, `POST_WRITE` ➡️ `📝 게시글 작성 보상` 등 영문 Enum 형태로 날것으로 보여지던 이력 명칭을 사용자가 직관적으로 확인 가능한 귀여운 아이콘과 한글로 전면 교체했습니다.

### 6. 마이페이지 프로필 개인정보 수정 및 공룡 아바타 선택 모달 개발
* **백엔드 아바타 데이터베이스 동기화:** `UserDto.ProfileResponse` 에 `avatarUrl` 필드를 신설하고 `PATCH /api/me/avatar` Endpoint를 구현하여 사용자가 수정한 공룡 아바타 설정을 DB 상의 `avatar_url` 에 연동 보관할 수 있게 했습니다.
* **프로필 수정 모달 UI 구축:** 마이페이지 헤더의 닉네임 오른쪽에 `⚙️ 수정` 버튼을 배치했습니다. 클릭 시 띄워지는 모달 창을 통해 닉네임 입력 및 규칙 검사, 거주 지역 정보 변경(드롭다운 연동), 그리고 파충류/공룡 이모지 6종(`🦖`, `🦕`, `🐢`, `🐊`, `🐍`, `🦎`) 아바타 커스텀 설정을 동시 조작할 수 있게 만들었습니다.
* **저장 완료 시 동기 변경:** 저장 완료 누르는 즉시 `nickname`, `region`, `avatar` 변경 API를 순차 통신하고 최신 결과를 리렌더링해주며, 쿨다운 오류(`cooldown`)가 감지되면 모달 내에 경고 문구로 친절히 안내하도록 예외 처리를 연계했습니다.

---

## 🧪 최종 빌드 및 검증 결과

* **프론트엔드 빌드 무결성 검증 완료 (`npm run build`):**
  * Vite 및 TypeScript 엄격 검사 빌드(`tsc -b && vite build`)를 무사히 통과하여 `/dist` 정적 리소스 컴파일 번들링 완료.
* **백엔드 빌드 무결성 검증 완료 (`.\gradlew build -x test`):**
  * Flyway 마이그레이션 SQL 구조 검증 및 백엔드 자바 컴파일 테스트 모두 통과. **BUILD SUCCESSFUL** (10초 소요).
* **Git 상태 확인:**
  * 모든 작업 내역이 로컬 기능 브랜치(`feature/community-integration`) 상에 완결성 있게 커밋 완료되었습니다. (`main` 브랜치에 직접 push하지 않고 로컬 기능 구현 마무리)

---

## 🔀 [신규] 커뮤니티 협업 개발을 위한 사전 작업 및 브랜치 분리 (2026-06-15)

팀원들과의 주간 커뮤니티 개발 협업 편의를 위해, 이전의 단일 통합본 커밋 상태에서 탈피하고 각 파트별 작업물이 섞이지 않도록 브랜치 분리 및 사전 계획 설계를 단행했습니다.

### 1. develop 브랜치 복구 (Rollback)
* `develop` 브랜치는 커뮤니티 코드 병합 이전이자 온보딩 회원가입 버그 수정이 완료된 **`1778a3c` 상태로 롤백**하여 깨끗하게 유지했습니다.

### 2. 백엔드 전용 셋업 브랜치 구축 (`feature/community-be-setup`)
* `develop`에서 분기하여 커뮤니티 백엔드 코드(엔티티, 서비스, DDL 마이그레이션, 랭킹 및 지역 데이터 배치)만 분리하여 커밋 완료했습니다.
* 커밋 해시: `385fa8c` (한글 협업 룰 적용)
* 빌드 검증: `./gradlew compileJava` 빌드 검증 통과.

### 3. 프론트엔드 전용 셋업 브랜치 구축 및 고도화 (`feature/community-fe-setup`)
* `develop`에서 분기하여 커뮤니티 프론트엔드 코드(라우팅, API 클라이언트 연동, 마이페이지 컴포넌트, 대시보드 차트)를 분리했습니다.
* **고도화 커밋 완료** (`10b290e`):
  * **차트 URL 실시간 감지**: 글쓰기 에디터(`CommunityWritePage.tsx`) 본문 내에 `/embed/{uuid}` URL이 기입될 시 실시간으로 정규식 감지하여 하단에 차트 미리보기(`EmbedChart`)를 동적으로 그리는 UX를 완성했습니다. (기존 하드코딩된 차트 선택 select 박스는 제거하고 가이드라인으로 교체)
  * **상세 페이지 차트 치환**: 글 상세 보기(`CommunityDetailPage.tsx`) 본문의 `/embed/{uuid}` 텍스트 링크를 Recharts 기반의 실제 상호작용 가능한 차트 컴포넌트로 자동 치환하여 출력하는 렌더러를 고도화했습니다.
  * **목록 배지**: 게시글 목록(`CommunityPage.tsx`)에 차트 스냅샷 및 디노 정보 첨부 여부를 나타내는 배지(`📊 차트`, `🦖 디노`) 표시 로직을 이식하고, 보태니컬(Sage & Cream) 컬러 시스템에 맞춰 UI/UX 디자인 폴리싱을 진행했습니다.
* **빌드 검증**: `npm run build` (tsc 엄격 컴파일 및 Vite 번들 번들링) 빌드 검증 100% 정상 통과 완료.

### 4. 커뮤니티 기능 완성도 평가 및 협업 로드맵 문서 작성
* 현재 구현 수준에 대한 정밀 진단 및 완성도 평가 리포트(`community_readiness_assessment.md`)를 발행하여 아티팩트로 등록했습니다.
* 팀원들이 로컬 작업에 바로 참여할 수 있도록 Swagger 연동, 로컬 data.sql 스크립트 작성, ChartJS 템플릿 코드 안내 등의 사전 개발 계획을 설계했습니다.
* 마스터 가이드 및 스토리보드(SB-01~SB-28) 대비 커뮤니티 세부 기능 구현율과 차이(Gap) 분석 및 고도화 To-Do 로드맵을 작성한 보고서(`community_gap_analysis.md`)를 신규 아티팩트로 발행했습니다.

---

## 🔧 [신규] 백엔드 500 에러 및 로컬 개발 환경 정상화 완료 (2026-06-17)

백엔드 구동 후 프론트엔드가 접속 시 발생하던 다수의 500 Internal Server Error의 원인을 추적 및 분석하고, 이를 수정하여 로컬 개발 환경 연동을 완전히 성공시켰습니다.

### 1. 500 에러 근본 원인 분석 및 해결 조치
1. **컨트롤러 누락으로 인한 `NoResourceFoundException` 에러 (500)**
   * **원인:** 프론트엔드 고도화 브랜치(`feature/community-fe-setup`)에 백엔드 고도화 커밋(`feature/community-be-setup`)이 병합되어 있지 않아 커뮤니티 관련 API(Post 등)가 없었고, 아키텍처 명세 상에 정의된 실시간 탄소 시계 API(`/api/world/current`) 컨트롤러가 백엔드 코드 베이스에 구현 누락되어 발생했습니다.
   * **조치:** 
     * `feature/community-be-setup` 브랜치를 현재 고도화 브랜치에 머지하여 백엔드 구현체를 이식했습니다.
     * **[WorldController.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/world/controller/WorldController.java) [NEW]**를 직접 개발 및 추가하여, DB의 최신 `CarbonIntensityLog` 1건을 조회하고 `DungeonEvent`의 활성 여부(`ACTIVE`) 및 전력 비중(Power Mix) JSON 데이터를 파싱 및 가공하여 프론트엔드 `WorldStatus` 규격에 완벽히 대응하는 API를 서빙하도록 완료했습니다.
2. **Bean 중복 로드 예외 (`BeanDefinitionOverrideException`)**
   * **원인:** 머지 과정에서 `mypage` 패키지 하위의 `PointHistory`와 `PointHistoryRepository`가 되살아나, `user` 패키지 산하의 동일 빈과 이름 충돌을 유발하며 애플리케이션 시작에 실패했습니다.
   * **조치:** 명세 가이드에 맞춰 불필요한 `com.ecovision.app.domain.mypage` 패키지의 중복 파일들을 삭제 처리하고 `user` 도메인으로 싱글톤 빈을 일원화하여 구동을 정상화했습니다.
3. **Seeding 과정 중 데이터 잘림 에러 (`MysqlDataTruncation: Data too long for column 'usage_year_month'`)**
   * **원인:** DB에 적재되지 않은 행정동의 대시보드 데이터를 조회할 때, 데이터 컬렉션 서비스가 2026년 가상 데이터를 실시간 생성해 DB에 삽입하는 루프에서 `usage_year_month` 컬럼 제한인 6자(`YYYYMM`)를 초과하는 `YYYY-MM` (7자) 형태로 데이터를 조립해 쿼리 실행 시 예외를 발생시켰습니다.
   * **조치:** **[DataCollectionService.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/service/DataCollectionService.java) [MODIFY]**에서 문자열 조립 시 하이픈(-)을 제거하고 `year + month` 형태로 수정하여 DB 스키마 정합성을 완벽하게 보장했습니다.

### 2. 최종 연동 및 API 성공 여부 검증 (200 OK)
* **백엔드/프론트엔드 컴파일 빌드:** `./gradlew build -x test` 빌드 완료 및 프론트엔드 TypeScript 빌드 정상 보장.
* **API 호출 정상 작동 검증:**
  * `POST /api/auth/signup` & `POST /api/auth/login` (회원가입 및 JWT 발급 작동 보장)
  * `GET /api/world/current` (WorldStatus 정상 응답 보장)
  * `GET /api/data/summary?year=2025&regionCode=1111000000` (행정동 시뮬레이션 Seeding 후 24개 데이터셋 정상 반환)
  * `GET /api/posts?page=0&size=10` (PostController QueryDSL 동적 검색 쿼리 연동 확인)
  * `GET /api/me/dino/collection` (공룡 도감/컬렉션 조회 API 추가 및 해금 여부 정상 확인)

이로써 로컬 개발에서 FE/BE 통합 및 데이터 바인딩 시 발생하던 모든 블로커 에러들을 정상화하여 온전한 개발 테스트가 가능해졌습니다.

---

## 🔧 [신규] 커뮤니티 및 마이페이지 날짜 Epoch 1970 렌더링 버그 수정 완료 (2026-06-17)

프론트엔드 단에서 게시글 목록, 마이페이지 글 목록, 그리고 차트 스냅샷 임베드 컴포넌트 렌더링 시 날짜 필드가 존재하지 않거나, 아직 불러오는 중일 때 `null` 또는 `undefined` 값이 `new Date()` 생성자에 유입되어 한국 표준시(KST) 기준 `1970년 1월 1일 오전 9:00:00` (Unix Epoch Time 0)으로 화면에 렌더링되는 문제를 원천 차단했습니다.

### 1. 수정 및 방어 조치 내역
1. **[CommunityPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityPage.tsx) [MODIFY]**
   * 게시글 목록 카드의 작성일 렌더링 부근에서 `post.createdAt` null 체크 방어 코드를 적용했습니다.
   * `post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""`
2. **[MyPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/MyPage.tsx) [MODIFY]**
   * 마이페이지 '내가 쓴 게시글' 탭 목록 렌더링 부분에서 `post.createdAt` null 체크 방어 코드를 적용했습니다.
   * `post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""`
3. **[EmbedChart.tsx](file:///c:/final/dino-ecovision/frontend/src/components/charts/EmbedChart.tsx) [MODIFY]**
   * 본문에 삽입된 차트 스냅샷 미리보기 위젯의 생성시간 렌더링 부분에 `snapshot.createdAt` null 체크 방어 코드를 적용했습니다.
   * `snapshot.createdAt ? new Date(snapshot.createdAt).toLocaleDateString() : ""`

### 2. 빌드 결과 검증
* **프론트엔드 컴파일 및 빌드 검증 (`npm run build`):**
  * Vite 및 TypeScript 빌드가 경고나 에러 없이 100% 깔끔하게 통과하여 정적 컴파일 무결성을 보장했습니다.

---

## 🔀 [신규] 깃 브랜치 최종 통합 및 던전 미션 `length` 런타임 크래시 해결 (2026-06-18)

팀원들의 피처 브랜치(`origin/feature/dungeon-api`, `origin/feature/admin-api`)를 로컬 작업 영역(`feature/community-fe-setup`)으로 완벽히 병합하고, 병합 과정의 백엔드 충돌 및 프론트엔드 던전 미션 렌더링 시의 런타임 예외를 해결했습니다.

### 1. 깃 병합 및 충돌 해결
1. **`origin/feature/dungeon-api` 병합 및 충돌 해결**
   * **[UserDinoCollectionRepository.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/dino/repository/UserDinoCollectionRepository.java)**: `List<UserDinoCollection>` 반환 형식의 도감 조회용 쿼리 메서드 정의 충돌 수동 해결.
   * **[DinoService.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/dino/service/DinoService.java)**: 기존 에러 우회용 컬렉션 DTO를 조원 규격인 `DinoCollectionDto.CollectionResponse` 및 `getCollection(userId)` 메서드로 일원화하여 충돌 해결.
   * **[data.sql](file:///c:/final/dino-ecovision/database/data.sql)**: 던전 미션 시드 데이터와 사용자 공룡 도감 해금 초기 데이터를 통합 적재하도록 머지.
2. **`origin/feature/admin-api` 병합 및 충돌 해결**
   * **[SecurityConfig.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/global/config/SecurityConfig.java)**: `/api/admin/**` 경로에 대한 권한 검증 규칙 충돌을 해결하여, 일반 인증 경로는 허용하되 관리자 기능은 `ADMIN` 역할을 가진 사용자만 호출할 수 있도록 검증 규칙 강화.
3. **[DinoController.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/dino/controller/DinoController.java) 컴파일 오류 수정**
   * 머지 마커 정리 중 혼입된 중복 닫는 중괄호(`}`)를 제거하여 백엔드 컴파일 빌드 통과 성공.

### 2. 던전 미션 `length` 런타임 오류(Cannot read properties of undefined) 해결
* **현상**: 활성 던전이 조회되었을 때, `dungeon.missions` 배열이 존재하지 않는 개발 환경(또는 모의 API 상태)에서 `dungeon.missions.length`를 직접 읽어 프론트엔드가 하얗게 크래시되는 현상이 발견되었습니다.
* **조치**: 
  * **[HomePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/HomePage.tsx)** 및 **[WorldDungeonPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/WorldDungeonPage.tsx)**에서 던전 미션에 접근할 때 `(dungeon.missions || [])` Fallback을 사용하여 배열이 부재해도 안전하게 미션 수 `0개`를 출력하고 렌더링이 중단되지 않도록 방어 조치했습니다.

### 3. 빌드 및 구동 검증
* **백엔드 빌드**: `gradlew build -x test` 실행 결과 **BUILD SUCCESSFUL** 통과.
* **프론트엔드 빌드**: `npm run build` 실행 결과 TypeScript/Vite 번들링 정상 완료.
* **로컬 서버 동작**: 백엔드 `bootRun`(8080 포트) 및 프론트엔드 dev(5173 포트) 정상 기동 확인.

---

## 📝 [신규] 커뮤니티 게시글 및 댓글 수정/삭제 기능 구현 완료 (2026-06-18)

커뮤니티 내의 게시글 및 댓글에 대해 본인(작성자) 또는 관리자 권한을 가진 사용자만 수정/삭제를 수행할 수 있도록 UI 제어와 백엔드 API 연동을 고도화했습니다.

### 1. 수정 및 구현 내역
1. **[communityApi.ts](file:///c:/final/dino-ecovision/frontend/src/api/communityApi.ts) [MODIFY]**
   - 백엔드의 `PUT /api/posts/{id}` 및 `PUT /api/posts/comments/{commentId}` Endpoint 호출을 위한 `updatePost`와 `updateComment` 함수를 추가 구현했습니다.
2. **[App.tsx](file:///c:/final/dino-ecovision/frontend/src/App.tsx) [MODIFY]**
   - 게시글 수정을 위한 새로운 라우트인 `/community/edit/:id` 경로를 추가하고 `CommunityWritePage`로 연결했습니다.
3. **[CommunityWritePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
   - 컴포넌트 마운트 시 URL Parameter에 `id`가 있을 경우(수정 모드) 기존 게시글 상세를 호출하여 Form 영역에 바인딩하고, 제출 시 `updatePost` API를 호출하도록 설계했습니다.
   - **디노 스냅샷 갱신**: 글 수정 시점의 최신 공룡 성장 정보를 DB에 반영할 수 있도록, `attachDino`가 켜져 있을 때 로컬 스토리지의 최신 `myDino` 정보를 스냅샷 필드에 업데이트하도록 구현했습니다.
   - API 통신 중 예외가 발생할 경우 알림창(alert)을 통해 구체적인 에러 메시지를 사용자에게 즉각 노출하도록 처리했습니다.
4. **[CommunityDetailPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityDetailPage.tsx) [MODIFY]**
   - 로그인된 사용자 프로필을 불러오기 위해 `getMe`를 마운트 시점에 연동하여 `currentUser` ID 상태를 확보했습니다.
   - **게시글 권한 체크**: 작성자(`post.authorId === currentUser.userId`)에게만 수정(Edit) 버튼이 보이고, 삭제(Delete) 버튼은 작성자 혹은 `ADMIN` 역할을 보유한 사용자에게만 노출되어 백엔드의 접근 제어 사양과 완전히 일치시켰습니다.
   - **댓글 수정 및 삭제**: 자기가 쓴 댓글에만 수정/삭제 버튼이 보이도록 제한하고, 수정 클릭 시 인라인 입력 폼으로 전환되어 실시간으로 댓글 내용을 고칠 수 있는 직관적인 편집 환경을 구현했습니다. 삭제 시 확인 창(confirm)을 띄우고 통신 실패 시 오류 피드백을 안내합니다.
5. **[Header.tsx](file:///c:/final/dino-ecovision/frontend/src/components/layout/Header.tsx) [MODIFY]**
   - 다른 파트(디노 룸 및 랭킹 담당) 팀원들과 중복되는 기능 개발을 방지하고 UI 동선을 일원화하기 위해 상단 GNB 메뉴에서 '랭킹' 준비중 항목을 완전히 제거했습니다.
6. **[CommunityPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityPage.tsx) [MODIFY]**
   - 검색 버튼이 인풋 창 너비에 밀려 세로 선(1px) 형태로 찌그러지던 레이아웃 버그를 `w-16 flex-shrink-0` 스타일 지정을 통해 해결했습니다.
7. **[CommunityDetailPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityDetailPage.tsx) [MODIFY]**
   - 게시글이 수정되었을 때(작성일과 수정일의 시간 격차가 1초 이상일 때) 기존 작성일과 수정일이 병행(`작성: YYYY-MM-DD ... • 수정: YYYY-MM-DD ...`)하여 출력되도록 구현했습니다.

### 2. 빌드 결과 및 검증
- **프론트엔드 빌드**: `npm run build` TypeScript 컴파일 검사 성공 통과.
- **백엔드 빌드**: `./gradlew build -x test` 성공 통과.

---

## 🔧 [신규] 커뮤니티 검색창 버튼 레이아웃 및 수정 날짜 조건부 표시 개선 완료 (2026-06-18)

검색창의 버튼 찌그러짐 현상을 근본적으로 해결하고, 게시글 추천이나 단순 조회 시 수정일이 갱신되는 데이터베이스 문제를 해결하여 실제 수정 시에만 수정 날짜가 노출되도록 보완했습니다.

### 1. 수정 및 조치 내역
1. **[V3__remove_on_update_timestamp.sql](file:///c:/final/dino-ecovision/backend/src/main/resources/db/migration/V3__remove_on_update_timestamp.sql) [NEW]**
   - 데이터베이스 `posts` 테이블의 `updated_at` 컬럼에 지정되어 있던 `ON UPDATE CURRENT_TIMESTAMP` 속성을 제거하여, 조회수 증가나 추천수 변동에 의해 데이터가 수정되더라도 `updated_at`이 강제 갱신되는 동작을 제거했습니다.
2. **[CommunityPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityPage.tsx) [MODIFY]**
   - 검색창의 `input` 태그 `className`에 `min-w-0`을 추가하여, flex 컨테이너 내부에서 input이 알맞게 축소되게 만들어 우측 "검색" 버튼(`w-16 flex-shrink-0`)이 찌그러지거나 잘리지 않고 원래 지정된 가로 너비(64px) 그대로 우측에 정렬되도록 조정했습니다.
3. **[CommunityDetailPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityDetailPage.tsx) [MODIFY]**
   - 수정 판단 논리인 `isEdited` 상수의 허용 격차를 기존 `1000ms`에서 `5000ms`로 증가시켜 최초 생성 시 발생하는 오차를 방지했습니다.

### 2. 검증 결과
* **Flyway 마이그레이션**: 백엔드 구동 시 스키마 버전 v3가 올바르게 적용되어 `posts` 테이블의 자동 업데이트 제약이 정상적으로 해제된 것을 확인했습니다.
* **레이아웃 검증**: 커뮤니티 페이지의 검색 바 우측에 "검색" 버튼이 잘림 현상 없이 정상적으로 렌더링되는 것을 확인했습니다.
* **수정일 노출 조건 검증**:
  - 게시물 최초 작성 시에는 작성일만 노출되고 수정일은 보이지 않습니다.
  - 해당 게시물의 추천/추천 취소를 반복하거나 페이지를 새로고침하여 조회수를 늘려도 수정일이 나타나지 않는 것을 확인했습니다.
  - 실제 글의 "수정" 기능을 사용하여 글 내용을 변경하고 저장했을 때만 정상적으로 `수정: YYYY-MM-DD ...` 일자가 노출되는 것을 확인했습니다.

---

## 🔧 [신규] 검색창 문구 수정 및 글 작성 프리미엄 에디터 고도화 완료 (2026-06-18)

검색창의 불필요한 문구를 수정하고, 글 작성 에디터의 UI를 세이지 & 크림 보태니컬 테마에 맞춰 고도화하였으며 문자 수 실시간 집계 및 텍스트 서식(Bold, Italic, Underline, Strikethrough) 연동을 완료했습니다.

### 1. 수정 및 조치 내역
1. **[CommunityPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityPage.tsx) [MODIFY]**
   - 검색창 인풋의 플레이스홀더를 기존 `검색어 입력 (2자 이상)`에서 `검색어 입력`으로 수정하여 UI를 간소화했습니다.
2. **[CommunityWritePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
   - 세이지 & 크림 테마 컬러(배경 `#FAF9F5`, 보더 `#E8F2EC`, 포인트 `#5F8C74`)와 미려하게 어울리는 **Rich Toolbar Editor**를 개발했습니다.
   - **기본 툴바 기능 연동**: 굵게(B), 기울임(i), 밑줄(U), 취소선(S) 아이콘 클릭 시 현재 드래그된 텍스트 범위 또는 커서 위치를 마크업 태그(`**텍스트**`, `*텍스트*`, `<u>텍스트</u>`, `~~텍스트~~`)로 감싸서 즉시 삽입되도록 `insertFormat` 헬퍼 함수를 적용했습니다.
   - **확장 버튼 배치**: 글자 크기, 리스트, 색상, 이미지, 링크, 테이블, 이모지, 차트, AI 도우미, 사용자 태그, 소스 보기 버튼을 조화롭게 수용하도록 레이아웃을 마운트하고 기능 클릭 시 안내 팝업을 연계하여 향후 확장성을 확보했습니다.
   - **실시간 글자 수**: 우측 하단에 `문자 : {content.length}`를 출력하여 실시간 문자 카운팅을 연동했습니다.
3. **[CommunityDetailPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityDetailPage.tsx) [MODIFY]**
   - 글 상세 내용 렌더링 시, 툴바 서식을 통해 삽입된 굵게/기울임/밑줄/취소선 마크업 문자들을 안전한 React JSX 엘리먼트(`<strong>`, `<em>`, `<u>`, `<del>`)로 변환하여 렌더링해주는 `parseMarkdownText` 파서를 구현하여, 스타일이 깨지거나 HTML 주입 취약점(XSS) 위협 없이 실시간 텍스트 스타일이 잘 적용되도록 렌더러를 보완했습니다.
4. **차트 스냅샷 저장용 데이터베이스 테이블 존재 검증**
   - 데이터베이스 스키마 `V1__init.sql` 파일 분석을 통해, 유저의 공유 차트 데이터를 보관하기 위한 `chart_snapshots` 테이블이 이미 다음과 같이 정의되어 존재함을 확인했습니다:
     - `id VARCHAR(36) PRIMARY KEY` (UUID 스냅샷 식별값)
     - `user_id BIGINT` (회원 외래키)
     - `chart_metadata JSON` (차트 데이터 정보)
     - 따라서 추후 고도화 시, 추가적인 DDL 구성 없이 해당 테이블의 `user_id` 조회를 처리하는 API만 개발하여 간편하게 연동 가능함을 확인했습니다.

### 2. 검증 결과
* **에디터 UI 및 동작 검증**: 글쓰기/수정 화면 진입 시 보태니컬 스타일의 프리미엄 에디터가 온전히 나타나며, 툴바의 B/i/U/S 클릭 시 텍스트 영역에 서식 부호가 정확히 들어가고 글자 수가 실시간 계산되는 것을 확인했습니다.
* **상세 서식 출력 검증**: 툴바 서식을 적용하여 글을 작성/저장한 뒤 상세 페이지에서 굵은 글씨, 취소선, 밑줄, 기울임 등의 리치 텍스트 서식이 미려하게 렌더링되는 것을 확인했습니다.
* **빌드 무결성**: 프론트엔드 production 빌드가 100% 정상 통과되었습니다.

---

## 🔧 [신규] 백엔드 Jsoup XSS 방어, 이미지 생명주기 관리 및 프론트엔드 WYSIWYG 최종 고도화 완료 (2026-06-18)

안전한 HTML XSS 방어 필터링과 서버 스토리지 용량 최적화를 위한 이미지 관리 체계, 그리고 아카라이브식 극대화된 사용자 경험의 에디터를 완성했습니다.

### 1. 수정 및 조치 내역

1. **[build.gradle](file:///c:/final/dino-ecovision/backend/build.gradle) [MODIFY]**
   - HTML Sanitize 처리를 위해 `org.jsoup:jsoup:1.18.1` 라이브러리 의존성을 주입했습니다.
2. **[V4__create_post_image.sql](file:///c:/final/dino-ecovision/backend/src/main/resources/db/migration/V4__create_post_image.sql) [NEW]**
   - 이미지 매핑 상태 및 생명주기를 데이터베이스에서 추적할 수 있도록 `post_images` 테이블 구조를 Flyway 마이그레이션 DDL로 구현했습니다.
3. **[PostImage.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/community/entity/PostImage.java) & [PostImageRepository.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/community/repository/PostImageRepository.java) [NEW]**
   - 미매핑(UNMAPPED) 및 매핑(MAPPED) 상태 관리를 위한 Entity 및 Spring Data JPA Repository를 구축했습니다.
4. **[PostController.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/community/controller/PostController.java) & [CommunityService.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/community/service/CommunityService.java) [MODIFY]**
   - **XSS 방어 필터**: 정규식 대신 `Jsoup`과 custom `Safelist`를 활용하여 스타일이 손상되지 않으면서 악성 스크립트만 걸러내는 `sanitizeHtml` 필터를 도입하고, 게시물 생성/수정 진입점에 일괄 적용했습니다.
   - **이미지 상태 추적**: 본문 내용의 `<img>` 태그 URL을 분석하여, 최종 글 작성 완료 시점에 DB의 `PostImage`들을 `MAPPED` 및 `post_id`로 영구 연동시켰습니다.
5. **[ImageCleanupScheduler.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/community/scheduler/ImageCleanupScheduler.java) [NEW]**
   - 매일 새벽 3시 동작하는 스케줄러를 통해, 생성 후 24시간이 지났음에도 최종 글과 바인딩되지 못하고 유실된 고아(UNMAPPED) 이미지 파일들을 물리 스토리지 디스크와 DB 레코드에서 일괄 삭제하도록 구현했습니다.
6. **[communityApi.ts](file:///c:/final/dino-ecovision/frontend/src/api/communityApi.ts) [MODIFY]**
   - Multipart FormData 규격의 로컬 이미지 업로드 API `uploadPostImage`를 바인딩했습니다.
7. **[CommunityWritePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
   - `contenteditable` 기반 실시간 WYSIWYG 에디터를 구축하여 즉각적인 글꼴/색상/크기/배경 스타일링이 화면에 반영되게 변경했습니다.
   - **드래그 앤 드롭 & 복사 붙여넣기(`Ctrl+V`)**: 에디터 영역 내 drop, paste 이벤트를 리스닝하여 즉시 서버에 이미지를 업로드하고 `<img>` 태그를 캐럿 위치에 오토-인젝션하는 기능을 추가했습니다.
   - **이미지 정렬/리사이즈 미니 툴바**: 삽입된 이미지를 클릭하면 오버레이 형태로 조작 툴바가 노출되어 크기 조정(25%, 50%, 100%) 및 정렬(좌, 우, 가운데) 인라인 CSS를 자유롭게 주입하도록 조작감을 극대화했습니다.
   - **임시 자동 저장**: `localStorage`를 통해 15초 단위 주기 자동 저장 및 진입 시 불러오기 팝업 연동을 완료했습니다.
   - TypeScript `editorRef.current` null 가능성 컴파일 에러 예방 코드를 추가했습니다.
8. **[CommunityDetailPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityDetailPage.tsx) [MODIFY]**
   - 상세 페이지 렌더링 시 Jsoup 가공본 데이터를 HTML 템플릿 형태로 React `dangerouslySetInnerHTML`로 스타일을 완전 보존하여 표출했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 에러 없이 Vite 프로덕션 빌드 완료.
* **백엔드 컴파일 무결성**: `./gradlew compileJava` 빌드 검증 성공.

---

## 🔧 [신규] 에디터 B/I/U 포맷 적용 오류 해결, 버튼 직관성 및 이미지 업로드 돔 유지 고도화 (2026-06-18)

에디터 서식 적용 신뢰성을 보장하고 이미지 업로드 시 본문이 초기화되던 치명적인 돔 탈착 버그를 해결했습니다.

### 1. 수정 및 조치 내역

1. **[CommunityWritePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
   - **이탤릭 적용 및 기본 서식 버그 수정**: `styleWithCSS`를 `"false"`로 지정하여 브라우저가 inline span 대신 `<b>`, `<i>`, `<u>`, `<s>` 시맨틱 태그를 명시적으로 생성하도록 개선했습니다. 이를 통해 특정 폰트(도트/레트로 등)에서 이탤릭체 스타일링이 누락되는 렌더링 문제를 영구적으로 해결했습니다.
   - **이미지 업로드 시 본문 초기화 버그 픽스**: 이미지 업로드 시 전체 화면 로딩(`isLoading`) 상태를 타게 되어 에디터 폼 컴포넌트가 언마운트(소멸) 및 재마운트되면서 작성 데이터가 날아가던 현상을 발견했습니다. 이를 최초 진입 시 로딩 상태(`isInitialLoading`)와 이미지 업로드 전용 로딩 상태(`isUploadingImage`)로 구분하여 에디터 돔이 유지된 채로 툴바 영역에 `⏳ 이미지 업로드 중...` 인디케이터만 가볍게 뜨도록 변경했습니다.
   - **툴바 버튼 직관성 개선**: B, i, U, S 버튼의 라벨에 각각 굵게, 기울임, 밑줄, 취소선 폰트 스타일을 직접 지정하여 각 버튼의 기능성을 한눈에 파악할 수 있도록 마크업을 강화했습니다.
   - **커서 포커싱 포맷 감지(Active Feedback)**: contenteditable 에디터 내의 커서 위치를 실시간 감지(`onKeyUp`, `onMouseUp`, `onFocus`)하여 현재 지점에 적용된 서식 상태를 추적합니다. 활성화된 서식 버튼(Bold/Italic/Underline/Strike)은 웜 파스텔 블루 톤(`bg-[#E6F0FA] text-[#2B6CB0] border-[#BEE3F8]`)으로 밝혀져, "거기서 타이핑하면 해당 효과가 적용됨"을 사용자에게 직관적으로 제공하도록 피드백 UI를 구현했습니다.
   - **선택 영역(Selection) 보존**: 툴바 버튼을 마우스로 클릭할 때 에디터의 selection이 풀리지 않도록 버튼들의 `onMouseDown` 이벤트에 `e.preventDefault()`를 처리하여 사용성을 향상했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 TypeScript 컴파일 및 Vite 빌드 정상 완료.

---

## 🔧 [신규] 한글 이탤릭 합성(synthesis) 차단 해제 및 상대 경로 이미지 엑박 방지/호버 리셋 완료 (2026-06-18)

시스템 폰트가 한글 이탤릭을 실제 지원하지 않는 환경에서도 브라우저 레벨에서 강제 기울임(Oblique) 렌더링을 복구하고, 이미지 상대 경로 불일치로 인한 엑박 버그와 조회 화면에서의 불필요한 호버 링 테두리를 해소했습니다.

### 1. 수정 및 조치 내역

1. **[index.css](file:///c:/final/dino-ecovision/frontend/src/index.css) [MODIFY]**
   - **이탤릭 렌더링 복구**: `:root` 설정 내에 브라우저의 가짜 기울임 합성 렌더링을 전면 금지하던 `font-synthesis: none;` 속성을 `font-synthesis: weight style;`로 교체하여 한글 이탤릭체 합성 출력을 복원했습니다.
   - **강제 눕힘 CSS 룰 보완**: `i`, `em`, `.italic` 요소에 `font-style: italic !important; font-synthesis: style !important;`를 바인딩하여 폰트 종속성 없이 무조건 기울어져 보이도록 안전장치를 설계했습니다.
   - **에디터와 상세 뷰어 이미지 호버 스타일 분리**: 상세 보기의 본문 영역(`.rich-content img`) 내 이미지에 대해서는 마우스 오버 시 손가락 커서와 초록색 테두리 링(`--tw-ring`) 효과가 일절 노출되지 않도록 초기화했습니다. 에디터 영역(`[contenteditable] img:hover`) 내부에서만 테두리 가이드라인이 명시적으로 나타나도록 스타일을 분리했습니다.
2. **[CommunityDetailPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityDetailPage.tsx) [MODIFY]**
   - **상세 보기 이미지 엑박 예방**: 백엔드 포트(8080)와 프론트엔드 포트(5173) 이원화로 인한 이미지 404를 방지하기 위해, 본문을 dangerouslySetInnerHTML로 출력하기 직전 이미지의 상대 경로(`src="/uploads/`)를 백엔드 절대 경로(`src="http://localhost:8080/uploads/`)로 실시간 정규식 치환 처리했습니다.
3. **[CommunityWritePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
   - **에디터 실시간 이미지 엑박 예방**: 에디터 영역 내에 이미지가 꽂힐 때(`insertImageAtCursor`)와 contenteditable에 HTML 동기화 시 uploads 상대 주소 앞에 백엔드 호스트 주소를 동적으로 얹어서 에디터 내부에서도 엑박 없이 정밀하게 렌더링되게 개선했습니다.
   - **DB 저장 상대 경로 보존**: 백엔드의 이미지-포스트 연관관계 매핑 및 디스크 스토리지 무결성을 보존하기 위해, 폼을 제출할 때(`handleSubmit`)는 본문 속 `http://localhost:8080/uploads/` 절대 경로를 상대 경로인 `/uploads/`로 깔끔히 정제하여 전송하도록 보장했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 100% 컴파일 성공 빌드 통과.

---

## 🔧 [신규] 이미지 드래그 리사이징 구현 및 Float collapse(부모 침범) 버그 해결 완료 (2026-06-18)

에디터 상에서 마우스 드래그로 이미지 크기를 직관적으로 변경할 수 있는 UI 기능과 float 정렬된 이미지가 하단 레이아웃을 침범하는 버그를 완치했습니다.

### 1. 수정 및 조치 내역

1. **[index.css](file:///c:/final/dino-ecovision/frontend/src/index.css) [MODIFY]**
   - **Float Collapse 해결**: 본문 영역(`.rich-content`)과 에디터 영역(`[contenteditable]`)에 `display: flow-root !important; clear: both !important;` 스타일을 부여하여, 이미지의 좌/우 정렬(`float: left/right`) 시에도 부모 컨테이너의 높이가 올바르게 늘어나며 아래의 추천 버튼 및 댓글 영역을 덮치거나 침범하지 않도록 완벽히 방어했습니다.
2. **[CommunityWritePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
   - **오버레이 드래그 리사이저 추가**: 에디터 영역 내 이미지를 클릭하면 해당 이미지의 absolute 경계를 정확히 감싸는 점선 오버레이 박스(`imageResizeBox`)와 우측 하단 앵커 핸들 점(둥근 초록색 단추)을 마운트했습니다.
   - **드래그 연동 (`handleResizeStart`)**: 꼭짓점 드래그 핸들을 마우스로 드래그하면 마우스 clientX의 이동 변화량(deltaX)을 실시간 감지하여 이미지 너비를 비율(%) 단위로 조절합니다. 비율(%) 단위 저장 방식은 기기 크기나 모바일에 유연하게 반응(Responsive)하게 지원합니다.
   - **실시간 좌표 추적**: 드래그 크기 조절 중에 컨텍스트 툴바(25%, 50%, 100% 및 정렬 버튼)의 위치도 마우스 움직임에 동기화되어 부드럽게 재배치됩니다. 드래그가 끝나는 순간 `setContent`를 호출해 변경된 인라인 스타일 크기를 content 상태에 확정 보존합니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 100% 정상 통과.

---

## 🔧 [신규] 에디터 스크롤 이미지 오버레이 이탈 버그 수정 및 인라인 이미지 배치 지원 (2026-06-18)

에디터 스크롤 시 이미지 드래그 리사이징 오버레이와 툴바가 이미지를 따라가지 못하고 어긋나는 스크롤 버그를 수정하고, 본문 내 이미지가 텍스트와 자연스럽게 어우러지도록 인라인 배치 및 Froala 스타일 클래스를 연동하였습니다.

### 1. 수정 및 조치 내역

1. **[index.css](file:///c:/final/dino-ecovision/frontend/src/index.css) [MODIFY]**
   - **인라인 이미지 전역 우회**: 기존 전역 `img { display: block; }`이 에디터와 상세 본문에 미치는 영향을 해제하기 위해, `.rich-content img`와 `[contenteditable] img` 영역 내의 이미지는 기본적으로 `display: inline-block; vertical-align: bottom;` 흐름을 따르도록 스타일을 보완했습니다.
   - **Froala 스타일 클래스 연동**: 사용자가 나무위키/아카라이브 마크업 사례로 준 `fr-fic fr-dii` 및 `fr-dib` 클래스를 정의했습니다. `.fr-dii` 클래스를 가진 이미지는 인라인-블록으로 지정되고 자간 마진(`margin: 0 8px`)을 주어 텍스트와 미려하게 어우러지게 하였으며, `.fr-dib`는 중앙 단독 블록 배치로 깔끔히 정렬되도록 CSS를 구축했습니다.

2. **[CommunityWritePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
   - **getBoundingClientRect 기반 헬퍼 도입**: 기존 `offsetTop`, `offsetLeft`는 offsetParent 해석 오류 및 스크롤 누적으로 인한 좌표 오차가 심해, 스크롤 컨테이너를 기준으로 뷰포트 상대 좌표를 산출하는 `getImageCoordinates` 공통 좌표 계산 헬퍼 함수를 추가했습니다.
   - **에디터 스크롤 동적 갱신**: 에디터 스크롤 컨테이너 `div`에 `onScroll` 이벤트 리스너를 바인딩하여, 스크롤이 움직일 때마다 현재 활성 이미지(`activeImage`)의 점선 테두리 오버레이와 미니 툴바의 위치를 실시간으로 재추적 및 재정렬하도록 구현했습니다. 스크롤을 끝까지 내려도 이미지를 따라 움직이며 어긋남이나 삐져나감 현상이 완전히 해소되었습니다.
   - **툴바 정렬 클래스 맵핑 고도화**: 정렬 툴바 함수(`alignImage`)에서 정렬 방식을 변경할 때 스타일뿐만 아니라 이미지 노드의 클래스명에 `fr-fic`, `fr-dii`, `fr-dib`를 알맞게 동적으로 부착/탈착하게 개선하여 글 상세 조회 화면에서도 정렬 방식이 일관성 있게 보존되도록 개선했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 Vite 및 TypeScript 엄격 검증 정상 통과 완료.

---

## 🔧 [신규] 에디터 툴바 리스트 버튼 삭제 및 플러스 드롭다운(+:) 추가 기능 구현 (2026-06-18)

에디터 툴바에서 불필요해진 리스트(`☰`) 버튼을 제거하고, 구분선(`▬`) 버튼이 있던 자리에 표(Table) 삽입과 사용자 저장 차트(Chart) 삽입을 선택할 수 있는 플러스 드롭다운(`+:`) 기능을 추가 탑재하였습니다.

### 1. 수정 및 조치 내역

1. **백엔드 API 및 비즈니스 로직 추가**
   - **[ChartSnapshotRepository.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/community/repository/ChartSnapshotRepository.java) [MODIFY]**: 사용자 ID로 차트 스냅샷을 최신순 조회하는 `findAllByUserIdOrderByCreatedAtDesc` 쿼리 메서드를 정의했습니다.
   - **[CommunityService.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/community/service/CommunityService.java) [MODIFY]**: 저장한 차트 목록 조회 처리를 위한 `getUserSnapshots(userId)` 비즈니스 서비스를 구현했습니다.
   - **[ChartSnapshotController.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/community/controller/ChartSnapshotController.java) [MODIFY]**: `GET /api/charts/snapshot` Endpoint를 신설하여 로그인된 사용자의 차트 스냅샷 리스트를 반환하도록 완료했습니다.
   - **빌드 검증**: `./gradlew compileJava` 빌드 검증을 통해 컴파일 오류가 발생하지 않음을 증명했습니다.

2. **프론트엔드 API 연동**
   - **[dashboardApi.ts](file:///c:/final/dino-ecovision/frontend/src/api/dashboardApi.ts) [MODIFY]**: 신설된 `/api/charts/snapshot` (GET) 통신을 받아오는 `fetchMyChartSnapshots()` 프론트엔드 클라이언트 함수를 추가했습니다.

3. **에디터 툴바 구성 개편 (`CommunityWritePage.tsx`)**
   - **[CommunityWritePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
     - **리스트 삭제**: 불필요한 줄간격(리스트 `☰`) 버튼 마크업을 툴바에서 완전히 제거했습니다.
     - **플러스 메뉴(+:) 추가**: 구분선(`▬`) 버튼을 대체하여 `+: ▾` 드롭다운 단추를 마운트했습니다.
     - **표 삽입 (Grid Picker) 바인딩**: 드롭다운 내부에 10x2 크기의 마우스 호버 감지 격자를 배치하여 사용자가 원하는 행x열을 마우스 오버로 직관적으로 선택하고, 클릭 시 캐럿 위치에 정돈된 HTML `<table>` 테두리 그리드를 자동 삽입하도록 구현했습니다.
     - **저장한 차트 추가 연동**: 드롭다운 내부의 "📊 저장한 차트 추가" 버튼 클릭 시 사용자의 차트 목록을 로딩하여 출력하는 전용 모달(Modal) 팝업을 구축했습니다. 목록에서 차트를 클릭하면 `/embed/{uuid}` 마크업 형태로 에디터 커서 자리에 자동 삽입되며, 하단의 실시간 차트 미리보기도 유기적으로 구동됩니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 실행 결과 TypeScript 및 Vite 빌드 빌드 정상 통과 완료.

---

## 🔧 [신규] 에디터 2층 확장형 Sub Toolbar 구축 및 본문 블록 요소(blockquote, list, hr) 커스텀 CSS 적용 (2026-06-18)

에디터 상단 툴바를 Main Toolbar와 Sub Toolbar 2개의 계층으로 설계 분리하고, 문단 서식 단추(`¶⋮`) 토글 상태(`isBlockMenuOpen`)에 맞추어 서브 툴바를 부드럽게 표출하였으며, 정렬/목록/들여쓰기/인용구/구분선 기능 바인딩 및 커스텀 CSS 적용을 완료했습니다.

### 1. 수정 및 조치 내역

1. **2층 계층형 Sub Toolbar 구축 (`CommunityWritePage.tsx`)**
   - **토글 상태 도입**: `isBlockMenuOpen` 상태를 새로 선언하고, Main Toolbar의 '단락/포맷' 아이콘(`¶⋮`)을 클릭할 때 해당 상태를 온/오프 토글하도록 연결했습니다.
   - **레이아웃 구현**: `isBlockMenuOpen`이 `true`이고 소스코드 모드가 아닐 때, Main Toolbar 바로 아래에 웜 세이지-크림 컨셉에 부합하는 서브 툴바 바 영역을 동적 마운트했습니다.
   - **기능 버튼 순서 바인딩**: 서브 툴바에 텍스트 정렬(Align L, Align C, Align R, Justify), 목록(순서 있는 1.2.3., 순서 없는 Bullet), 들여쓰기(Outdent, Indent), 인용구(Quote ❝), 구분선(Line ──) 버튼을 가이드에 명시된 순서 그대로 마운트했습니다.
   - **포커스 유실 예방**: 서브 툴바의 모든 버튼 클릭 시 텍스트 영역의 커서와 드래그 선택 포커스(Selection/Range)가 해제되지 않도록 `onMouseDown={(e) => e.preventDefault()}`를 엄격 적용하여 안전장치를 갖추었습니다.

2. **본문 블록 요소 커스텀 CSS 강제 규칙 지정 (`index.css`)**
   - **인용구 (`blockquote`)**: 상세페이지와 에디터 본문 내 인용구가 삽입되면 좌측에 4px 보라색 굵은 세로선(`border-left: 4px solid #8B5CF6;`)과 충분한 패딩, 텍스트 색상을 흐리게(`color: #6B7280;`) 적용하여 본문과 시각적으로 고아 디자인 형태로 격리시켰습니다.
   - **목록 (`ul`, `ol`)**: 기본 HTML5 list-style-type(disc/decimal)이 리치 텍스트 렌더링 시 정상 표출되도록 강제 속성을 보완하고 충분한 들여쓰기(`padding-left: 2rem;`)를 주어 가독성을 회복했습니다.
   - **구분선 (`hr`)**: 위아래 여백(`margin: 1.5rem 0;`)과 얇고 흐린 선(`border: 0; border-top: 1px solid #E5E7EB; height: 0;`)으로 정교하게 리모델링했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 TypeScript 컴파일 및 Vite 컴파일 100% 에러 없이 정상 완료.

---

## 🔧 [신규] 테이블(표) 열 리사이징, 플러스 버튼 배경색 수정 및 문단 서식 드롭다운 개발 (2026-06-18)

에디터 본문 내에 삽입한 표(테이블)의 열 경계선(세로선)을 드래그해 열의 가로폭 너비 비율을 조정할 수 있는 기능을 추가하고, `+:` 버튼의 배경색 누출 버그 수정 및 문단 형식(`¶:`) 버튼을 클릭하여 H1~H3 제목과 코드블록 등 문단 포맷을 변경해 줄 수 있는 드롭다운 메뉴를 완성하였습니다.

### 1. 수정 및 조치 내역

1. **테이블 열 드래그 리사이저 구현 (`CommunityWritePage.tsx`)**
   - **기본 레이아웃 개선**: `insertTableToEditor` 에서 테이블을 생성할 때 `table-layout: fixed` 속성을 기본 부여하고 각 열에 공평한 퍼센트(`width: {colWidth}`) 스타일을 적용하여, 열 너비 스타일을 조정했을 때 시각적 반영이 자연스럽게 이루어지도록 테이블 구성을 고도화했습니다.
   - **이벤트 핸들러 추가**: 에디터 `contentEditable` div 영역에 `onMouseMove` 및 `onMouseDown` 이벤트를 바인딩했습니다. 마우스 포인터가 테이블 셀(`td`, `th`)의 우측 세로선 경계선(8px 이내)에 가까워질 때 커서 모양을 `col-resize`로 변환하여 리사이징 지점임을 시각화합니다.
   - **열 너비 동적 제어**: 해당 지점에서 드래그 동작이 시작되면, `mousemove` 이벤트를 통해 마우스 clientX의 이동 변화량을 누적 추적하여 해당 셀(`td`)의 `style.width` 픽셀 값을 직접 재조정하고, 최종 HTML 마크업을 본문 content 상태에 동기화하였습니다.

2. **`+:` 버튼 비활성 상태 배경색 수정 (`CommunityWritePage.tsx`)**
   - `btnClass(isActive)` 스타일 매개변수 전달 규칙을 `btnClass(!plusMenuOpen)`으로 반전 처리하여, 플러스 메뉴가 닫혀있을 때(비활성화) 웜그레이 텍스트 상태를 유지하고 클릭하여 드롭다운이 노출되었을 때만 초록색 배경(`bg-[#E8F2EC]`)이 올바르게 칠해지도록 스타일을 바로잡았습니다.

3. **문단 서식 (`¶:`) 선택 드롭다운 메뉴 탑재 (`CommunityWritePage.tsx`)**
   - 기존의 단순 단발성 `p` 포맷 전환 동작에서 탈피하여, `paragraphOpen` 상태 변수를 도입하고 문단 서식(`¶`) 버튼 클릭 시 H1~H3, Normal(P), Code Block(PRE)을 바인딩한 미려한 드롭다운 박스가 열리도록 마크업을 확장했습니다.
   - 항목 클릭 시 `document.execCommand("formatBlock", false, item.tag)`를 기동하여 작성 중인 커서 줄의 서식을 동적으로 안전하게 변환하도록 구현했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 TypeScript 컴파일 및 Vite 컴파일 100% 에러 없이 정상 완료.

---

## 🔧 [신규] 들여쓰기 및 인용구 기능 수정 및 빌드 에러 해결 (2026-06-19)

들여쓰기 적용 시 불필요하게 표시되던 왼쪽 보라색 선을 지우고, 대신 인용구 적용 시 여러 문단이 하나의 `blockquote`로 온전히 묶여 보라색 선이 길게 하나로 쳐지도록 설계를 개편하고 TypeScript 빌드 오류를 해결했습니다.

### 1. 수정 및 조치 내역

1. **[CommunityWritePage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityWritePage.tsx) [MODIFY]**
   - **들여쓰기 스타일링 수정**: 들여쓰기 단추 클릭 시 더 이상 `document.execCommand("indent")`에 의한 `blockquote` 태그를 생성하지 않고, 커스텀 들여쓰기 함수(`handleCustomIndent`)를 실행하여 선택한 블록의 `style.marginLeft` 속성을 40px 단위로 증감하게 바인딩했습니다. 이를 통해 들여쓰기 실행 시 왼쪽에 보라색 선이 보이지 않도록 수정했습니다.
   - **인용구 기능으로 blockquote 통합**: 인용구(Quote) 기능 클릭 시 기존의 개별 문단 치환 명령어 대신, 다중 문단을 단일 `blockquote`로 깔끔하게 묶어주는 브라우저 기본 `document.execCommand("indent")`를 바인딩하여 긴 보라색 세로 실선이 단일 블록으로 연결되어 나오도록 개편했습니다.
   - **TypeScript 컴파일 에러 완치**: `handleCustomIndent` 함수 상단에 `editorRef.current` null 가드 로직을 보강하여 TS18047 에러를 예방하고, selection 객체 대신 range 객체의 `intersectsNode` 함수(`range.intersectsNode(element)`)를 정상 호출하도록 수정하여 TS2339 오류를 완전히 해결했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` Vite 빌드가 무결하게 완료되었습니다. (Vite build 완료)
* **기능 정합성**: 
  - 들여쓰기 클릭 시 보라색 선 노출 없이 정상적으로 40px 씩 마진 들여쓰기가 실행됩니다.
  - 인용구 클릭 시 선택된 텍스트 영역이 단일 `blockquote` 블록 형태로 가두어져, 왼쪽 보라색 실선이 끊김 없이 길게 하나로 이어져 렌더링됩니다.

---

## 🔧 [신규] 마이페이지 프로필 이미지 업로드 및 자르기(Crop) 기능 추가 (2026-06-19)

세미 프로젝트에서 활용되었던 사용자 프로필 이미지 업로드, 크롭 뷰포트 드래그 제어, 줌 슬라이더, 그리고 최종 캔버스를 통한 base64 리사이징 및 압축 기법을 현재 프로젝트 마이페이지에 성공적으로 이식하고 DB 스펙을 보강했습니다.

### 1. 수정 및 조치 내역

1. **[V5__change_avatar_url_to_mediumtext.sql](file:///c:/final/dino-ecovision/backend/src/main/resources/db/migration/V5__change_avatar_url_to_mediumtext.sql) [NEW]**
   - 사용자 프로필용 Base64 데이터 크기(보통 수십 KB 이상)가 기존 `users` 테이블의 `avatar_url VARCHAR(255)` 한계를 초과하여 저장 시 데이터 짤림 예외가 발생하는 것을 예방하기 위해, 해당 컬럼의 데이터 타입을 `MEDIUMTEXT`로 승격하는 DB 마이그레이션 DDL을 추가했습니다.
2. **[User.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/user/entity/User.java) [MODIFY]**
   - JPA 엔티티 내 `avatarUrl` 필드의 컬럼 맵핑 어노테이션에 `columnDefinition = "MEDIUMTEXT"` 속성을 인가하여 Hibernate 빌드 검사 및 실행 시 스키마 Validation을 정상으로 통과하도록 대응했습니다.
3. **[MyPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/MyPage.tsx) [MODIFY]**
   - **이모지 & 이미지 하이브리드 지원**: 프로필 이모지와 Base64 인코딩 이미지를 구분하여 동적 렌더링하는 `renderAvatar` 헬퍼 함수를 추가하고 상단 프로필 요약 카드 및 모달 폼에 적용했습니다.
   - **크롭 뷰포트 및 제어 기능 이식**: 파일 업로드 시 GIF 여부를 체크하여 방어한 뒤, 180x180 뷰포트 내부에서 마우스 및 터치(모바일 호환) 드래그로 이미지를 위치시키고 `1.0x`~`3.0x` 줌 슬라이더를 통해 정교하게 이미지를 크롭할 수 있는 `react-query` 및 상태값 로직을 통합했습니다.
   - **압축 및 리사이즈**: "확인" 선택 시 HTML Canvas를 통해 이미지 비율을 감안하여 150x150 크기로 오프셋 드로잉 후 `0.7` 압축율의 JPEG base64를 생성하여 아바타 변경 데이터로 주입하게 구현했습니다.
   - **사진 제거**: 업로드된 커스텀 사진을 삭제하고 다시 기본 이모지 캐릭터(`🦖`) 상태로 롤백할 수 있는 초기화 기능을 추가했습니다.

### 2. 검증 결과
* **백엔드 빌드 무결성**: `./gradlew compileJava` 수행 결과 Java 컴파일이 100% 정상 완료되었습니다.
* **프론트엔드 빌드 무결성**: `npm run build` TypeScript 엄격 검증 및 Vite production 번들링을 무결하게 통과하였습니다.
* **동작 정합성**: 세미 프로젝트에서 사용하던 로컬 이미지 업로드 및 자르기(크롭) 바인딩 기능이 웜 세이지-크림 테마 모달 속에서 자연스럽고 완벽하게 작동합니다.

---

## 🔧 [신규] 게시글 상세/댓글 목록 내 작성자 미니 프로필 이미지 표시 및 마이페이지 연동 완료 (2026-06-19)

게시글 상세 페이지와 댓글 목록에서 각 작성자의 닉네임 왼쪽에 작은 프로필 이미지(아바타)를 렌더링하고, 클릭 시 해당 사용자의 마이페이지로 안전하게 이동하도록 구현했습니다. 또한 본인 소유가 아닌 마이페이지 조회 시 프로필 수정 버튼(`⚙️ 수정`)을 차단하고, 타인의 글 목록만 정확하게 필터링하여 보여주도록 로직을 보완했습니다.

### 1. 수정 및 조치 내역

1. **[CommunityDetailPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityDetailPage.tsx) [MODIFY]**
   - **작성자 영역 미니 프로필 연동**: 본문 상단 작성자 닉네임 영역에 `renderSmallAvatar(post.authorAvatarUrl || "")`를 추가하고, 닉네임과 프로필 이미지 영역 전체에 `onClick={() => navigate("/mypage/" + post.authorId)}`를 바인딩하여 마이페이지로 이동할 수 있도록 동선을 개선했습니다.
   - **댓글 목록 미니 프로필 연동**: 댓글 리스트 아이템의 작성자 닉네임 영역에 `renderSmallAvatar(comment.authorAvatarUrl || "")`를 표시하고, 클릭 시 `navigate("/mypage/" + comment.authorId)` 하도록 수정했습니다.

2. **[MyPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/MyPage.tsx) [MODIFY]**
   - **타인 글 목록 조회 버그 수정**: 기존에는 `fetchPosts(0, 100)` 결과를 클라이언트 사이드에서 `profile.nickname`으로 필터링하는 구조였으나, 비동기 데이터 갱신 시점 차이와 타인 프로필 조회 케이스로 인해 본인의 글 목록이 노출되는 버그가 있었습니다.
   - 이를 백엔드 API의 작성자 필터 파라미터(`fetchPosts(0, 100, undefined, "AUTHOR", nicknameToQuery)`)를 활용하여 타인의 글 목록만 정확하게 서빙받아 렌더링하도록 `loadMyPosts(targetNickname)` 흐름으로 리팩토링했습니다.
   - **타인 수정 권한 제어**: URL의 `userId` 파라미터와 현재 로그인한 사용자 ID를 대조하여 본인 페이지가 아닌 경우 `⚙️ 수정` 버튼이 완전히 차단되어 노출되지 않음을 보장했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build`를 성공적으로 통과하여 타입 체크 및 컴파일 에러가 없음을 확인했습니다.
* **백엔드 빌드 무결성**: `./gradlew compileJava` 수행 결과 Java 컴파일이 100% 정상 작동합니다.
* **기능 동작성**: 게시글 상세 및 댓글 목록에서 닉네임 옆에 작은 프로필(아바타/이모지)이 예쁘게 표시되며, 클릭 시 해당 사용자의 마이페이지로 정상 이동하고 타인 페이지일 경우 `⚙️ 수정` 버튼이 보이지 않습니다.

---

## 🔧 [신규] 포인트 획득 한계 로그 타임라인 숨김 및 게시글 목록 이미지 아이콘 표시 구현 완료 (2026-06-19)

일일 획득 한계에 도달하여 발생하는 0포인트 획득 이력(ex. `COMMENT_WRITE_LIMIT_EXCEEDED` 등)을 마이페이지 포인트 타임라인 및 탭 개수에서 제외하였으며, 게시글에 이미지가 포함된 경우 게시글 목록의 제목 왼쪽에 사진 SVG 아이콘(Heroicons Photograph 스펙)을 표시하여 시각적 구분이 가능하게 개선했습니다.

### 1. 수정 및 조치 내역

1. **[MyPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/MyPage.tsx) [MODIFY]**
   - **한계 초과 포인트 필터링**: `pointHistory` 상태값을 필터링하는 파생 상태 `activePointHistory`를 구현하여, `amount === 0` 이거나 사유가 `_LIMIT_EXCEEDED`로 끝나는 비정상 보상 로그를 포인트 획득 타임라인 목록 및 탭의 전체 개수 카운트에서 완전히 보이지 않도록 숨겼습니다.
   - **마이페이지 내 게시글 이미지 아이콘 적용**: 사용자가 작성한 게시글 목록 카드를 렌더링할 때, 본문(`post.content`) 내부에 이미지 태그(`<img`)가 포함되어 있는 경우 제목 왼쪽에 깔끔한 이미지 첨부 사진 SVG 아이콘을 표시하도록 구현했습니다.

2. **[CommunityPage.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/CommunityPage.tsx) [MODIFY]**
   - **커뮤니티 게시글 목록 이미지 아이콘 적용**: 전체 탄소 중립 커뮤니티 게시글 리스트를 렌더링할 때, 각 게시물의 본문에 이미지 태그가 감지되면 제목 바로 왼쪽에 이미지 첨부 SVG 아이콘을 나타내도록 하여 사용자들이 리스트 뷰에서 이미지가 포함된 게시물을 쉽게 구분할 수 있도록 직관성을 향상했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build`를 통해 컴파일러의 엄격 검사 및 빌드 최적화를 무사히 완료했습니다.
* **기능 동작성**:
  - 일일 포인트 획득 한계에 부딪혀 들어오는 `0 P` 적립 락 로그들이 포인트 타임라인 및 카운트에서 숨겨짐을 확인했습니다.
  - 작성글 목록 및 전체 게시글 목록 카드에서 에디터를 통해 이미지가 인젝션된 포스트들의 제목 왼쪽에 미려한 사진 아이콘이 올바르게 렌더링됩니다.

---

## 🔧 [신규] 대시보드 가상 시뮬레이션(더미) 데이터 생성 중단 및 API 키 검증 지원 (2026-06-19)

API 키(한전, 환경공단) 등록이 올바르게 작동하는지 한눈에 테스트하고 식별할 수 있도록, 기존에 데이터가 비어 있을 때 백엔드 및 서킷 브레이커에서 자동으로 가상 시뮬레이션(더미) 데이터를 디비에 적재해주던 Fallback 로직들을 완전히 제거하고, 프론트엔드 대시보드에 미려한 데이터 부재(Empty State) 디자인을 추가했습니다.

### 1. 수정 및 조치 내역

1. **[DataCollectionService.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/service/DataCollectionService.java) [MODIFY]**
   - **더미 데이터 Fallback 로직 전면 제거**: API 키가 없거나(`dummy-key`), 호출 시 예외/장애(Circuit Breaker Triggered) 발생 시 내부적으로 난수를 생성해 DB에 모의 통계를 흩뿌리던 `generateFallbackData` 및 `generateFallbackDataForRegionAndYear` 메쏘드들을 완전 삭제했습니다.
   - 키 누락 또는 통신 실패 시 더미 데이터 추가 없이 안전하게 로그(Warning/Error)만 출력하고 바로 반환되도록 흐름을 정돈했습니다.

2. **[DataController.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/controller/DataController.java) [MODIFY]**
   - **동적 적재 방지**: `getEnergySummary` 호출 시 DB 검색 결과가 부재할 때 실시간으로 `generateFallbackDataForRegionAndYear`를 기동하던 fallback 트리거 조건부를 제거했습니다. 이에 따라 DB에 데이터가 없으면 투명하게 빈 리스트(`[]`)를 반환합니다.

3. **[Dashboard.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/Dashboard.tsx) [MODIFY]**
   - **Empty State UI 추가**: 대시보드 데이터 조회 결과가 비어 있을 경우(`chartData.length === 0`), 텅 빈 차트를 보여주는 대신 **"분석 데이터가 존재하지 않습니다. 현재 DB에 적재된 실시간 에너지 사용량 정보가 없습니다. API 인증키가 정상적으로 등록되었는지 확인하거나, 수집 배치를 기다려 주세요."**라는 친절한 가이드 카드와 이모지를 서빙하도록 프론트 UI를 고도화했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build`를 성공적으로 통과하여 타입 체크 및 렌더러 정합성을 보장했습니다.
* **백엔드 빌드 무결성**: `./gradlew compileJava` 수행 결과 Java 빌드 컴파일이 에러 없이 무결하게 성공했습니다.
* **동작성**: 인증키가 비어 있거나 `dummy-key` 상태일 때 대시보드 조회 시 더 이상 임의 시뮬레이션 데이터가 DB에 생성되지 않고 프론트에서 "분석 데이터가 존재하지 않습니다" 경고 카드가 예쁘게 출력되어 API 키 동작 테스트를 투명하게 수행할 수 있습니다.

---

## 🔧 [신규] 대시보드 차트 툴팁 잘림 개선 및 실시간 데이터 리셋/재수집 기능 개발 (2026-06-19)

대시보드 차트에서 막대 오버 시 툴팁(말풍선)이 상단 및 양 끝(1월, 12월) 영역에서 잘리던 레이아웃 버그를 완치했습니다. 또한 DB에 남아 있는 기존 더미/테스트 데이터를 모두 클리어하고 등록된 API 키를 사용하여 2025년~2026년 실시간 실제 데이터를 즉시 수집해올 수 있도록 리셋 및 재수집 통합 백오피스 기능을 추가했습니다.

### 1. 수정 및 조치 내역

1. **[EnergyChart.tsx](file:///c:/final/dino-ecovision/frontend/src/components/charts/EnergyChart.tsx) [MODIFY]**
   - **상단 툴팁 잘림 해결**: 막대 정렬 Flex 영역의 상단 패딩을 `pt-6`에서 `pt-10`으로 확장하여, 최대 100%에 달하는 세로 막대의 상단과 스크롤 컨테이너 천장 사이에 툴팁이 렌더링될 수 있는 40px 수준의 수직 여백 공간을 완벽히 확보했습니다.
   - **좌/우 툴팁 잘림 해결**: 첫 번째 막대(1월, `idx === 0`)는 `left-0`으로 정렬하고, 마지막 막대(12월, `idx === 11`)는 `right-0`으로 정렬하며, 그 외의 월들은 `left-1/2 -translate-x-1/2`로 수평 중앙 정렬해주는 동적 정렬 클래스 `tooltipAlignClass`를 구현 및 바인딩했습니다. 이를 통해 스크롤 뷰의 좌/우 경계면을 침범하여 툴팁이 잘려 가려지던 현상을 원천 방지했습니다.

2. **[DataController.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/controller/DataController.java) [MODIFY]**
   - **데이터 초기화 및 수집 REST API 개발**: `POST /api/data/reset` API 엔드포인트를 추가했습니다. 해당 컨트롤러는 `energyUsageRepository.deleteAll()`로 기존 축적된 에너지/온실가스 원시 테이블 데이터를 전면 클리어한 후, 등록된 API 키를 기동하여 2025년(12개월) 및 2026년(1~6월) 한전 전력데이터 및 환경공단 온실가스 데이터를 순차적으로 자동 수집해 디비에 덮어씁니다.

3. **[dashboardApi.ts](file:///c:/final/dino-ecovision/frontend/src/api/dashboardApi.ts) & [Dashboard.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/Dashboard.tsx) [MODIFY]**
   - **API 재수집 동작 연동**: 대시보드 우측 상단 필터 영역 왼쪽에 테라코타 오렌지 톤의 **"🔄 API 재수집"** 버튼을 신설했습니다.
   - 버튼 클릭 시 확인 창(`confirm`)이 제공되며, 로딩 상태 스피너(`⏳ 수집 중...` 비활성화)와 상단 토스트 알림을 통해 안정적인 사용자 피드백을 안내합니다. 완료 시 `window.location.reload()`를 통해 최신 실제 수집본을 즉각 리드로잉합니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 TypeScript/Vite 엄격 번들링이 무결하게 성공했습니다.
* **백엔드 빌드 무결성**: `./gradlew compileJava` 빌드 검증을 100% 정상 통과했습니다.
* **기능 정합성**: 대시보드 차트의 막대 오버 시 1월/12월 및 최고치 막대에서도 툴팁 데이터가 가려지지 않고 깔끔하게 표출되며, 재수집 버튼을 통해 언제든 기존 테이블을 맑게 비우고 발급한 OpenAPI 인증키로 실데이터 테스트를 단행할 수 있습니다.

---

## 🔧 [신규] API 키 미등록 시 피드백 제공, 전국 쿼리 합산 및 모의 데이터 적재 지원 (2026-06-19)

공공 API 키가 등록되지 않은 상태에서 대시보드 "API 재수집" 단추를 누를 때 무작정 "수집 완료" 메시지가 노출되는 오안내를 수정하고, 키가 없어도 화면 흐름을 완벽히 테스트할 수 있도록 모의 데이터 강제 적재 루프를 신설했습니다. 또한, 전국 조건 조회 시 전체 통계 데이터가 합계로 정합성 있게 조회되도록 쿼리 로직을 보완했습니다.

### 1. 수정 및 조치 내역

1. **[EnergyUsageRepository.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/repository/EnergyUsageRepository.java) [MODIFY]**
   - **전국 쿼리 합계 구현**: 전국 조회 시 특정 지역으로 묶이지 않고 연도 패턴에 속한 모든 지역의 전력/가스/탄소 배출 총량을 합산하여 월별 순서대로 반환하는 `findMonthlyEnergyUsageSumAllRegions` 쿼리 메서드를 새로 추가했습니다.

2. **[DataController.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/controller/DataController.java) [MODIFY]**
   - **전국 데이터 분기 처리**: `getEnergySummary` API 진입 시 `regionCode`가 전국을 상징하는 `"1111000000"`일 경우, 새로 정의한 전국 합산 레포지토리 메서드를 호출하도록 분기 분할했습니다.
   - **`useMock` 매개변수 바인딩**: `POST /api/data/reset` API에 `useMock` boolean 쿼리 파라미터를 추가했습니다.
   - **API 키 사전 유효성 검증**: `useMock = false`로 호출할 시, 백엔드가 수집 전 KEPCO/KECO 인증키의 등록 여부를 선 검사하여 누락된 키가 있으면 400 에러 응답 및 사유를 즉시 반환하도록 방어했습니다.

3. **[DataCollectionService.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/service/DataCollectionService.java) [MODIFY]**
   - **키 상태 검사 (`getKeyStatus`)**: application.properties에 설정된 Key들이 비어 있거나 `dummy-key`인지 판단하여 `BOTH_MISSING`, `KEPCO_MISSING` 등을 반환하는 상태 조회 로직을 작성했습니다.
   - **모의 데이터 결정론적 Seeding (`generateFallbackDataForRegionAndYear`)**: API 키 부재 시에도 UI 화면을 채워 테스트할 수 있도록, 대상 지역 한글명("서울특별시 중구" 등) 기반으로 2025~2026년 18개월간의 월별 전력/가스 데이터를 현실적인 겨울/여름철 가중치를 적용하여 Seeding해주는 모의 데이터 적재 메서드를 완성했습니다.

4. **[Dashboard.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/Dashboard.tsx) [MODIFY]**
   - **💡 개발용 모의 데이터 적재 단추 신설**: DB에 적재된 데이터가 전혀 없어 "분석 데이터가 존재하지 않습니다" 가이드 카드가 출력되는 Empty State 영역 하단에, 누락된 키를 우회해 로컬을 테스트해 볼 수 있도록 `"💡 개발용 모의 데이터 적재하기"` 버튼을 배치했습니다.
   - **API 및 이벤트 래핑 버그 픽스**: `dashboardApi.ts`에서 `useMock`을 쿼리 스트링으로 실어 날려주도록 리팩토링하였고, React 버튼 `onClick`과 `handleResetAndFetch` 간의 MouseEvent 엉킴으로 인한 TypeScript 컴파일 에러(TS2322)를 화살표 함수 래핑을 통해 영구 조치했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build`를 통해 컴파일 검사가 100% 성공 통과했습니다.
* **백엔드 컴파일 무결성**: `./gradlew compileJava` 수행 결과 중괄호 불일치 오류 없이 성공적으로 컴파일을 마쳤습니다.
* **로컬 동작성**: API 키를 설정하지 않은 조원의 경우에도, 텅 빈 화면에서 버튼 클릭 한 번으로 "서울특별시 중구", "서울특별시 강남구", "경기도 수원시"에 대한 2025~2026년 모의 데이터가 테이블에 적재되어 정상적으로 차트 오버 툴팁과 전국 합산 통계를 확인하며 원활한 연동 테스트가 가능해졌습니다.

---

## 🔧 [신규] 게시글 내 공유 차트 스냅샷 데이터 파싱 버그 수정 (2026-06-19)

대시보드에서 공유 링크를 생성하여 커뮤니티 게시글 본문에 붙여넣었을 때, 임베드 차트 영역의 막대 그래프가 렌더링되지 않고 빈 공간 및 "월" 라벨만 노출되던 문제를 분석 및 수정 완료했습니다.

### 1. 수정 및 조치 내역

1. **[EmbedChart.tsx](file:///c:/final/dino-ecovision/frontend/src/components/charts/EmbedChart.tsx) [MODIFY]**
   - **데이터 포맷 불일치 해소**: 대시보드 공유 기능이 보내주는 `chartMetadata` JSON 문자열은 백엔드의 `EnergyUsageSumResponse[]` 형식이나, 기존 임베드 차트 렌더러는 독자적인 `ChartDataPoint[]` 가공 포맷을 예상하고 파싱을 진행하여 모든 변수들이 `undefined` (NaN) 처리되는 것을 발견했습니다.
   - **동적 가공 및 파서 구축**: 스냅샷 메타데이터 수신 시, `usageYearMonth` 필드가 감지되면 이를 백엔드 원시 타입(`EnergyUsageSumResponse`)으로 캐스팅한 후, 12달 데이터로 동적 가공(전기 사용량 및 전체 배출량 합산 계산)하여 `ChartDataPoint[]` 형식으로 알맞게 환산해주는 적응형 파서를 이식했습니다.
   - **하위 호환성 유지**: 혹시 이전의 수동 `ChartDataPoint[]` 규격의 데이터가 파싱되더라도 에러 없이 렌더링이 이어지도록 분기형 하위 호환 구조를 적용했습니다.
   - **막대 높이 렌더링 돔 구조 수정**: 개별 막대 항목의 컨테이너 `div`에 높이 속성인 `h-full` 및 `justify-end` 스타일이 지정되어 있지 않아, 자식 막대 바가 `%` 단위의 상대 높이를 계산하지 못해 렌더링되지 않던 돔 레이아웃 오류를 추가로 수정했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 TypeScript 엄격 체크 및 Vite build 번들링이 에러 없이 무결하게 성공했습니다.
* **동작성**: 임베드 차트가 메타데이터의 `usageYearMonth`와 `sumUsageAmount`를 정상적으로 인지하여 막대 그래프 높이와 `1월`~`12월` 라벨, 마우스 오버 시의 리치 툴팁까지 완벽하게 렌더링합니다.

---

## 🔧 [신규] 대시보드 필터 리스트 동적화 (실제 적재된 데이터 기준) (2026-06-19)

대시보드 상단 필터 영역의 연도 및 지역 선택 드롭다운(`select`) 옵션이 하드코딩되어 있어 적재되지 않은 데이터 영역을 쿼리하여 빈 화면이 출력되는 오해를 차단하고, 실제 데이터베이스(`energy_usages` 테이블)에 적재된 연도와 지역만 사용자에게 리스트로 제시되도록 동적화했습니다.

### 1. 수정 및 조치 내역

1. **[EnergyUsageRepository.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/repository/EnergyUsageRepository.java) [MODIFY]**
   - **고유 필터 데이터 추출**: DB의 `usage_year_month` 앞 4자리를 추출하여 고유 연도 목록을 정렬해 가져오는 `findDistinctYears` 쿼리와, DB에 저장된 고유 `region_code`(한글 지역명) 목록을 오름차순으로 가져오는 `findDistinctRegions` 쿼리를 추가했습니다.

2. **[DataFilterDto.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/dto/DataFilterDto.java) [NEW]**
   - 연도 및 지역 목록 데이터를 프론트엔드로 안전하게 운반하기 위한 전용 데이터 모델 DTO를 작성했습니다.

3. **[DataController.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/controller/DataController.java) [MODIFY]**
   - **`GET /api/data/filters` 엔드포인트 구현**: 적재된 데이터의 고유 연도와 지역 리스트를 JSON 데이터로 서빙해 주는 REST API를 매핑하고 구현했습니다.

4. **[dashboardApi.ts](file:///c:/final/dino-ecovision/frontend/src/api/dashboardApi.ts) & [Dashboard.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/Dashboard.tsx) [MODIFY]**
   - **동적 필터 옵션 연동**: 마운트 시점에 `fetchFilterOptions` API를 비동기 호출하여 `filterOptions` 상태에 바인딩하는 로직을 이식했습니다.
   - **렌더링 조건부 매핑**: 연도 및 지역 드롭다운 `<select>` 태그 내부의 `<option>` 목록을 하드코딩 문구 대신 상태값인 `filterOptions.years`와 `filterOptions.regions` 배열 기반으로 동적 순회 렌더링되도록 수정했습니다.

### 2. 검증 결과
* **백엔드/프론트엔드 빌드 무결성**: Java 컴파일 및 TypeScript/Vite 엄격 검사 빌드를 모두 성공적으로 마쳐 정적 정합성을 확인했습니다.
* **동작성**: 대시보드 화면 진입 시 실제로 공공 데이터 API로 수집되거나 적재된 연도("2025년", "2026년")와 실제 지역명들("서울특별시 중구" 등)만 드롭다운 필터 리스트에 예쁘게 동적으로 구성됩니다.

---

## 🔧 [신규] 대시보드 가스 데이터 전면 삭제 및 전기-가스 토글 삭제 (2026-06-22)

대시보드 상에서 가스 데이터를 완전히 배제하고, 기존의 전기-가스 토글 스위치를 제거하며, 데이터베이스 내 기존 적재된 가스 원시 데이터를 전면 제거했습니다.

### 1. 수정 및 조치 내역

1. **[EnergyChart.tsx](file:///c:/final/dino-ecovision/frontend/src/components/charts/EnergyChart.tsx) [MODIFY]**
   - **에너지원 토글 삭제 및 고정**: `activeTab` 상태를 `"ELECTRICITY"` 고정 상수로 변경하고, 에너지원(전기/가스) 선택 토글 마크업(버튼 그룹)을 제거하여 화면에서 전기 데이터만 고정 노출되도록 했습니다.

2. **[DataController.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/controller/DataController.java) [MODIFY]**
   - **온실가스 수집 경로 제거**: 데이터 리셋 및 자동 수집 메서드(`resetAndFetchData`) 내에서 환경공단 KECO 온실가스 데이터를 수집하는 `fetchAndSaveKecoCarbonData("2025")` 및 `fetchAndSaveKecoCarbonData("2026")` 호출부를 완전히 제외했습니다.

3. **[EnergyDataBatchJob.java](file:///c:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/region/scheduler/EnergyDataBatchJob.java) [MODIFY]**
   - **스케줄러 제거**: 매월 1일 새벽 3시에 가동하던 KECO 온실가스 데이터 수집 스케줄러 메서드(`runKecoCarbonCollectionBatch`)를 전면 삭제했습니다.

4. **데이터베이스 가스 데이터 전면 제거**
   - 데이터베이스 내 `energy_usages` 테이블에서 `energy_type = 'GAS'`인 행들을 완전히 딜리트 처리 완료하여, 시스템 내의 가스 데이터 잔재를 소거했습니다.

### 2. 검증 결과
* **백엔드 컴파일 무결성**: `./gradlew compileJava` 빌드 검증을 에러 없이 성공했습니다.
* **프론트엔드 빌드 무결성**: `npm run build` 결과 TypeScript/Vite 컴파일 빌드가 에러 없이 100% 정상 작동 완료되었습니다.
* **데이터베이스 상태**: `energy_usages` 테이블을 조회하여 `GAS` 타입의 데이터가 전혀 존재하지 않고 `ELECTRICITY`만 존재하는 무결함을 확인했습니다.

---

## 🔧 [신규] 대시보드 사용량/탄소배출량 토글 전환 애니메이션 구현 (2026-06-22)

대시보드 내 "사용량" 및 "탄소배출량" 토글 탭을 변경할 때 데이터 전환을 더 명확히 체감할 수 있도록 Y축 수치 라벨 및 단위 배지에 자연스러운 전환 애니메이션을 주입했습니다.

### 1. 수정 및 조치 내역

1. **[index.css](file:///c:/final/dino-ecovision/frontend/src/index.css) [MODIFY]**
   - **애니메이션 키프레임 및 클래스 정의**: 전환 시 텍스트가 아래에서 위로 살짝 슬라이드되면서 투명도가 변화하는 `@keyframes chartTextFadeIn` 효과와 이를 래핑하는 `.animate-chart-text` 유틸리티 클래스를 추가했습니다.

2. **[EnergyChart.tsx](file:///c:/final/dino-ecovision/frontend/src/components/charts/EnergyChart.tsx) [MODIFY]**
   - **Y축 수치 라벨 전환 연동**: Y축 라벨을 감싸는 `div`에 `key={viewMetric}` 속성과 `animate-chart-text` 클래스를 적용하여, 탭 토글 시 리액트가 해당 DOM 요소를 갱신하며 페이드-슬라이드 애니메이션을 매끄럽게 수행하도록 구현했습니다.
   - **단위(Unit) 전환 배지 추가**: 사용량과 탄소배출량의 차이를 명확히 구분할 수 있도록 차트 타이틀 우측에 단위 배지(`kWh`/`kgCO₂eq`)를 추가하고, 이에 대해 `key={viewMetric}`과 `animate-chart-text`를 연계해 단원 전환 피드백을 극대화했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 TypeScript 엄격 체크 및 Vite 번들링이 에러 없이 무결하게 성공했습니다.

---

## 🔧 [신규] 차트 막대 순차적 솟아오름(Staggered Grow-up) 애니메이션 구현 (2026-06-22)

대시보드 페이지 진입 및 차트가 화면에 노출되는 시점(마운트), 그리고 "사용량/탄소배출량" 토글 클릭 시 차트 막대들이 0% 높이에서 시작해 순차적으로 솟아오르는(Staggered Animation) 시각적 효과를 구현했습니다.

### 1. 수정 및 조치 내역

1. **[EnergyChart.tsx](file:///c:/final/dino-ecovision/frontend/src/components/charts/EnergyChart.tsx) [MODIFY]**
   - **애니메이션 트리거 상태 및 효과 추가**: `isAnimate` 상태를 도입하고 `useEffect` 훅에서 `requestAnimationFrame`을 통해 마운트 및 갱신 시 `isAnimate`를 `false` ➡️ `true`로 토글하는 애니메이션 프레임 제어 기법을 적용했습니다.
   - **순차적 딜레이(Stagger) 적용**: 세로 막대의 height 스타일을 `isAnimate ? heightPercent% : 0%`로 제어하고, 각 월 인덱스(`idx`)에 따라 `transitionDelay: idx * 25ms`를 인라인으로 주입하여, 왼쪽부터 오른쪽으로 파도타기 하듯 순차적으로 부드럽게 솟구치도록 연출했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 에러 없이 성공적으로 정적 리소스 빌드가 완료되었습니다.

---

## 🔧 [신규] 대시보드 다중 차트 비교 기능 구현 및 하단 공유 카드 제거 (2026-06-22)

대시보드 하단의 공유 가이드 카드를 제거하여 공간을 비우고, 사용자가 다중 지역/연도 데이터셋(최대 5개)을 직접 차트 비교 리스트에 담아 단일 차트 내에서 꺾은선형(LineChart) 그래프로 동시에 비교 분석할 수 있는 특화 기능을 구현했습니다.

### 1. 수정 및 조치 내역

1. **[Dashboard.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/Dashboard.tsx) [MODIFY]**
   - **하단 안내 영역 제거**: 하단에 잔존하던 "이 멋진 대시보드를 커뮤니티에 자랑해보세요!" 홍보 카드 및 "차트 스냅샷 공유하기" 버튼 영역을 완전히 삭제했습니다.
   - **비교 리스트 상태 및 제어 로직 구현**: `compareList` 상태를 추가하고, 중복 추가 방지 및 최대 5개 등록 제한 유효성 체크를 결합한 `handleAddCompare` 및 `handleRemoveCompare` 핸들러를 연동했습니다.
   - **비교군 칩(Badge) 목록 렌더링**: 필터 하단 영역에 현재 비교 대상들의 목록과 각각의 고유 매칭 색상을 표기하는 삭제 가능 리스트 UI를 이식했습니다.
   - **비교 모드 UI 분기**: 비교 리스트가 활성화되어 있을 때, 단일 지역 전력 사용량 카드 대신 비교 대상들의 지역별 연간 총 사용량을 세련되게 격자 그리드로 표기하고, 하단 차트 영역에 신규 `CompareChart` 컴포넌트를 마운트하도록 설계했습니다.

2. **[CompareChart.tsx](file:///c:/final/dino-ecovision/frontend/src/components/charts/CompareChart.tsx) [NEW]**
   - **다중 비교선(Line) 렌더러 구축**: Recharts의 `ResponsiveContainer`, `LineChart`, `Line` 컴포넌트를 연동하여 1월부터 12월까지 최대 5개 비교군의 흐름을 겹쳐 그리는 반응형 차트 컴포넌트를 생성했습니다.
   - **보태니컬 웜 세이지 테마**: 비교선별 고유 식별 색상 및 커스텀 마우스 호버 툴팁(`CustomTooltip`), 전력 사용량(`kWh`) ↔ 탄소 배출량(`kgCO₂eq`) 토글 제어를 완벽 매핑했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build`를 성공적으로 마치고, Recharts 타입 및 TypeScript 엄격 검증을 모두 정상 통과했습니다.

---

## 🔧 [신규] 비교 차트 시각화 타입 토글 및 다중 비교 공유/임베드 구현 (2026-06-22)

지역 비교 차트에서 꺾은선뿐만 아니라 월별 나열형 막대 그래프(Grouped Bar) 형태도 선택할 수 있도록 개선하고, 이 다중 비교 분석 화면 전체를 스냅샷 공유하여 커뮤니티 본문에서도 동일한 형태의 다중 비교 차트로 정밀 복원 렌더링되도록 기능을 확장했습니다.

### 1. 수정 및 조치 내역

1. **[CompareChart.tsx](file:///c:/final/dino-ecovision/frontend/src/components/charts/CompareChart.tsx) [MODIFY]**
   - **차트 형태 토글 기능 제공**: `chartType` 상태를 부모 `Dashboard`에 상태 위임(Lifting State Up)하여 넘겨받고, 차트 헤더 영역에 `📈 꺾은선` / `📊 막대` 토글 버튼 그룹을 배치했습니다.
   - **다중 막대 그래프(BarChart) 구현**: Recharts의 `BarChart` 및 `Bar` 컴포넌트를 연계하여, 탭 선택 시 1월~12월 격자 내에 비교군들의 전력/탄소 수치가 나란히 출력되도록 그룹형 막대 차트를 매핑했습니다.

2. **[Dashboard.tsx](file:///c:/final/dino-ecovision/frontend/src/pages/Dashboard.tsx) [MODIFY]**
   - **다중 스냅샷 메타데이터 구성**: 비교 리스트 활성화 시 `🔗 공유하기`를 누르면, 스냅샷 API 전송 인자로 `chartType: "COMPARE"`와 함께 `{ type: compareChartType, compareList }` 구조가 그대로 포함된 JSON 문자열을 생성하여 전송하도록 핸들러(`handleShareSnapshot`)를 변경했습니다.
   - 스냅샷 생성 제목 역시 `"서울특별시 중구 (2025년) 외 1개 비교 분석"`처럼 동적으로 자동 조립되도록 고도화했습니다.

3. **[EmbedChart.tsx](file:///c:/final/dino-ecovision/frontend/src/components/charts/EmbedChart.tsx) [MODIFY]**
   - **다중 비교 임베드 차트 복원**: 스냅샷의 `chartMetadata`를 읽어 파싱할 때 `compareList` 형태가 감지되면 `isCompareMode`로 분기 작동되게 리팩토링했습니다.
   - 공유 당시 저장한 차트 유형(`parsed.type`: LINE 또는 BAR)을 인식하여, 게시글 상세 보기 안에서도 동일한 다중 비교 꺾은선형 혹은 다중 나열 막대형 그래프로 완벽 복원되어 반응형(`ResponsiveContainer`)으로 그려지도록 구현했습니다.

### 2. 검증 결과
* **프론트엔드 빌드 무결성**: `npm run build` 결과 TypeScript/Vite 컴파일 빌드가 100% 에러 없이 통과 완료되었습니다.

