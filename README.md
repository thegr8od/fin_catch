<div align="center">

# Fin catch 😸

**개인 맞춤형 금융 교육 서비스**

**FinCatch**는 사용자의 소비 데이터를 분석하여 금융 습관을 시각적으로 제공합니다.

 **맞춤형 금융 교육 콘텐츠**를 제공하여 사용자의 관심 분야를 공부할 수 있습니다.

개인의 소비 패턴을 **분석, 학습 방향을 제안**합니다.

금융 배틀을 통해 포인트를 얻고 다양한 고양이를 획득하세요!

[Fin catch 이용하기](http://j12d108.p.ssafy.io)

[노션 바로가기](https://apricot-bunny-1cb.notion.site/FinCatch-1a4faf2ac15080329d55f99fe2cb0490?pvs=74)

</div>


# 📑 목차 
- [주요 기능](#-주요-기능)
- [기술 스택](#️-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [설치 및 실행 방법](#️-설치-및-실행-방법)
- [담당 파트](#-담당-파트)


# 🚀 주요 기능

## 💻 화면
### 1. 메인화면
![메인 화면](docs/기능/게임시작.webp)

### 2. Oauth 로그인
![Oauth 로그인](docs/기능/로그인.webp)

### 3. 소비 패턴 분석
![소비 패턴 분석](docs/기능/계좌연동 및 분석.webp)

### 3-1. AI 소비 분류
![AI 소비 분류](docs/기능/AI 소비 분류.webp)

### 4. 소비 패턴 퀴즈
![소비 패턴 퀴즈](docs/기능/소비분석퀴즈.webp)

### 5. 사용자 대결 
![사용자 대결](docs/기능/사용자게임.webp)

### 6. 오답 노트
![오답 노트](docs/기능/오답노트.webp)

### 7. 캐릭터 뽑기
![캐릭터 뽑기](docs/기능/캐릭터뽑기.webp)

### 8. 캐릭터 선택
![캐릭터 선택](docs/기능/캐릭터선택.webp)


## 🛠️ 기술 스택

### 💻 프론트엔드
<table>
  <tr>
    <td><img src="docs/icons/javascript.png" width="20"/> JavaScript</td>
    <td><img src="docs/icons/react.png" width="20"/> React.js</td>
  </tr>
</table>

### ⚙️ 백엔드
<table>
  <tr>
    <td><img src="docs/icons/springboot.png" width="20"/> SpringBoot</td>
    <td><img src="docs/icons/hibernate.png" width="20"/> Hibernate</td>
    <td><img src="docs/icons/fastapi.png" width="20"/> FastAPI</td>
    <td><img src="docs/icons/springsecurity.png" width="20"/> SpringSecurity</td>
  </tr>
</table>

### 🗄️ 데이터베이스
<table>
  <tr>
    <td><img src="docs/icons/postgresql.png" width="20"/> PostgreSQL</td>
    <td><img src="docs/icons/redis.png" width="20"/> Redis</td>
  </tr>
</table>

### ☁️ 인프라
<table>
  <tr>
    <td><img src="docs/icons/aws.png" width="20"/> AWS</td>
    <td><img src="docs/icons/docker.jpg" width="20"/> Docker</td>
    <td><img src="docs/icons/nginx.png" width="20"/> Nginx</td>
    <td><img src="docs/icons/jenkins.png" width="20"/> Jenkins</td>
    <td><img src="docs/icons/sonarqube.png" width="20"/> SonarQube</td>
  </tr>
</table>

### 🔭 모니터링
<table>
  <tr>
    <td><img src="docs/icons/prometheus.png" width="20"/> Prometheus</td>
    <td><img src="docs/icons/grafana.png" width="20"/> Grafana</td>
    <td><img src="docs/icons/loki.png" width="20"/> Loki</td>
  </tr>
</table>

## 📂 프로젝트 구조

### 📦 프론트엔드
```
src/
├── assets/
├── components/
├── pages/
├── constants/
├── store/
├── api/
├── pages/
└── data/
```

### 🖥️ 백엔드
1. Spring Boot
```
finbattle/
├── domain/                   # 도메인 기반 비즈니스 로직 모음
│   ├── ai/                   # AI 추천, 분석 기능
│   ├── banking/              # 금융/거래 처리 로직
│   ├── cat/                  # 고양이 정보 관리 및 연결
│   ├── chat/                 # 채팅 기능
│   ├── game/                 # 게임 기능 처리
│   ├── member/               # 회원 정보 및 인증 관리
│   ├── oauth/                # OAuth 인증 처리
│   ├── quiz/                 # 퀴즈 기능
│   ├── room/                 # 채팅방/게임방 관리
│   └── token/                # JWT/AccessToken 관련 처리
│
├── global/
│   └── common/               # 전역 공통 모듈
│       ├── config/           # 애플리케이션 설정 (WebMvc, Security 등)
│       ├── exception/        # 전역 예외 처리
│       ├── filter/           # 인증 필터 등 서블릿 필터
│       ├── handler/          # 인증 실패, 예외 핸들러
│       ├── metrics/          # Prometheus, Grafana 메트릭 연동
│       ├── model/            # 공통 모델 및 DTO
│       ├── redis/            # Redis 캐싱, 저장소
│       ├── service/          # 공용 서비스 계층
│       └── Util/             # 유틸 클래스 모음 (DateUtil, StringUtil 등)
│
└── FinbattleApplication.java # 스프링부트 메인 실행 클래스

```

2. AI
```
ai/
├── app/
│   ├── models/
│   │   ├── best_booster.model
│   │   ├── category_mapping.joblib
│   │   ├── final_vectorizer.joblib
│   │   ├── label_encoder.joblib
│   │   ├── vectorizer.joblib
│   ├── __init__.py
│   ├── main.py
├── requirements.txt
```

### 🏗️ 아키텍처
![아키텍처 다이어그램](docs/아키텍처.png)

### 📚 ERD
![ERD 다이어그램](docs/ERD.png)

### ⚙️ 설치 및 실행 방법
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
./gradlew bootRun
```


## ✨ 담당 파트
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/thegr8od"><img src="https://avatars.githubusercontent.com/u/127323247?v=4" alt="thegr8od" width="100" height="100" style="object-fit: cover; border-radius: 10px;"></a>
      <br />
      <strong>김승준</strong>
      <br />
      😎 Reader | 🔧 BE 
    </td>
    <td align="center">
      <a href="https://github.com/YDaewon"><img src="https://avatars.githubusercontent.com/u/138689677?v=4" alt="YDaewon" width="100" height="100" style="object-fit: cover; border-radius: 10px;"></a>
      <br />
      <strong>양대원</strong>
      <br />
      🔧 BE | 🛠 Infra
    </td>
    <td align="center">
      <a href="https://github.com/DonghyeonKwon"><img src="https://avatars.githubusercontent.com/u/93506933?v=4" alt="DonghyeonKwon" width="100" height="100" style="object-fit: cover; border-radius: 10px;"></a>
      <br />
      <strong>권동현</strong>
      <br />
      🔧 BE | 🛠 Infra
    </td>
    <td align="center">
      <a href="https://github.com/KimByeongNyeon"><img src="https://avatars.githubusercontent.com/u/104885355?v=4" alt="KimByeongNyeon" width="100" height="100" style="object-fit: cover; border-radius: 10px;"></a>
      <br />
      <strong>김병년</strong>
      <br />
      💻 FE
    </td>
    <td align="center">
      <a href="https://github.com/kim13245"><img src="https://avatars.githubusercontent.com/u/61528451?v=4" alt="kim13245" width="100" height="100" style="object-fit: cover; border-radius: 10px;"></a>
      <br />
      <strong>김세현</strong>
      <br />
      💻 FE
    </td>
    <td align="center">
      <a href="https://github.com/cosmos2123"><img src="https://avatars.githubusercontent.com/u/185461286?v=4" alt="cosmos2123" width="100" height="100" style="object-fit: cover; border-radius: 10px;"></a>
      <br />
      <strong>김태호</strong>
      <br />
      💻 FE
    </td>
  </tr>
</table>


### 공통 파트
- Git 컨벤션 준수
- 코드 리뷰 진행
- 기술 문서 작성

### 회고
김승준
```
일한거 기록
```
------------------------------------------------
본인 할말 작성


양대원
```
일한거 기록
```
------------------------------------------------
본인 할말 작성


권동현
```
일한거 기록
```
------------------------------------------------
본인 할말 작성


김병년
```
일한거 기록
```
------------------------------------------------
본인 할말 작성


김세현
```
일한거 기록
```
------------------------------------------------
본인 할말 작성


김태호
```
일한거 기록
```
------------------------------------------------
본인 할말 작성


📌 기타 정보
API 문서
