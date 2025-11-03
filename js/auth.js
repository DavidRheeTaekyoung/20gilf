// 인증 관련 로직

let currentUser = null;

// 알림 표시 함수
function showAlert(message, type = 'info') {
  const alert = document.getElementById('alert');
  if (!alert) return;

  alert.textContent = message;
  alert.className = `alert alert-${type} show`;

  setTimeout(() => {
    alert.classList.remove('show');
  }, 5000);
}

// Google 로그인
async function loginWithGoogle() {
  try {
    showLoginStatus(true);

    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    const result = await auth.signInWithPopup(provider);
    const user = result.user;

    console.log('Google 로그인 성공:', user);
    await handleLoginSuccess(user);

  } catch (error) {
    console.error('Google 로그인 실패:', error);
    showAlert('Google 로그인에 실패했습니다: ' + error.message, 'error');
    showLoginStatus(false);
  }
}

// 네이버 로그인 (OAuth Provider 사용)
async function loginWithNaver() {
  try {
    showLoginStatus(true);

    // 네이버 OAuth는 Firebase에서 직접 지원하지 않으므로
    // 커스텀 OAuth Provider를 사용하거나 다른 방법 필요
    showAlert('네이버 로그인은 Firebase 설정이 필요합니다. 현재는 Google 로그인을 사용해주세요.', 'info');
    showLoginStatus(false);

    // 실제 구현시 네이버 개발자센터에서 앱 등록 후
    // OAuth 2.0 인증 코드를 받아서 Firebase Custom Token으로 변환 필요

  } catch (error) {
    console.error('네이버 로그인 실패:', error);
    showAlert('네이버 로그인에 실패했습니다: ' + error.message, 'error');
    showLoginStatus(false);
  }
}

// 로그인 상태 표시
function showLoginStatus(show) {
  const loginStatus = document.getElementById('loginStatus');
  const googleBtn = document.getElementById('googleLoginBtn');
  const naverBtn = document.getElementById('naverLoginBtn');

  if (loginStatus) {
    if (show) {
      loginStatus.classList.remove('hidden');
      if (googleBtn) googleBtn.disabled = true;
      if (naverBtn) naverBtn.disabled = true;
    } else {
      loginStatus.classList.add('hidden');
      if (googleBtn) googleBtn.disabled = false;
      if (naverBtn) naverBtn.disabled = false;
    }
  }
}

// 로그인 성공 처리
async function handleLoginSuccess(user) {
  currentUser = user;

  // 사용자 프로필 확인
  const profile = await getUserProfile(user.uid);

  if (profile && profile.graduationClass) {
    // 이미 프로필이 있으면 환영 섹션 표시
    showWelcomeSection(profile);
  } else {
    // 프로필이 없으면 프로필 입력 섹션 표시
    showProfileSection(user);
  }

  showLoginStatus(false);
}

// 프로필 입력 섹션 표시
function showProfileSection(user) {
  document.getElementById('profileSection').classList.remove('hidden');

  // 이메일에서 이름 추출 시도
  const nameField = document.getElementById('name');
  if (user.displayName) {
    nameField.value = user.displayName;
  }
}

// 환영 섹션 표시
function showWelcomeSection(profile) {
  const welcomeSection = document.getElementById('welcomeSection');
  if (!welcomeSection) return;

  welcomeSection.classList.remove('hidden');

  const userName = document.getElementById('userName');
  const userClass = document.getElementById('userClass');

  if (userName) userName.textContent = profile.name || '동문';
  if (userClass) userClass.textContent = profile.graduationClass || '?';
}

// 프로필 저장
async function saveProfile(event) {
  event.preventDefault();

  if (!currentUser) {
    showAlert('로그인이 필요합니다.', 'error');
    return;
  }

  const formData = new FormData(event.target);
  const profileData = {
    name: formData.get('name'),
    graduationClass: formData.get('graduationClass'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    position: formData.get('position'),
    email: currentUser.email,
    photoURL: currentUser.photoURL
  };

  try {
    await saveUserProfile(currentUser.uid, profileData);
    showAlert('프로필이 저장되었습니다!', 'success');

    // 프로필 섹션 숨기고 환영 섹션 표시
    document.getElementById('profileSection').classList.add('hidden');
    showWelcomeSection(profileData);

  } catch (error) {
    console.error('프로필 저장 실패:', error);
    showAlert('프로필 저장에 실패했습니다: ' + error.message, 'error');
  }
}

// 로그아웃
async function logout() {
  try {
    await auth.signOut();
    currentUser = null;
    showAlert('로그아웃되었습니다.', 'success');

    // 페이지 새로고침
    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error('로그아웃 실패:', error);
    showAlert('로그아웃에 실패했습니다: ' + error.message, 'error');
  }
}

// 인증 상태 변경 감지
function initAuthStateListener() {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      console.log('사용자 로그인 상태:', user.email);
      currentUser = user;

      // 프로필 확인
      const profile = await getUserProfile(user.uid);
      if (profile && profile.graduationClass) {
        showWelcomeSection(profile);
      }
    } else {
      console.log('사용자 로그아웃 상태');
      currentUser = null;
    }
  });
}

// 페이지 로드시 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
  // Firebase 초기화 확인
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK가 로드되지 않았습니다.');
    showAlert('Firebase 초기화에 실패했습니다. 페이지를 새로고침 해주세요.', 'error');
    return;
  }

  // 인증 상태 리스너 초기화
  setTimeout(() => {
    if (typeof auth !== 'undefined') {
      initAuthStateListener();
    }
  }, 500);

  // 로그인 버튼 이벤트 리스너
  const googleBtn = document.getElementById('googleLoginBtn');
  if (googleBtn) {
    googleBtn.addEventListener('click', loginWithGoogle);
  }

  const naverBtn = document.getElementById('naverLoginBtn');
  if (naverBtn) {
    naverBtn.addEventListener('click', loginWithNaver);
  }

  // 프로필 폼 이벤트 리스너
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', saveProfile);
  }

  // 로그아웃 버튼 이벤트 리스너
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
});

// 현재 로그인한 사용자 정보 가져오기 (다른 페이지에서 사용)
async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    alert('로그인이 필요한 페이지입니다.');
    window.location.href = 'login.html';
    return null;
  }

  const profile = await getUserProfile(user.uid);
  if (!profile || !profile.graduationClass) {
    alert('프로필을 먼저 완성해주세요.');
    window.location.href = 'login.html';
    return null;
  }

  return { user, profile };
}
