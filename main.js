/* ══════════════════════════════════════════════
   FreeMeaner · main.js
   Page routing, scroll reveal, diagnosis logic
══════════════════════════════════════════════ */

/* ── DATA ── */
const DOMAINS = [
  { id: 'work',     name: '일 구조',   en: 'WORK',     color: '#B8935A' },
  { id: 'income',   name: '수입 구조', en: 'INCOME',   color: '#2D6A5F' },
  { id: 'health',   name: '건강 구조', en: 'HEALTH',   color: '#7B9E87' },
  { id: 'relation', name: '관계 구조', en: 'RELATION', color: '#A0856C' },
  { id: 'meaning',  name: '의미 구조', en: 'MEANING',  color: '#8A7BA8' },
];

const QUESTIONS = [
  // 일 구조 (0–3)
  { domain: 0, q: '나의 일은 시간이 지날수록 무언가가 축적되고 있다',         sub: '지식, 콘텐츠, 브랜드, 네트워크 등 자산이 쌓이는 느낌이 있는가' },
  { domain: 0, q: '나는 지금 하는 일에서 소진이 아니라 성장을 경험한다',     sub: '일 후에 에너지가 빠지는가, 채워지는가' },
  { domain: 0, q: '현재 일은 회사가 아닌 나 자신의 포터블 스킬을 키운다',    sub: '이 회사를 떠나도 통하는 역량이 쌓이고 있는가' },
  { domain: 0, q: '나는 5년 후에도 지금과 같은 방식으로 일하고 싶다',        sub: '지금 일의 방식이 지속 가능하다고 느끼는가' },
  // 수입 구조 (4–7)
  { domain: 1, q: '나의 수입은 한 곳 이상의 경로에서 들어온다',              sub: '직장 외의 수입이 현재 존재하거나 계획되어 있는가' },
  { domain: 1, q: '내가 일을 멈춰도 일정 기간 생활이 가능한 준비가 되어 있다', sub: '비상 자금, 자산 수입 등 완충 장치가 있는가' },
  { domain: 1, q: '나는 수입 구조를 의도적으로 설계하고 있다',               sub: '우연이 아닌 계획으로 수입 다각화를 진행 중인가' },
  { domain: 1, q: '현재 수입 구조가 10년 후에도 유지될 수 있다고 생각한다',  sub: '나이가 들어도 지속 가능한 수입 방식인가' },
  // 건강 구조 (8–11)
  { domain: 2, q: '나는 몸과 마음을 위한 루틴을 꾸준히 유지하고 있다',       sub: '운동, 수면, 영양, 정신 건강 관리 등이 일상화되어 있는가' },
  { domain: 2, q: '나는 일과 삶에서 충분한 회복 시간을 갖고 있다',           sub: '소진 후 재충전할 수 있는 구조가 있는가' },
  { domain: 2, q: '10년 후 나의 체력과 건강 상태가 지금보다 좋을 것 같다',   sub: '현재 생활 방식이 장기적 건강을 담보하는가' },
  { domain: 2, q: '나는 스트레스를 건강한 방식으로 관리하고 있다',           sub: '스트레스 해소 방식이 지속 가능하고 건강한가' },
  // 관계 구조 (12–15)
  { domain: 3, q: '나의 주변에는 에너지를 주는 관계가 빼앗는 관계보다 많다', sub: '관계 후 충전되는 느낌인가, 소진되는 느낌인가' },
  { domain: 3, q: '나는 가장 중요한 관계에 충분한 시간과 에너지를 쏟고 있다', sub: '핵심 관계(가족, 깊은 친구)에 의도적으로 투자하는가' },
  { domain: 3, q: '나는 새로운 가능성을 여는 사람들과 연결되어 있다',        sub: '성장과 전환에 도움이 되는 네트워크가 있는가' },
  { domain: 3, q: '나는 관계를 의도적으로 선택하고 관리한다',               sub: '수동적으로 맺어진 관계가 아닌 적극적으로 설계하는가' },
  // 의미 구조 (16–21)
  { domain: 4, q: '나는 지금 왜 사는지에 대한 나름의 답을 갖고 있다',       sub: '삶의 목적이나 방향에 대해 스스로 정의한 것이 있는가' },
  { domain: 4, q: '하루가 끝날 때 충만함을 느끼는 날이 소진됨보다 많다',     sub: '일상에서 의미 있는 순간이 충분히 있는가' },
  { domain: 4, q: '나는 미래에 대한 기대감과 설렘이 있다',                  sub: '앞으로의 삶이 기대되는가, 불안한가' },
  { domain: 4, q: '나의 일상적인 행동들이 더 큰 의미나 방향과 연결되어 있다', sub: '지금 하는 것들이 내가 원하는 삶과 연결되는가' },
  { domain: 4, q: '나는 나 자신의 성장과 발전에 시간을 투자하고 있다',       sub: '자기 계발, 학습, 성찰 등에 의식적으로 시간을 쓰는가' },
  { domain: 4, q: '나는 지금의 삶 전반에 대해 만족하고 있다',               sub: '생활, 일, 관계, 건강을 통틀어 지금 삶이 괜찮은가' },
];

