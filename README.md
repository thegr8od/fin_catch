# 프로젝트 코드 컨벤션

## 컴포넌트 네이밍

- 컴포넌트 파일명은 파스칼 케이스(PascalCase)를 사용합니다.

  - 예: `PixiTest.tsx`, `GameBoard.tsx`, `UserProfile.tsx`

- 컴포넌트 함수명도 파스칼 케이스를 사용합니다.
  - 예: `function PixiTest() { ... }`

## 디렉토리 구조

- 컴포넌트는 `src/components` 디렉토리에 위치합니다.
- 페이지 컴포넌트는 `src/pages` 디렉토리에 위치합니다.
- 유틸리티 함수는 `src/utils` 디렉토리에 위치합니다.
- 훅은 `src/hooks` 디렉토리에 위치합니다.

## 스타일링

- Tailwind CSS를 사용하여 스타일링합니다.
- 복잡한 스타일은 별도의 CSS 모듈로 분리합니다.

## 상태 관리

- 로컬 상태는 React의 `useState`와 `useReducer`를 사용합니다.
- 전역 상태는 Redux Toolkit을 사용합니다.

## 타입스크립트

- 모든 컴포넌트와 함수에 타입을 명시합니다.
- `any` 타입 사용을 지양합니다.
- 인터페이스와 타입은 해당 파일 내에 정의하거나, 공통 타입은 `src/types` 디렉토리에 위치시킵니다.

## 비동기 처리

- 비동기 작업은 async/await를 사용합니다.
- API 호출은 서비스 레이어로 분리합니다.

## 테스트

- 컴포넌트 테스트는 Jest와 React Testing Library를 사용합니다.
- 테스트 파일은 테스트 대상 파일과 동일한 디렉토리에 위치시키고, `.test.tsx` 또는 `.spec.tsx` 확장자를 사용합니다.
  .
