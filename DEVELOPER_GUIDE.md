# 🌿 EcoVision: Dino Revival 개발자 통합 가이드 및 3주차 진행 현황

본 문서는 **EcoVision: Dino Revival** 프로젝트 백엔드/프론트엔드/DB 인프라의 통합본(`feature/db-infra-integration`) 기준 **수정 사항, Docker 실행 방법, 그리고 3주차 개발 진행 상황**을 정리한 통합 개발자 안내서입니다.

---

## 1. 프로젝트 주요 수정 및 개선 내역 (백엔드/빌드)

다른 브랜치들의 통합 및 로컬 검증 과정에서 발생한 컴파일/런타임 에러를 아래와 같이 수동 보완하였습니다.

1. **JPA 엔티티 명칭 충돌 해결 (Region 중복 제거):**
   * `domain/user/entity/Region.java`와 `domain/region/entity/Region.java`가 동일한 `regions` 테이블을 매핑하여 중복 엔티티 기동 오류가 발생했습니다.
   * `user` 패키지 하위의 `Region.java`를 삭제하고, `region` 패키지의 `Region.java`로 엔티티 모델을 일원화한 후 화면 표시용 메소드(`displayName()`)를 병합했습니다.
2. **User 엔티티 컴파일 에러 해결 (오버로드 추가):**
   * `AuthService.java`에서 로그인 시 매개변수 없는 `user.isOnboardingRequired()`를 호출하고 있었으나, 엔티티에는 `isOnboardingRequired(boolean hasDino)`만 존재해 컴파일이 실패했습니다.
   * [User.java](file:///C:/final/dino-ecovision/backend/src/main/java/com/ecovision/app/domain/user/entity/User.java) 파일에 `nickname == null || regionId == null`을 판단하는 인자 없는 `isOnboardingRequired()` 오버로드 메서드를 구현하여 완벽히 해결했습니다.
3. **@Param 어노테이션 임포트 교정:**
   * `CarbonIntensityLogRepository`에서 Spring Data의 쿼리 파라미터 어노테이션이 잘못된 패키지(`org.springframework.data.param.Param`)로 임포트되어 있던 버그를 공식 패키지인 `org.springframework.data.repository.query.Param`으로 교정했습니다.
4. **Javadoc 주석 컴파일 버그 교정:**
   * 각 스케줄러 클래스의 크론 탭 주석 블록(`/** ... */`) 내에 표기된 `*/5`가 Javadoc 주석 종료 기호(`*/`)로 파서에서 오인되는 문제를 방어하기 위해 `* / 5` 형식으로 격리 처리하였습니다.
5. **빌드 의존성 및 Redis 설정 보강:**
   * `build.gradle`에 Redis 클라이언트(`spring-boot-starter-data-redis`)를 추가하고, `jjwt` 라이브러리를 최신 0.13.0 버전으로 복원했습니다.
   * [application.properties](file:///C:/final/dino-ecovision/backend/src/main/resources/application.properties) 하단에 `kpx.mock-mode=true` 옵션을 기입하여 외부 API 키가 없어도 로컬 개발 속도가 저하되지 않도록 구성했습니다.

---

## 2. Docker 작업 환경 설정 및 실행 방법

### 2.1 사전 요구 사항
* PC에 **Docker Desktop**이 설치 및 실행되어 있어야 합니다.

### 2.2 인프라 컨테이너 실행 (MySQL & Redis)
프로젝트 루트 디렉토리(`C:\final\dino-ecovision`)에 포함된 `docker-compose.yml`을 사용하여 서비스를 구동합니다.

```powershell
# 1. 프로젝트 루트로 이동
cd C:\final\dino-ecovision

# 2. MySQL 및 Redis 컨테이너 백그라운드 구동
docker-compose up -d
```
* **MySQL:** `3306` 포트 바인딩, Root 비밀번호 `1111`
* **Redis:** `6379` 포트 바인딩 (인증/리프레시 토큰 관리용)
* *주의:* 로컬 Windows에 직접 설치된 MySQL 서비스가 3306 포트를 선점하고 있다면, 관리자 권한 PowerShell에서 `Stop-Service -Name MySQL80`을 실행해 로컬 서비스를 일시 중지해야 합니다.

### 2.3 데이터베이스 마이그레이션 및 초기화
스프링 부트 기동 시 `spring.jpa.hibernate.ddl-auto=update` 옵션에 의해 스키마가 자동 반영되나, 미션 기본 배치 정보 및 테스트용 초기 세팅을 완료하려면 [data.sql](file:///C:/final/dino-ecovision/database/data.sql)이 로드되어야 합니다.
* 컨테이너 최초 기동 후 백엔드를 실행하면 데이터베이스 스키마와 데이터 적재가 완료됩니다.

---

## 3. 로컬 프로젝트 실행 방법 (PowerShell)

### 3.1 백엔드 (Spring Boot) 기동
```powershell
cd C:\final\dino-ecovision\backend
gradle bootRun
```
* 서버 기동 성공 시 `Tomcat started on port 8080 (http)` 로그가 출력됩니다.

### 3.2 프론트엔드 (React / Vite) 기동
```powershell
cd C:\final\dino-ecovision\frontend
npm install      # 최초 구동 시 1회 실행
npm run dev
```
* 브라우저에서 `http://localhost:5173`으로 접속하여 테스트할 수 있습니다.

---

## 4. 3주차 개발 기능별 완료 여부 체크리스트

설계서(R&R) 상에 정의된 3주차 세부 구현 Task의 현재 완료 상태입니다.

| 기능 영역 (Epic) | 세부 기능 요약 | BE 구현 | FE 구현 | 상태 및 비고 |
| :--- | :--- | :---: | :---: | :--- |
| **Epic 1: Auth & User** | 회원가입 및 자체 JWT 로그인/로그아웃 | **[x]** | **[x]** | 회원가입/로그인 토큰 검증 연동 완료 |
| | 사용자 정보 온보딩 (닉네임/행정동) | **[ ]** | **[x]** | FE 화면 완성, BE 컨트롤러 추가 구현 필요 |
| | 최초 1회 공룡 알 분양 등록 | **[ ]** | **[x]** | FE 알 선택 화면 완성, BE Entity/API 작성 필요 |
| **Epic 2: Carbon Clock** | 5분 주기 KPX 전력 수집 및 로그 적재 | **[x]** | - | 스케줄러 동작 완료 |
| | 원형 탄소 시계 및 환경 등급 렌더링 | **[x]** | **[x]** | FE 퍼블리싱 완료, API 통신 바인딩 단계 |
| **Epic 4: Missions** | 자정 미션 자동 배정 스케줄러 | **[x]** | - | 카테고리 중복 방지 배정 스케줄러 완료 |
| | 오늘의 미션 카드 UI 퍼블리싱 | - | **[x]** | 화면 레이아웃 완성 |
| | 미션 완료 자진신고 정산 모달 | **[ ]** | **[x]** | FE 모달 완성, BE 포인트 적립 및 진화 트랜잭션 필요 |
| **Epic 5: Dungeon** | 전력 예비율 10% 미만 감지 자동 발령 | **[x]** | - | 비상 상황 탐지 스케줄러 작동 완료 |
| | 던전 경고 오버레이 및 타이머 | - | **[x]** | FE 화면 및 오렌지 사이렌 퍼블리싱 완료 |
| **Epic 7: Guild & Leader** | 지역 변경 감지 동네 길드 자동 가입 리스너 | **[x]** | - | 이벤트 가입 감지 리스너 구현 완료 |
| | 5분 주기 리더보드 스코어 집계 캐시 | **[x]** | - | QueryDSL 집계 및 캐시 스케줄러 완료 |
| | 다차원 순위표 탭 리더보드 | - | **[x]** | FE 탭 랭킹 화면 퍼블리싱 완료 |
| **Epic 8: Admin** | 온실가스 데이터 CSV 대량 벌크 업로드 | **[x]** | - | 어드민 CSV 파일 파싱 적재 API 완료 |
| | 던전 테스트 수동 발령 API (백도어) | **[x]** | - | Mock API 및 수동 제어 통로 마련 완료 |
