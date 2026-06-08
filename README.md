# 🦖 dino-ecovision

**EcoVision: Dino Revival** 통합 플랫폼의 공식 개발 저장소입니다.  
본 프로젝트는 **에너지 데이터 시각화**와 **실시간 탄소 시계 연계형 공룡 육성 게이미피케이션**이 결합된 친환경 웹 애플리케이션입니다.

---

## 📁 디렉토리 구조 (Directory Layout)

```
dino-ecovision/
├── backend/            # Java 17 / Spring Boot 3.5.x 백엔드
├── frontend/           # React + TypeScript + Vite 프론트엔드
├── database/           # MySQL 8.0 DDL & DML 시드 데이터
│   ├── schema.sql      # 데이터베이스 테이블 생성 스크립트
│   └── data.sql        # 미션 마스터 및 공룡 템플릿 마스터 데이터
└── README.md           # 본 문서
```

---

## 🛠️ 기술 스택 (Tech Stack)

### 백엔드 (Backend)
* Java 17
* Spring Boot 3.5.x
* Spring Security & JWT
* Spring Data JPA & QueryDSL
* MySQL Driver (Connector/J)

### 프론트엔드 (Frontend)
* React 18+ (Vite)
* TypeScript
* Tailwind CSS
* Zustand (전역 상태 관리)
* Recharts (데이터 시각화)
* Axios

### 데이터베이스 (Database)
* MySQL 8.0 (InnoDB, utf8mb4)

---

## 🚀 로컬 실행 방법 (Local Run Guide)

### 1. 데이터베이스 셋업 (Database Setup)
`database/schema.sql`과 `database/data.sql`을 실행하여 로컬 MySQL 서버에 스키마와 기본 데이터를 기동시킵니다.

### 2. 백엔드 실행 (Backend Boot)
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
