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
    <td><img src="docs/icons/springsecurity.png" width="20"/> SpringSecurity</td>
    <td><img src="docs/icons/hibernate.png" width="20"/> Hibernate</td>
    <td><img src="docs/icons/fastapi.png" width="20"/> FastAPI</td>
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
- JIRA 이슈 관리
- 코드 리뷰 진행
- 기술 문서 작성

### 회고
김승준
```
Okt와 TfidfVectorizer로 상호명 데이터 전처리
Optuna와 XGBoost로 상호명 분류 모델 구축
퀴즈 API 구현
OpenAI API를 활용한 맞춤형 퀴즈, 오답노트 서비스 구현
개발 일정 및 이슈 관리
영상 촬영 및 편집
프로젝트 산출물 관리
```
------------------------------------------------
- 팀장으로서 기획과 원활한 일정 관리를 최우선으로 신경 썼습니다. 
- 각자의 역할을 책임감 있게 수행해준 팀원들에게 감사드리며, AI를 최대한 활용해 서비스를 제공해볼 수 있었던 값진 경험이었습니다.


양대원
```
RDB 설계
Backend 프로젝트 구조 및 기술 아키택처 설계
OAuth2를 활용한 소셜 로그인
JWT + Spring Security를 적용해 보안성 강화
Prometheus, Grafana, Loki를 활용해 모니터링 시스템 구축
Finance API를 활용한 금융 제공 서비스 구축
FastAPI AI 분석 기능 연동
Swagger 페이지 구축 및 작성
```
------------------------------------------------
- 보안을 담당하는 Security와 OAuth2를 해보면서 기초적이지만 중요한 것들을 배워볼 수 있었습니다.
- 금융망 API를 직접 다루고, 팀원들과 토론하고 협업하며 더 나은 방향으로 나아가고자 했습니다.
- 모두들 적극적으로 임해주셔서 무사히 프로젝트를 마칠 수 있었습니다. 감사합니다.


권동현
```
Room API 구현
Game Service 구현
Stomp JWT handler 구현
Jira 이슈 관리
시스템 아키텍처 설계
Jenkins CI/CD Pipeline 구축
포팅 메뉴얼 및 시나리오 문서 작성
```
------------------------------------------------
- 이번 프로젝트에서 게임 파트 개발을 맡으며 WebSocket과 Redis Pub/Sub을 새로 익혀 직접 활용할 수 있었습니다.
- 사전에 인프라 관련 지식을 공부해 둔 덕분에 인프라 구조 설계도 원활하게 진행할 수 있었습니다.
- 6주 동안 팀원 모두가 각자의 역할에 최선을 다한 결과, 높은 완성도의 결과물을 만들 수 있었습니다. 함께 고생한 팀원들에게 깊이 감사드리며, 이번 경험을 통해 한층 더 성장할 수 있었던 값진 시간이었습니다.


김병년
```
와이어 프레임 설계
Frontend 프로젝트 구조 및 스켈레톤 설계
소셜로그인 및 회원 관리 구현
redux를 활용한 상태 관리
Dumb-Component 구조 설계 및 구축
UI-UX 설계
WebSocket + STOMP 클라이언트 연결 훅 설정
Axios 활용 API 연동 템플릿 설계 및 데이터 렌더링
이미지 렌더링 최적화 (메모이제이션 기법 도입)
프레젠테이션
```
------------------------------------------------
- 예전에 구현에 실패했던 WebSocket 기능을 제대로 다시 학습 및 구현을 할 수 있는 계기가 되어서 좋았습니다.
- 프론트엔드 입장에서 최적화를 하기 위해 고민을 많이 해봤던 프로젝트 였던 것 같습니다.
- 6주간 모든 팀원들이 각자의 위치에서 최선을 다해주어서 너무 재밌고 효율적으로 개발할 수 있었던 것 같았습니다.


김세현
```
와이어 프레임 설계
UI-UX 설계
캐릭터 애니메이션 구현
애니메이션 렌더링 최적화
1:1 대결 페이지 로직 및 UI 구현
  - 이벤트 수신 및 캐릭터 행동
  - 게임문제 수신 및 표시
  - 게임 결과 화면 표시
  - 채팅 로직 + 정답 송신 구현
발표 자료 제작
```
------------------------------------------------
- 프론트엔드 구조에 대해 많이 배울 수 있었습니다
- Smart-Dumb 패턴에 대해 공부해 볼 수 있었습니다.
- 캐릭터 랜더링 주기를 관리하는게 특히 힘들었습니다. Memo의 필요성을 많이 느꼈습니다.
- AI(커서)에 의존을 많이 했던 부분이 아쉬웠습니다. AI에 맡기면서 미처 자세히 다룰 수 없었던 코드를 점검해야겠다는 필요성을 느낍니다.
- 팀원들이 맡은 부분 이상을 해내 주어서 제가 맡은 부분에만 집중할 수 있었습니다. 이 부분에 있어서 팀원들께 크게 감사합니다.


김태호
```
UI-UX 설계
사용자 오답노트, 퀴즈 결과 
AI 퀴즈 페이지 구현
영상 포트폴리오 제작
```
------------------------------------------------
- 첫 프론트 엔드 담당이라 공부할 점이 많았습니다.
- 특히 pixijs와 typescript는 처음 접해봤는데 팀원들의 도움으로 무사히 프로젝트를 끝낼 수 있었습니다.


