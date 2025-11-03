# Firebase 설정 가이드

## Firebase Console에서 가져온 설정을 여기에 붙여넣으세요

1. Firebase Console (https://console.firebase.google.com/)에서 프로젝트 생성
2. 프로젝트 설정 > 일반 > 내 앱 > 웹 앱에서 설정 확인
3. 아래 예시를 참고하여 `js/firebase-config.js` 파일을 수정하세요

## 예시:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

## 설정 단계:

### 1. Firebase 프로젝트 생성
- https://console.firebase.google.com/ 접속
- "프로젝트 추가" 클릭
- 프로젝트 이름 입력 (예: 20gilf-golf)

### 2. Authentication 활성화
- 왼쪽 메뉴에서 "빌드" > "Authentication" 클릭
- "시작하기" 버튼 클릭
- "Sign-in method" 탭에서 "Google" 활성화

### 3. Firestore Database 생성
- 왼쪽 메뉴에서 "빌드" > "Firestore Database" 클릭
- "데이터베이스 만들기" 클릭
- 테스트 모드로 시작 선택
- 위치 선택 (asia-northeast3 추천 - 서울)

### 4. 웹 앱 설정
- 프로젝트 개요에서 웹 아이콘(`</>`) 클릭
- 앱 닉네임 입력
- Firebase SDK 구성 코드 복사
- `js/firebase-config.js` 파일에 붙여넣기

### 5. 보안 규칙 설정
- Firestore Database > 규칙 탭
- README.md의 보안 규칙 복사하여 적용

## 현재 설정 상태

현재 `js/firebase-config.js`는 더미 값으로 설정되어 있습니다.
실제 Firebase 프로젝트를 생성하고 위의 값들로 교체해야 합니다.

## 테스트

설정이 완료되면:
1. 웹사이트를 열고 로그인 페이지로 이동
2. "Google로 시작하기" 버튼 클릭
3. Google 계정 선택
4. 로그인 성공 확인
