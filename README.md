# 🏌️ 20기 동문 골프대회 웹사이트

고등학교 20기 동문들을 위한 골프대회 신청 및 관리 웹사이트입니다.

## 📋 주요 기능

### 1. 회원가입/로그인
- Google OAuth 소셜 로그인
- 네이버 로그인 (설정 필요)
- 졸업 기수 입력 필수
- 프로필 관리 (이름, 연락처, 회사, 직책)

### 2. 대회 신청
- 예정된 대회 목록 확인
- 온라인 대회 신청
- 참가 내역 조회
- 신청 상태 관리

### 3. 결제 시스템
- **토스페이먼츠** 카드 결제
- 계좌이체 안내
- 결제 내역 저장

### 4. 운영진 소개
- 20기 회장 윤영님 인사말
- 운영진 소개 (김광득 부회장 외)
- 20기 동문 분야별 소개

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Firebase
  - Authentication (Google OAuth)
  - Firestore Database
- **Payment**: 토스페이먼츠 (Toss Payments)
- **Hosting**: GitHub Pages

## 📂 프로젝트 구조

```
20gilf/
├── index.html           # 메인 페이지
├── login.html          # 로그인/회원가입
├── tournament.html     # 대회 신청
├── payment.html        # 결제
├── about.html          # 운영진 소개
├── css/
│   └── style.css      # 공통 스타일
├── js/
│   ├── firebase-config.js  # Firebase 설정
│   ├── auth.js            # 인증 로직
│   ├── tournament.js      # 대회 신청 로직
│   └── payment.js         # 결제 로직
└── images/            # 이미지 파일
```

## 🚀 설치 및 실행 방법

### 1. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Authentication 활성화
   - Google 로그인 제공업체 활성화
   - 승인된 도메인에 GitHub Pages URL 추가
3. Firestore Database 생성 (테스트 모드로 시작)
4. 프로젝트 설정에서 웹앱 추가
5. Firebase 설정 정보를 `js/firebase-config.js`에 입력

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 2. Firestore 데이터베이스 구조

다음 컬렉션을 생성하세요:

#### `users` 컬렉션
```javascript
{
  name: "홍길동",
  graduationClass: "20",
  email: "user@example.com",
  phone: "010-1234-5678",
  company: "회사명",
  position: "직책",
  photoURL: "https://...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `tournaments` 컬렉션
```javascript
{
  title: "2026 봄 스크린골프 대회",
  date: "2026-04-15",
  location: "전국 스크린골프장",
  fee: 50000,
  description: "대회 설명...",
  deadline: "2026-04-10",
  maxParticipants: 100,
  currentParticipants: 0
}
```

#### `registrations` 컬렉션
```javascript
{
  tournamentId: "tournament-id",
  userId: "user-id",
  userName: "홍길동",
  userGraduationClass: "20",
  userEmail: "user@example.com",
  registeredAt: Timestamp,
  paymentStatus: "pending" | "completed"
}
```

#### `payments` 컬렉션
```javascript
{
  registrationId: "registration-id",
  method: "card" | "bank_transfer",
  amount: 50000,
  orderId: "order-id",
  status: "completed",
  createdAt: Timestamp
}
```

### 3. 토스페이먼츠 설정

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)에서 가입
2. 테스트 API 키 발급 (실제 운영시 실제 키 발급)
3. `js/payment.js`의 클라이언트 키 업데이트

```javascript
const TOSS_CLIENT_KEY = 'YOUR_TOSS_CLIENT_KEY';
```

### 4. GitHub Pages 배포

1. GitHub 저장소 설정으로 이동
2. Pages 섹션에서 Source를 `main` 브랜치로 설정
3. 배포 완료 후 URL 확인: `https://username.github.io/20gilf/`

## 🔐 보안 설정

### Firestore 보안 규칙

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 프로필
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // 대회 목록
    match /tournaments/{tournamentId} {
      allow read: if true;
      allow write: if request.auth != null; // 관리자만
    }

    // 대회 신청
    match /registrations/{registrationId} {
      allow read: if request.auth != null &&
                     (resource.data.userId == request.auth.uid ||
                      request.auth.token.admin == true);
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                       (resource.data.userId == request.auth.uid ||
                        request.auth.token.admin == true);
    }

    // 결제 정보
    match /payments/{paymentId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 QR 코드

웹사이트 QR 코드는 배포 후 생성됩니다.
QR 코드를 통해 스마트폰으로 바로 접속 가능합니다.

## 🎨 커스터마이징

### 색상 변경
`css/style.css`의 CSS 변수를 수정하세요:

```css
:root {
  --primary-color: #2E8B57;    /* 메인 색상 */
  --secondary-color: #98FB98;  /* 보조 색상 */
  --accent-color: #FFD700;     /* 강조 색상 */
}
```

### 대회 정보 수정
`js/tournament.js`의 샘플 데이터를 수정하거나 Firestore에서 직접 관리하세요.

## 📧 문의

- 이메일: golf20@example.com
- 카카오톡: 20기 골프대회

## 📄 라이선스

이 프로젝트는 20기 동문회 전용입니다.

---

**만든이**: 20기 골프대회 추진위원회
**버전**: 1.0.0
**최종 업데이트**: 2025년