const COMMENTS = [
  ['지금 당장 일 구조 재설계가 필요합니다. 소모적 일을 축적적 일로 전환하는 것이 최우선 과제입니다.', '일 구조의 일부는 작동하지만 축적되는 방향으로 더 정교하게 설계할 필요가 있습니다.', '좋은 일 구조를 갖고 있습니다. 포터블 스킬을 더욱 강화하면 더 자유로워질 수 있습니다.'],
  ['수입 다각화가 시급합니다. 단일 수입원의 위험에 노출되어 있습니다.', '수입 구조의 기초는 있으나 의도적인 다각화 설계가 필요합니다.', '안정적인 수입 구조를 갖추고 있습니다. 자산 수입 비중을 점진적으로 높여가세요.'],
  ['건강 루틴을 당장 시작해야 합니다. 건강은 모든 영역의 인프라입니다.', '건강 관리의 방향은 맞지만 일관성과 지속 가능성을 높일 필요가 있습니다.', '훌륭한 건강 구조입니다. 이 루틴을 유지하는 것 자체가 큰 자산입니다.'],
  ['관계 구조를 재점검할 필요가 있습니다. 소모적 관계를 정리하고 핵심 관계에 집중하세요.', '관계의 질을 높이는 작업이 필요합니다. 의도적인 관계 설계를 시작하세요.', '건강한 관계 구조를 갖고 있습니다. 새로운 가능성을 여는 네트워크를 더 확장해보세요.'],
  ['삶의 의미를 찾는 작업이 가장 시급합니다. 의미 구조 워크북부터 시작하세요.', '의미의 실마리는 있지만 더 명확하게 정의하고 일상과 연결하는 작업이 필요합니다.', '충만한 의미 구조를 갖고 있습니다. 이 의미를 더 많은 사람과 나누는 방법을 찾아보세요.'],
];

/* ── PAGE ROUTER ── */
const pages = ['home', 'philosophy', 'diagnosis'];
let currentPage = 'home';

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + id);
  if (target) {
    target.classList.add('active');
    currentPage = id;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    updateNav(id);
    if (id === 'home' || id === 'philosophy') initReveal();
    if (id === 'diagnosis') resetDiagnosis();
  }
}

function updateNav(id) {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === id);
  });
}

/* ── SCROLL REVEAL ── */
let revealObserver = null;

