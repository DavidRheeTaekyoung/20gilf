// 결제 관련 로직

// 토스페이먼츠 클라이언트 키 (실제 사용시 발급받은 키로 교체)
const TOSS_CLIENT_KEY = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

let tossPayments = null;
let paymentData = {
  tournamentId: '',
  tournamentTitle: '',
  amount: 0
};
let currentUserData = null;

// 알림 표시
function showAlert(message, type = 'info') {
  const alert = document.getElementById('alert');
  if (!alert) return;

  alert.textContent = message;
  alert.className = `alert alert-${type} show`;

  setTimeout(() => {
    alert.classList.remove('show');
  }, 5000);
}

// URL 파라미터 파싱
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    tournament: params.get('tournament'),
    title: params.get('title'),
    fee: parseInt(params.get('fee')) || 0
  };
}

// 결제 정보 표시
function displayPaymentInfo(userData, params) {
  document.getElementById('tournamentTitle').textContent = params.title || '-';
  document.getElementById('userName').textContent = userData.profile.name || '-';
  document.getElementById('userClass').textContent = userData.profile.graduationClass || '-';
  document.getElementById('paymentAmount').textContent = params.fee.toLocaleString();

  paymentData = {
    tournamentId: params.tournament,
    tournamentTitle: params.title,
    amount: params.fee
  };
}

// 토스페이먼츠 결제
async function processTossPayment() {
  if (!currentUserData) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  if (!paymentData.amount || paymentData.amount <= 0) {
    showAlert('결제 금액이 올바르지 않습니다.', 'error');
    return;
  }

  try {
    // 토스페이먼츠 SDK 초기화 확인
    if (!tossPayments) {
      tossPayments = TossPayments(TOSS_CLIENT_KEY);
    }

    // 주문 ID 생성 (실제로는 서버에서 생성해야 함)
    const orderId = `ORDER_${Date.now()}_${currentUserData.user.uid.substring(0, 8)}`;

    // 결제 요청
    await tossPayments.requestPayment('카드', {
      amount: paymentData.amount,
      orderId: orderId,
      orderName: paymentData.tournamentTitle,
      customerName: currentUserData.profile.name,
      customerEmail: currentUserData.user.email,
      successUrl: window.location.origin + '/payment-success.html',
      failUrl: window.location.origin + '/payment-fail.html'
    });

  } catch (error) {
    console.error('결제 실패:', error);

    if (error.code === 'USER_CANCEL') {
      showAlert('결제를 취소하셨습니다.', 'info');
    } else {
      showAlert('결제 처리 중 오류가 발생했습니다: ' + error.message, 'error');
    }
  }
}

// 계좌이체 정보 표시/숨김
function toggleBankTransferInfo() {
  const info = document.getElementById('bankTransferInfo');
  if (info.classList.contains('hidden')) {
    info.classList.remove('hidden');
  } else {
    info.classList.add('hidden');
  }
}

// 계좌이체 확인 요청
async function confirmBankTransfer() {
  if (!currentUserData) {
    alert('로그인이 필요합니다.');
    return;
  }

  const confirmMsg = `입금자명: ${currentUserData.profile.graduationClass}${currentUserData.profile.name}\n\n위 정보로 입금하셨나요?`;
  if (!confirm(confirmMsg)) {
    return;
  }

  try {
    // 입금 정보 저장 (실제로는 서버에서 확인 필요)
    await savePaymentInfo('temp_registration_id', {
      method: 'bank_transfer',
      amount: paymentData.amount,
      tournamentId: paymentData.tournamentId,
      userId: currentUserData.user.uid,
      userName: currentUserData.profile.name,
      userClass: currentUserData.profile.graduationClass,
      depositorName: `${currentUserData.profile.graduationClass}${currentUserData.profile.name}`,
      status: 'pending_verification'
    });

    showAlert('입금 확인 요청이 전송되었습니다. 확인 후 승인 처리됩니다.', 'success');

    // 결제 완료 섹션 표시
    setTimeout(() => {
      showPaymentComplete();
    }, 2000);

  } catch (error) {
    console.error('입금 확인 요청 실패:', error);
    showAlert('입금 확인 요청에 실패했습니다: ' + error.message, 'error');
  }
}

// 결제 완료 표시
function showPaymentComplete() {
  // 모든 섹션 숨기기
  document.querySelectorAll('section').forEach(section => {
    if (section.id !== 'paymentCompleteSection') {
      section.style.display = 'none';
    }
  });

  // 완료 섹션 표시
  document.getElementById('paymentCompleteSection').classList.remove('hidden');
}

// 페이지 초기화
async function initPage() {
  try {
    // URL 파라미터 가져오기
    const params = getUrlParams();

    if (!params.tournament || !params.fee) {
      showAlert('결제 정보가 올바르지 않습니다.', 'error');
      setTimeout(() => {
        window.location.href = 'tournament.html';
      }, 2000);
      return;
    }

    // 사용자 인증 확인
    const user = await getCurrentUser();

    if (!user) {
      alert('로그인이 필요합니다.');
      window.location.href = 'login.html';
      return;
    }

    const profile = await getUserProfile(user.uid);
    if (!profile || !profile.graduationClass) {
      alert('프로필을 먼저 완성해주세요.');
      window.location.href = 'login.html';
      return;
    }

    currentUserData = { user, profile };

    // 결제 정보 표시
    displayPaymentInfo(currentUserData, params);

    // 토스페이먼츠 SDK 초기화
    if (typeof TossPayments !== 'undefined') {
      tossPayments = TossPayments(TOSS_CLIENT_KEY);
    } else {
      console.warn('토스페이먼츠 SDK가 로드되지 않았습니다.');
    }

  } catch (error) {
    console.error('페이지 초기화 실패:', error);
    showAlert('페이지 로드 중 오류가 발생했습니다.', 'error');
  }
}

// 페이지 로드시 이벤트 리스너 등록
document.addEventListener('DOMContentLoaded', () => {
  // Firebase 초기화 대기
  setTimeout(() => {
    if (typeof auth !== 'undefined') {
      initPage();
    } else {
      console.error('Firebase가 초기화되지 않았습니다.');
      showAlert('시스템 초기화에 실패했습니다.', 'error');
    }
  }, 1000);

  // 토스페이먼츠 결제 버튼
  const tossBtn = document.getElementById('tossPaymentBtn');
  if (tossBtn) {
    tossBtn.addEventListener('click', processTossPayment);
  }

  // 계좌이체 버튼
  const bankBtn = document.getElementById('bankTransferBtn');
  if (bankBtn) {
    bankBtn.addEventListener('click', toggleBankTransferInfo);
  }

  // 입금 확인 버튼
  const confirmBtn = document.getElementById('confirmTransferBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmBankTransfer);
  }
});
