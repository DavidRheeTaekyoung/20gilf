# ✅ Firebase 설정 체크리스트

## 1️⃣ Firebase Console 접속
- [ ] https://console.firebase.google.com/ 접속
- [ ] Google 계정으로 로그인

## 2️⃣ 프로젝트 생성
- [ ] "프로젝트 추가" 버튼 클릭
- [ ] 프로젝트 이름 입력: `20gilf-golf`
- [ ] "계속" 클릭
- [ ] Google 애널리틱스 OFF (선택사항)
- [ ] "프로젝트 만들기" 클릭

## 3️⃣ Authentication 설정
- [ ] 왼쪽 메뉴 "빌드" > "Authentication" 클릭
- [ ] "시작하기" 버튼 클릭
- [ ] "Sign-in method" 탭 클릭
- [ ] "Google" 찾아서 클릭
- [ ] 사용 설정 토글을 **ON**으로 변경
- [ ] 지원 이메일 선택 (본인 이메일)
- [ ] "저장" 클릭

## 4️⃣ Firestore Database 설정
- [ ] 왼쪽 메뉴 "빌드" > "Firestore Database" 클릭
- [ ] "데이터베이스 만들기" 클릭
- [ ] "테스트 모드로 시작" 선택
- [ ] "다음" 클릭
- [ ] 위치 선택: `asia-northeast3 (Seoul)` 추천
- [ ] "사용 설정" 클릭

## 5️⃣ 웹 앱 등록
- [ ] 프로젝트 개요 페이지로 이동 (왼쪽 상단 프로젝트 이름 클릭)
- [ ] 웹 아이콘 `</>` 클릭
- [ ] 앱 닉네임 입력: `20gilf-web`
- [ ] "앱 등록" 클릭
- [ ] Firebase SDK 구성 코드 **복사**

## 6️⃣ 설정 코드 적용
복사한 코드를 메모장에 붙여넣으면 이런 형식입니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "20gilf-golf.firebaseapp.com",
  projectId: "20gilf-golf",
  storageBucket: "20gilf-golf.appspot.com",
  messagingSenderId: "123456...",
  appId: "1:123456..."
};
```

이 코드를 복사해서 저에게 알려주시면,
제가 `js/firebase-config.js` 파일에 자동으로 넣어드리겠습니다!

## 7️⃣ 테스트
- [ ] 웹사이트 배포 후 로그인 페이지 열기
- [ ] "Google로 시작하기" 버튼 클릭
- [ ] 로그인 성공 확인

---

## 💡 팁

1. **지금 할 것**: 1번~6번까지
2. **배포 후에 할 것**: 7번 테스트
3. **막히면**: FIREBASE_SETUP.md 파일 참고

## 🆘 도움이 필요하면

- Firebase 설정 코드를 복사해서 보내주세요
- 제가 자동으로 설정 파일을 업데이트해드리겠습니다!