function initReveal() {
  if (revealObserver) revealObserver.disconnect();
  // Reset all reveals in active page
  const active = document.querySelector('.page.active');
  if (!active) return;
  active.querySelectorAll('.reveal').forEach(el => el.classList.remove('revealed'));

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  active.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ── DIAGNOSIS STATE ── */
let diagCurrent = 0;
let diagAnswers = new Array(QUESTIONS.length).fill(null);
let diagScreen  = 'intro';

function resetDiagnosis() {
  diagCurrent = 0;
  diagAnswers = new Array(QUESTIONS.length).fill(null);
  showDiagScreen('intro');
}

function showDiagScreen(id) {
  diagScreen = id;
  document.querySelectorAll('.diag-screen').forEach(s => s.classList.remove('active'));
  const t = document.getElementById('screen-' + id);
  if (t) t.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (id === 'quiz') renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[diagCurrent];
  const d = DOMAINS[q.domain];
  const pct = Math.round((diagCurrent / QUESTIONS.length) * 100);

  document.getElementById('qpb').style.width = pct + '%';
  document.getElementById('quiz-counter').textContent = (diagCurrent + 1) + ' / ' + QUESTIONS.length;

  // Domain tag
  const tag = document.getElementById('quiz-domain-tag');
  tag.textContent = d.name + ' · ' + d.en;
  tag.style.color = d.color;
  tag.style.borderColor = d.color + '66';

  // Domain progress segments
  const dp = document.getElementById('domain-progress');
  dp.innerHTML = DOMAINS.map((dom, i) => {
    const count = QUESTIONS.filter(x => x.domain === i).length;
    let cls = 'dp-seg';
    if (i < q.domain) cls += ' done';
    const style = i === q.domain ? `background:${d.color}66` : '';
    return `<div class="${cls}" style="${style};flex:${count}"></div>`;
  }).join('');

  // Question text
  const qEl = document.getElementById('quiz-q');
  qEl.style.opacity = '0';
  qEl.textContent = q.q;
  setTimeout(() => { qEl.style.opacity = '1'; }, 30);
  document.getElementById('quiz-q-sub').textContent = q.sub;

  // Scale buttons
  const opts = document.getElementById('scale-options');
  opts.innerHTML = [1, 2, 3, 4, 5].map(v => {
    const sel = diagAnswers[diagCurrent] === v;
    const selStyle = sel ? `background:${d.color};border-color:${d.color};color:#fff;` : '';
    return `<button class="scale-btn${sel ? ' selected' : ''}" data-val="${v}" style="${selStyle}">${v}</button>`;
  }).join('');

  opts.querySelectorAll('.scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      diagAnswers[diagCurrent] = parseInt(btn.dataset.val);
      opts.querySelectorAll('.scale-btn').forEach(b => {
        b.classList.remove('selected');
        b.style.cssText = '';
      });
      btn.classList.add('selected');
      btn.style.background = d.color;
      btn.style.borderColor = d.color;
      btn.style.color = '#fff';
      document.getElementById('btn-next').classList.add('enabled');
    });
  });

  const nextBtn = document.getElementById('btn-next');
  nextBtn.classList.toggle('enabled', diagAnswers[diagCurrent] !== null);
  nextBtn.textContent = diagCurrent === QUESTIONS.length - 1 ? '결과 보기 →' : '다음 →';
  document.getElementById('btn-prev').disabled = diagCurrent === 0;
}

function calcScores() {
  return DOMAINS.map((d, di) => {
    const qs = QUESTIONS.map((q, i) => ({ q, i })).filter(x => x.q.domain === di);
    const total = qs.reduce((sum, x) => sum + (diagAnswers[x.i] || 3), 0);
    return Math.round((total / (qs.length * 5)) * 100);
  });
}

