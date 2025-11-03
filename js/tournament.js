// 대회 신청 관련 로직

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

// 대회 목록 로드
async function loadTournaments() {
  const listContainer = document.getElementById('tournamentList');

  try {
    // 실제로는 getTournaments() 함수로 데이터베이스에서 가져옴
    // 데모를 위해 샘플 데이터 사용
    const tournaments = [
      {
        id: 'tournament-2026-spring',
        title: '2026 봄 스크린골프 대회',
        date: '2026-04-15',
        location: '전국 스크린골프장',
        fee: 50000,
        description: '봄맞이 동문 골프대회입니다. 스크린골프장에서 편하게 참가하세요!',
        deadline: '2026-04-10',
        maxParticipants: 100,
        currentParticipants: 23
      },
      {
        id: 'tournament-2026-summer',
        title: '2026 여름 야외 골프대회',
        date: '2026-07-20',
        location: '서울 인근 골프장',
        fee: 120000,
        description: '실제 골프장에서 진행되는 야외 대회입니다. (그린피, 식사 포함)',
        deadline: '2026-07-15',
        maxParticipants: 50,
        currentParticipants: 8
      },
      {
        id: 'tournament-2026-winter',
        title: '2026 겨울 스크린골프 대회',
        date: '2026-12-23',
        location: '전국 스크린골프장',
        fee: 50000,
        description: '연말 결산 골프대회! 스크린골프 점수 제출로 참가하세요.',
        deadline: '2026-12-20',
        maxParticipants: 150,
        currentParticipants: 45
      }
    ];

    if (tournaments.length === 0) {
      listContainer.innerHTML = '<p class="text-center">예정된 대회가 없습니다.</p>';
      return;
    }

    listContainer.innerHTML = tournaments.map(tournament => `
      <div class="card" style="margin-bottom: 1.5em; text-align: left;">
        <h3 style="color: var(--accent-color); margin-top: 0;">${tournament.title}</h3>
        <p><strong>📅 일시:</strong> ${formatDate(tournament.date)}</p>
        <p><strong>📍 장소:</strong> ${tournament.location}</p>
        <p><strong>💰 참가비:</strong> ${tournament.fee.toLocaleString()}원</p>
        <p><strong>👥 참가인원:</strong> ${tournament.currentParticipants} / ${tournament.maxParticipants}명</p>
        <p><strong>⏰ 마감일:</strong> ${formatDate(tournament.deadline)}</p>
        <p style="margin-top: 1em;">${tournament.description}</p>

        <button
          class="btn"
          style="width: 100%; margin-top: 1em;"
          onclick="applyTournament('${tournament.id}', '${tournament.title}', ${tournament.fee})"
          ${tournament.currentParticipants >= tournament.maxParticipants ? 'disabled' : ''}
        >
          ${tournament.currentParticipants >= tournament.maxParticipants ? '마감됨' : '참가 신청'}
        </button>
      </div>
    `).join('');

  } catch (error) {
    console.error('대회 목록 로드 실패:', error);
    listContainer.innerHTML = '<p class="text-center">대회 목록을 불러오는데 실패했습니다.</p>';
  }
}

// 날짜 포맷팅
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];

  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

// 대회 신청
async function applyTournament(tournamentId, tournamentTitle, fee) {
  // 로그인 확인
  if (!currentUserData) {
    alert('로그인이 필요합니다.');
    window.location.href = 'login.html';
    return;
  }

  const confirmMsg = `${tournamentTitle}에 신청하시겠습니까?\n참가비: ${fee.toLocaleString()}원`;
  if (!confirm(confirmMsg)) {
    return;
  }

  try {
    // 대회 신청
    await registerTournament(tournamentId, currentUserData.user.uid, {
      name: currentUserData.profile.name,
      graduationClass: currentUserData.profile.graduationClass,
      email: currentUserData.user.email
    });

    showAlert('대회 신청이 완료되었습니다!', 'success');

    // 결제 페이지로 이동
    const paymentUrl = `payment.html?tournament=${tournamentId}&fee=${fee}&title=${encodeURIComponent(tournamentTitle)}`;

    setTimeout(() => {
      if (confirm('결제 페이지로 이동하시겠습니까?')) {
        window.location.href = paymentUrl;
      } else {
        loadMyRegistrations();
      }
    }, 1000);

  } catch (error) {
    console.error('대회 신청 실패:', error);
    showAlert('대회 신청에 실패했습니다: ' + error.message, 'error');
  }
}

// 내 신청 내역 로드
async function loadMyRegistrations() {
  const container = document.getElementById('myRegistrations');

  if (!currentUserData) {
    container.innerHTML = '<p class="text-center">로그인 후 신청 내역을 확인할 수 있습니다.</p>';
    return;
  }

  try {
    const registrations = await getMyRegistrations(currentUserData.user.uid);

    if (registrations.length === 0) {
      container.innerHTML = '<p class="text-center">신청한 대회가 없습니다.</p>';
      return;
    }

    container.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>대회명</th>
            <th>신청일</th>
            <th>결제상태</th>
          </tr>
        </thead>
        <tbody>
          ${registrations.map(reg => `
            <tr>
              <td>${reg.tournamentId}</td>
              <td>${formatTimestamp(reg.registeredAt)}</td>
              <td>
                <span style="color: ${reg.paymentStatus === 'completed' ? '#4CAF50' : '#FFA500'};">
                  ${reg.paymentStatus === 'completed' ? '✓ 결제완료' : '⏳ 결제대기'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  } catch (error) {
    console.error('신청 내역 로드 실패:', error);
    container.innerHTML = '<p class="text-center">신청 내역을 불러오는데 실패했습니다.</p>';
  }
}

// Timestamp 포맷팅
function formatTimestamp(timestamp) {
  if (!timestamp) return '-';

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// 사용자 정보 표시
function displayUserInfo(userData) {
  const userInfoSection = document.getElementById('userInfo');
  const userName = document.getElementById('currentUserName');
  const userClass = document.getElementById('currentUserClass');

  if (userData && userData.profile) {
    userInfoSection.classList.remove('hidden');
    if (userName) userName.textContent = userData.profile.name || '동문';
    if (userClass) userClass.textContent = userData.profile.graduationClass || '?';
  }
}

// 페이지 초기화
async function initPage() {
  try {
    // 사용자 인증 확인
    const user = await getCurrentUser();

    if (user) {
      const profile = await getUserProfile(user.uid);
      if (profile && profile.graduationClass) {
        currentUserData = { user, profile };
        displayUserInfo(currentUserData);
      }
    }

    // 대회 목록 로드
    await loadTournaments();

    // 내 신청 내역 로드
    await loadMyRegistrations();

  } catch (error) {
    console.error('페이지 초기화 실패:', error);
  }
}

// 페이지 로드시 초기화
document.addEventListener('DOMContentLoaded', () => {
  // Firebase 초기화 대기
  setTimeout(() => {
    if (typeof auth !== 'undefined') {
      initPage();
    } else {
      console.error('Firebase가 초기화되지 않았습니다.');
      showAlert('시스템 초기화에 실패했습니다. 페이지를 새로고침 해주세요.', 'error');
    }
  }, 1000);
});
