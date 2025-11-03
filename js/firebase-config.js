// Firebase 설정
// 실제 사용시 Firebase Console에서 프로젝트 생성 후 설정값을 입력하세요
// https://console.firebase.google.com/

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
let app, auth, db;

// Firebase 초기화 함수
function initializeFirebase() {
  try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log('Firebase 초기화 성공');
    return true;
  } catch (error) {
    console.error('Firebase 초기화 실패:', error);
    return false;
  }
}

// 현재 사용자 가져오기
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
}

// 사용자 프로필 저장
async function saveUserProfile(userId, profileData) {
  try {
    await db.collection('users').doc(userId).set({
      ...profileData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('프로필 저장 실패:', error);
    throw error;
  }
}

// 사용자 프로필 가져오기
async function getUserProfile(userId) {
  try {
    const doc = await db.collection('users').doc(userId).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (error) {
    console.error('프로필 가져오기 실패:', error);
    throw error;
  }
}

// 대회 목록 가져오기
async function getTournaments() {
  try {
    const snapshot = await db.collection('tournaments')
      .orderBy('date', 'desc')
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('대회 목록 가져오기 실패:', error);
    throw error;
  }
}

// 대회 신청
async function registerTournament(tournamentId, userId, userData) {
  try {
    await db.collection('registrations').add({
      tournamentId,
      userId,
      userName: userData.name,
      userGraduationClass: userData.graduationClass,
      userEmail: userData.email,
      registeredAt: firebase.firestore.FieldValue.serverTimestamp(),
      paymentStatus: 'pending'
    });
    return true;
  } catch (error) {
    console.error('대회 신청 실패:', error);
    throw error;
  }
}

// 결제 정보 저장
async function savePaymentInfo(registrationId, paymentData) {
  try {
    await db.collection('payments').add({
      registrationId,
      ...paymentData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 등록 상태 업데이트
    await db.collection('registrations').doc(registrationId).update({
      paymentStatus: 'completed',
      paymentCompletedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('결제 정보 저장 실패:', error);
    throw error;
  }
}

// 내 대회 신청 내역 가져오기
async function getMyRegistrations(userId) {
  try {
    const snapshot = await db.collection('registrations')
      .where('userId', '==', userId)
      .orderBy('registeredAt', 'desc')
      .get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('신청 내역 가져오기 실패:', error);
    throw error;
  }
}

// 페이지 로드시 Firebase 초기화
if (typeof firebase !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
}