function drawRadar(scores) {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 140, cy = 140, r = 100, n = 5;
  const angles = Array.from({ length: n }, (_, i) => -Math.PI / 2 + (2 * Math.PI / n) * i);

  ctx.clearRect(0, 0, 280, 280);

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach(scale => {
    ctx.beginPath();
    angles.forEach((a, i) => {
      const x = cx + Math.cos(a) * r * scale;
      const y = cy + Math.sin(a) * r * scale;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Axes
  angles.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  });

  // Data polygon
  ctx.beginPath();
  angles.forEach((a, i) => {
    const s = scores[i] / 100;
    const x = cx + Math.cos(a) * r * s;
    const y = cy + Math.sin(a) * r * s;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(184,147,90,0.18)';
  ctx.fill();
  ctx.strokeStyle = '#B8935A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Dots
  angles.forEach((a, i) => {
    const s = scores[i] / 100;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * s, cy + Math.sin(a) * r * s, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#B8935A';
    ctx.fill();
  });

  // Labels
  ctx.font = '300 10px "Noto Sans KR",sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.textAlign = 'center';
  const pad = 18;
  angles.forEach((a, i) => {
    const x = cx + Math.cos(a) * (r + pad);
    const y = cy + Math.sin(a) * (r + pad) + 4;
    ctx.fillText(DOMAINS[i].name.replace(' 구조', ''), x, y);
  });
}

function buildResult() {
  const scores = calcScores();
  showDiagScreen('result');

  // Draw radar after DOM is visible
  requestAnimationFrame(() => drawRadar(scores));

  // Score rows
  const sc = document.getElementById('result-scores');
  sc.innerHTML = DOMAINS.map((d, i) => {
    const s = scores[i];
    const tier = s < 45 ? 0 : s < 70 ? 1 : 2;
    return `
      <div class="score-row">
        <div class="sr-top">
          <div class="sr-domain">
            <div class="sr-dot" style="background:${d.color};"></div>
            ${d.name}
          </div>
          <div class="sr-score" style="color:${d.color};">${s}</div>
        </div>
        <div class="sr-bar-track">
          <div class="sr-bar-fill" style="width:${s}%;background:${d.color};"></div>
        </div>
        <div class="sr-comment">${COMMENTS[i][tier]}</div>
      </div>`;
  }).join('');

  // Insight
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / 5);
  const minIdx = scores.indexOf(Math.min(...scores));
  const maxIdx = scores.indexOf(Math.max(...scores));
  const lowest  = DOMAINS[minIdx];
  const highest = DOMAINS[maxIdx];
  const msg = avg < 50
    ? '지금이 삶의 구조를 전면 재설계할 적기입니다. 프리미너 워크북으로 영역별 설계를 시작하세요.'
    : avg < 70
    ? '구조의 기초는 갖춰졌습니다. 취약한 영역을 집중 강화하면 삶 전체가 한 단계 올라섭니다.'
    : '균형 잡힌 삶의 구조를 갖고 있습니다. 이제 각 영역의 깊이를 더하고 시너지를 설계할 차례입니다.';

  document.getElementById('result-insight').innerHTML = `
    <div class="ri-label">종합 인사이트 · Overall Insight</div>
    <div class="ri-text">
      전체 평균 <strong style="font-weight:500;">${avg}점</strong>입니다.
      <strong style="font-weight:500;">${highest.name}</strong>이 가장 탄탄하며,
      <strong style="font-weight:500;">${lowest.name}</strong>이 가장 취약한 영역입니다.
      ${msg}
    </div>`;
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {

  /* Nav links — desktop + mobile */
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const p = el.dataset.page;
      // 모바일 메뉴 닫기
      const btn  = document.getElementById('hamburger');
      const menu = document.getElementById('mobile-nav');
      if (btn)  btn.classList.remove('open');
      if (menu) menu.classList.remove('open');
      document.body.style.overflow = '';
      // 페이지 이동
      if (p === 'workbook') {
        window.location.href = 'workbook.html';
      } else if (p === 'diagnosis') {
        window.location.href = 'diagnosis.html';
      } else if (p) {
        showPage(p);
      }
    });
  });

  /* Diagnosis buttons */
  const btnStart = document.getElementById('btn-start');
  if (btnStart) btnStart.addEventListener('click', () => showDiagScreen('quiz'));

  const btnNext = document.getElementById('btn-next');
  if (btnNext) btnNext.addEventListener('click', () => {
    if (!btnNext.classList.contains('enabled')) return;
    if (diagCurrent === QUESTIONS.length - 1) { buildResult(); return; }
    diagCurrent++;
    renderQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const btnPrev = document.getElementById('btn-prev');
  if (btnPrev) btnPrev.addEventListener('click', () => {
    if (diagCurrent > 0) { diagCurrent--; renderQuestion(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const btnRetry = document.getElementById('btn-retry');
  if (btnRetry) btnRetry.addEventListener('click', () => resetDiagnosis());

  /* Scroll reveal for home (initial page) */
  initReveal();
});
