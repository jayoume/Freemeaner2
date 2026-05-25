/* ══════════════════════════════════════════════
   FreeMeaner · diagnosis.js
   22문항 진단 + 유형 판별 + Formspree 연동
══════════════════════════════════════════════ */

/* ── 도메인 정의 ── */
const DOMAINS = [
  { id: 'work',     name: '일 구조',   en: 'WORK',     color: '#B8935A', count: 5 },
  { id: 'income',   name: '수입 구조', en: 'INCOME',   color: '#2D6A5F', count: 5 },
  { id: 'health',   name: '건강 구조', en: 'HEALTH',   color: '#7B9E87', count: 4 },
  { id: 'relation', name: '관계 구조', en: 'RELATION', color: '#A0856C', count: 4 },
  { id: 'meaning',  name: '의미 구조', en: 'MEANING',  color: '#8A7BA8', count: 4 },
];

/* ── 22개 문항 ── */
const QUESTIONS = [
  // 01. 일 구조 (0–4)
  { d: 0, q: '지금 하는 일이 5년 후에도 나에게 가치 있는 무언가를 남길 것 같다',          hint: '지식, 콘텐츠, 브랜드, 네트워크 등 자산이 쌓이는 느낌이 있는가' },
  { d: 0, q: '내가 없어도 돌아가는 일의 구조(시스템, 콘텐츠, 프로세스)가 일부라도 있다',  hint: '내 시간이 아닌 구조가 결과를 만드는 영역이 있는가' },
  { d: 0, q: '지금 하는 일은 이 조직을 떠나도 통하는 역량을 키워준다',                    hint: '이 회사가 사라져도 나에게 남는 포터블 스킬이 축적되고 있는가' },
  { d: 0, q: '일이 끝난 후 소진되기보다 무언가 채워지는 느낌을 자주 경험한다',            hint: '일의 에너지가 나를 비우는가, 채우는가' },
  { d: 0, q: '나는 지금 하는 일의 방향과 목적을 스스로 정의할 수 있다',                   hint: '누군가 시켜서가 아니라 내 기준으로 일의 의미를 말할 수 있는가' },
  // 02. 수입 구조 (5–9)
  { d: 1, q: '주 수입원이 사라져도 3개월 이상 버틸 수 있는 구조가 있다',                  hint: '비상자금, 자산 수입 등 완충 장치가 현실적으로 존재하는가' },
  { d: 1, q: '직장 수입 외에 별도의 수입이 있거나 구체적으로 준비 중이다',                hint: '부업, 프리랜싱, 투자 수익 등 두 번째 수입 경로가 있는가' },
  { d: 1, q: '나의 지식, 경험, 콘텐츠가 수입으로 연결되는 경로가 있다',                   hint: '내가 아는 것이 돈이 되는 구조가 현재 존재하거나 진행 중인가' },
  { d: 1, q: '내가 일을 덜 해도 수입이 줄지 않는 구조가 일부라도 있다',                   hint: '시간과 수입이 1:1로 묶여 있지 않은 영역이 있는가' },
  { d: 1, q: '10년 후에도 지금과 비슷한 수준의 수입이 유지될 것 같다',                    hint: '나이가 들어도 지속 가능한 수입 방식인가' },
  // 03. 건강 구조 (10–13)
  { d: 2, q: '운동, 수면, 식사 중 최소 두 가지 이상 의도적인 루틴이 있다',                hint: '의도적으로 설계된 건강 루틴이 일상에 자리 잡고 있는가' },
  { d: 2, q: '몸과 마음이 방전됐을 때 충전하는 나만의 방법과 시간이 확보되어 있다',       hint: '소진 후 회복하는 구체적인 루틴과 여유가 있는가' },
  { d: 2, q: '지금 생활 방식을 유지하면 10년 후 건강이 지금보다 나을 것 같다',            hint: '현재의 생활 패턴이 장기적으로 지속 가능한가' },
  { d: 2, q: '건강 관리를 위한 시간과 비용을 기꺼이 투자하고 있다',                       hint: '건강이 지출이 아닌 투자라는 인식으로 실제 행동하고 있는가' },
  // 04. 관계 구조 (14–17)
  { d: 3, q: '만나고 나면 에너지가 생기는 사람이 소진되는 사람보다 많다',                 hint: '내 주변 관계의 에너지 방향이 충전인가, 소진인가' },
  { d: 3, q: '나의 성장과 전환을 진심으로 응원하거나 함께 고민하는 사람이 있다',          hint: '삶의 변화와 도전을 지지해주는 사람이 현실적으로 존재하는가' },
  { d: 3, q: '가장 중요한 관계(가족, 가까운 친구)에 충분한 시간과 에너지를 의도적으로 쏟고 있다', hint: '핵심 관계에 실제로 시간을 배분하고 있는가' },
  { d: 3, q: '나는 어떤 관계를 유지하고 어떤 관계에서 거리를 둘지 스스로 선택한다',      hint: '관계가 타성으로 유지되는가, 의도적으로 설계되는가' },
  // 05. 의미 구조 (18–21)
  { d: 4, q: '나는 왜 사는가에 대한 나름의 답을 갖고 있다',                               hint: '삶의 목적이나 방향에 대해 스스로 정의한 무언가가 있는가' },
  { d: 4, q: '지금 하는 일과 일상이 내가 중요하게 생각하는 가치와 연결되어 있다',         hint: '매일의 행동이 내 핵심 가치와 일치한다고 느끼는가' },
  { d: 4, q: '오늘 하루가 끝날 때 잘 살았다는 느낌이 드는 날이 더 많다',                 hint: '일상에서 충만함을 경험하는 빈도가 공허함보다 높은가' },
  { d: 4, q: '5년 후 나의 삶이 지금보다 더 나아질 것이라는 확신이 있다',                 hint: '미래에 대한 방향감과 기대감이 불안보다 강한가' },
];

/* ── 유형 정의 ── */
const TYPES = {
  A: {
    code: 'A',
    name: '소진형 연소자',
    nameEm: '소진형',
    namePlain: '연소자',
    badge: 'TYPE A',
    msg: '지금 가장 열심히 살고 있지만, 그 열심이 삶을 갉아먹고 있습니다. 일의 방식과 삶의 구조 전체를 재설계할 때입니다. 열심히가 아닌 올바른 방향이 필요한 시점입니다.',
    insight: '일과 의미 구조가 동시에 취약합니다. 소모적인 방식으로 열심히 달리고 있어 에너지가 축적 없이 소진됩니다. 지금 당장 일의 구조를 바꾸지 않으면 번아웃이 불가피합니다.',
  },
  B: {
    code: 'B',
    name: '외줄 타기형',
    nameEm: '외줄 타기형',
    namePlain: '',
    badge: 'TYPE B',
    msg: '하나의 수입원에 삶 전체가 걸려 있습니다. 지금 당장 두 번째 기둥을 세우는 것이 가장 시급한 과제입니다. 단 하나의 줄이 끊어지면 모든 것이 무너질 수 있습니다.',
    insight: '수입 구조가 단일 경로에 집중되어 구조적 취약성이 높습니다. 일 구조는 괜찮지만 수입 다각화 없이는 작은 충격에도 전체가 흔들릴 수 있습니다.',
  },
  C: {
    code: 'C',
    name: '인프라 붕괴형',
    nameEm: '인프라 붕괴형',
    namePlain: '',
    badge: 'TYPE C',
    msg: '건강과 관계라는 삶의 인프라가 흔들리고 있습니다. 이 두 영역이 무너지면 다른 모든 성취가 의미를 잃습니다. 지금 당장 가장 기본적인 것을 먼저 돌볼 필요가 있습니다.',
    insight: '건강과 관계 구조가 동시에 취약한 상태입니다. 일이나 수입이 잘 되더라도 이 두 영역이 뒷받침되지 않으면 지속 가능성이 낮습니다.',
  },
  D: {
    code: 'D',
    name: '공허한 성공형',
    nameEm: '공허한 성공형',
    namePlain: '',
    badge: 'TYPE D',
    msg: '겉으로 보면 안정적이지만 안에서 공허함이 자랍니다. 이제 성취를 넘어 충만으로 이동할 때입니다. 더 많은 성공이 아니라 더 깊은 의미가 필요한 시점입니다.',
    insight: '일과 수입 구조는 탄탄하지만 의미 구조가 비어 있습니다. 목적지 없이 달리는 상태로, 외부적 성공이 내면의 공허를 채우지 못하고 있습니다.',
  },
  E: {
    code: 'E',
    name: '전환 준비형',
    nameEm: '전환 준비형',
    namePlain: '',
    badge: 'TYPE E',
    msg: '왜 살아야 하는지는 알고 있습니다. 이제 그 의미를 현실 구조 — 일과 수입 — 로 연결하는 작업이 남아 있습니다. 방향은 맞습니다. 구조만 완성하면 됩니다.',
    insight: '의미 구조는 명확하지만 일 또는 수입 구조가 아직 그것을 뒷받침하지 못합니다. 철학은 준비됐고 이제 실행 구조를 설계할 단계입니다.',
  },
  F: {
    code: 'F',
    name: '균형 설계형',
    nameEm: '균형 설계형',
    namePlain: '',
    badge: 'TYPE F',
    msg: '5대 영역의 기초 구조가 갖춰진 상태입니다. 이제 각 영역의 깊이를 더하고 영역 간 시너지를 설계할 단계입니다. 프리미너 여정의 다음 챕터로 넘어갈 준비가 됐습니다.',
    insight: '전 영역이 기초 이상으로 작동하고 있습니다. 지금의 구조를 더 정교하게 다듬고 영역 간 연결을 강화하면 삶 전체의 질이 한 단계 올라갑니다.',
  },
};

/* ── 점수 해석 ── */
const TIERS = [
  { min: 80, label: '탄탄한 구조',    bg: 'rgba(45,106,95,0.1)',   text: '#2D6A5F',  border: 'rgba(45,106,95,0.3)'  },
  { min: 60, label: '기초 구조 있음', bg: 'rgba(184,147,90,0.1)',  text: '#B8935A',  border: 'rgba(184,147,90,0.3)' },
  { min: 40, label: '구조 취약',      bg: 'rgba(160,133,108,0.1)', text: '#A0856C',  border: 'rgba(160,133,108,0.3)'},
  { min: 0,  label: '구조 부재',      bg: 'rgba(138,123,168,0.12)','text': '#8A7BA8', border: 'rgba(138,123,168,0.3)'},
];

const DOMAIN_COMMENTS = [
  // 일
  ['일의 구조가 자산을 만들지 못하고 있습니다. 소모적 방식에서 축적적 방식으로 전환을 시작하세요.',
   '방향은 맞지만 아직 일이 자산화되지 않았습니다. 포터블 스킬 축적에 집중하세요.',
   '일 구조가 점차 축적적으로 변화하고 있습니다. 레버리지를 더 강화하세요.',
   '탄탄한 일 구조를 갖고 있습니다. 개인 브랜드로 확장할 단계입니다.'],
  // 수입
  ['단일 수입 구조의 취약성이 매우 높습니다. 두 번째 수입 경로 구축이 최우선입니다.',
   '수입 다각화의 필요성을 인식하고 있지만 아직 실행이 부족합니다.',
   '수입 구조의 기초가 만들어지고 있습니다. 지식 자산화 비중을 높이세요.',
   '안정적인 다층 수입 구조를 갖추고 있습니다. 레버리지 수입 비중을 늘려가세요.'],
  // 건강
  ['건강 루틴이 없는 상태입니다. 운동·수면 중 하나부터 당장 루틴화하세요.',
   '건강 관리가 산발적입니다. 일관된 시스템을 만들어야 합니다.',
   '건강 루틴의 기초가 있습니다. 회복 구조를 더 탄탄히 하세요.',
   '훌륭한 건강 구조입니다. 이 루틴이 10년 후를 보장합니다.'],
  // 관계
  ['소모적 관계가 에너지를 빼앗고 있습니다. 관계 구조 전면 재검토가 필요합니다.',
   '관계의 질을 높이는 의도적인 설계가 필요합니다.',
   '관계 구조의 기초가 있습니다. 성장을 지지하는 네트워크를 더 확장하세요.',
   '충전적 관계망을 갖고 있습니다. 이 관계들이 전환의 자산입니다.'],
  // 의미
  ['삶의 방향감이 없는 상태입니다. 왜 사는가에 대한 답을 찾는 것이 가장 시급합니다.',
   '의미의 실마리는 있지만 아직 일상과 연결되지 않았습니다.',
   '의미 구조가 자리를 잡아가고 있습니다. 가치와 행동의 정합성을 높이세요.',
   '충만한 의미 구조를 갖고 있습니다. 이 의미를 더 많은 사람과 나누세요.'],
];

/* ── STATE ── */
let cur      = 0;
let answers  = new Array(QUESTIONS.length).fill(null);

/* ── UTILS ── */
function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getTier(score) {
  return TIERS.find(t => score >= t.min);
}

/* ── SCORE CALC ── */
function calcScores() {
  let idx = 0;
  return DOMAINS.map(d => {
    const qs = answers.slice(idx, idx + d.count);
    idx += d.count;
    const total = qs.reduce((s, v) => s + (v || 3), 0);
    return Math.round((total / (d.count * 5)) * 100);
  });
}

/* ── TYPE DETECTION ── */
function detectType(scores) {
  const H = scores.map(s => s >= 60);
  // H[0]=일, H[1]=수입, H[2]=건강, H[3]=관계, H[4]=의미
  const lowCount = H.filter(h => !h).length;

  // A: 일L + 의미L + 다른 영역도 2개 이상 L
  if (!H[0] && !H[4] && lowCount >= 3) return 'A';
  // B: 수입L + 일H
  if (!H[1] && H[0]) return 'B';
  // C: 건강L + 관계L
  if (!H[2] && !H[3]) return 'C';
  // D: 일H + 수입H + 의미L
  if (H[0] && H[1] && !H[4]) return 'D';
  // E: 의미H + (일L 또는 수입L)
  if (H[4] && (!H[0] || !H[1])) return 'E';
  // F: 전 영역 H
  return 'F';
}

/* ── RADAR DRAW ── */
function drawRadar(scores) {
  const canvas = $('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 260, H = 260, cx = 130, cy = 130, r = 95, n = 5;
  canvas.width = W; canvas.height = H;
  const angles = Array.from({ length: n }, (_, i) => -Math.PI / 2 + (2 * Math.PI / n) * i);

  ctx.clearRect(0, 0, W, H);

  // grid
  [0.25, 0.5, 0.75, 1].forEach(scale => {
    ctx.beginPath();
    angles.forEach((a, i) => {
      const x = cx + Math.cos(a) * r * scale, y = cy + Math.sin(a) * r * scale;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = 'rgba(199,199,204,0.35)';
    ctx.lineWidth = 0.5; ctx.stroke();
  });

  // axes
  angles.forEach(a => {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.strokeStyle = 'rgba(199,199,204,0.2)';
    ctx.lineWidth = 0.5; ctx.stroke();
  });

  // filled area
  ctx.beginPath();
  angles.forEach((a, i) => {
    const s = scores[i] / 100;
    const x = cx + Math.cos(a) * r * s, y = cy + Math.sin(a) * r * s;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(184,147,90,0.15)'; ctx.fill();
  ctx.strokeStyle = '#B8935A'; ctx.lineWidth = 1.5; ctx.stroke();

  // dots
  const dColors = DOMAINS.map(d => d.color);
  angles.forEach((a, i) => {
    const s = scores[i] / 100;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * s, cy + Math.sin(a) * r * s, 4, 0, Math.PI * 2);
    ctx.fillStyle = dColors[i]; ctx.fill();
  });

  // labels
  ctx.textAlign = 'center';
  ctx.fillStyle = 'var(--mist, #8E8E93)';
  const pad = 16;
  angles.forEach((a, i) => {
    const lx = cx + Math.cos(a) * (r + pad);
    const ly = cy + Math.sin(a) * (r + pad) + 4;
    ctx.font = '300 9px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#8E8E93';
    ctx.fillText(DOMAINS[i].name.replace(' 구조', ''), lx, ly);
  });
}

/* ── RENDER QUESTION ── */
function renderQ() {
  const q = QUESTIONS[cur];
  const d = DOMAINS[q.d];
  const pct = Math.round((cur / QUESTIONS.length) * 100);

  // progress
  $('prog-fill').style.width = pct + '%';
  $('quiz-counter').textContent = (cur + 1) + ' / ' + QUESTIONS.length;

  // domain strip
  const segs = $('qds-segs');
  let domIdx = 0, qIdx = 0;
  segs.innerHTML = DOMAINS.map((dom, di) => {
    const segsHtml = Array.from({ length: dom.count }, (_, si) => {
      const gi = qIdx + si;
      const cls = gi < cur ? 'qds-seg done'
                : gi === cur ? 'qds-seg current'
                : 'qds-seg';
      const style = gi === cur ? `background:${d.color}55` : gi < cur ? `background:${DOMAINS[QUESTIONS[gi].d].color}` : '';
      return `<div class="${cls}" style="${style}"></div>`;
    }).join('');
    qIdx += dom.count;
    return segsHtml;
  }).join('');

  const tag = $('qds-label');
  tag.textContent = d.name + ' · ' + d.en;
  tag.style.color = d.color;
  tag.style.borderColor = d.color + '55';

  // question fade
  const qEl  = $('quiz-q');
  const hEl  = $('quiz-hint');
  qEl.classList.add('fading'); hEl.classList.add('fading');
  setTimeout(() => {
    qEl.textContent = q.q;
    hEl.textContent = q.hint;
    qEl.classList.remove('fading'); hEl.classList.remove('fading');
  }, 180);

  // scale buttons
  const btns = $('scale-btns');
  btns.innerHTML = [1, 2, 3, 4, 5].map(v => {
    const sel = answers[cur] === v;
    const style = sel ? `background:${d.color};border-color:${d.color};color:#fff;` : '';
    return `<button class="scale-btn${sel ? ' sel' : ''}" data-v="${v}" style="${style}">
      <span class="s-num">${v}</span>
      <span class="s-dot"></span>
    </button>`;
  }).join('');

  btns.querySelectorAll('.scale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      answers[cur] = parseInt(btn.dataset.v);
      btns.querySelectorAll('.scale-btn').forEach(b => {
        b.classList.remove('sel'); b.style.cssText = '';
      });
      btn.classList.add('sel');
      btn.style.background = d.color;
      btn.style.borderColor = d.color;
      btn.style.color = '#fff';
      $('btn-next').classList.add('on');
    });
  });

  // nav
  $('btn-next').classList.toggle('on', answers[cur] !== null);
  $('btn-next').textContent = cur === QUESTIONS.length - 1 ? '결과 보기 →' : '다음 →';
  $('btn-prev').disabled = cur === 0;
}

/* ── BUILD RESULT ── */
function buildResult() {
  const scores   = calcScores();
  const typeKey  = detectType(scores);
  const type     = TYPES[typeKey];
  const avg      = Math.round(scores.reduce((a, b) => a + b, 0) / 5);

  showScreen('s-result');
  requestAnimationFrame(() => drawRadar(scores));

  // Type card
  $('tc-badge').textContent   = type.badge;
  $('tc-name').innerHTML      = type.nameEm
    ? `<em>${type.nameEm}</em>${type.namePlain ? ' ' + type.namePlain : ''}`
    : type.name;
  $('tc-msg').textContent     = type.msg;
  $('tc-avg-num').textContent = avg;

  // Score cards
  const scoreCol = $('scores-col');
  scoreCol.innerHTML = DOMAINS.map((d, i) => {
    const s    = scores[i];
    const tier = getTier(s);
    const tierIdx = s >= 80 ? 3 : s >= 60 ? 2 : s >= 40 ? 1 : 0;
    const comment  = DOMAIN_COMMENTS[i][tierIdx];
    return `
      <div class="score-card fade-in" style="animation-delay:${i * 0.08}s">
        <div class="sc-top">
          <div class="sc-name">
            <div class="sc-dot" style="background:${d.color};"></div>
            ${d.name}
          </div>
          <div class="sc-num" style="color:${d.color};">${s}</div>
        </div>
        <div class="sc-tier" style="background:${tier.bg};color:${tier.text};border:0.5px solid ${tier.border};">
          ${tier.label}
        </div>
        <div class="sc-bar-track">
          <div class="sc-bar-fill" id="bar-${i}" style="width:0%;background:${d.color};"></div>
        </div>
      </div>`;
  }).join('');

  // animate bars
  setTimeout(() => {
    scores.forEach((s, i) => {
      const bar = $('bar-' + i);
      if (bar) bar.style.width = s + '%';
    });
  }, 200);

  // Insight
  $('insight-text').textContent = type.insight;

  // Store scores + raw answers for email payload
  window._diagScores   = scores;
  window._diagType     = typeKey;
  window._diagTypeName = type.name;
  window._diagAvg      = avg;
  window._diagAnswers   = [...answers];  // 22개 문항별 응답값 저장
  window._diagQuestions = QUESTIONS.map(q => q.q);
}

/* ── NETLIFY FUNCTION 연동 ── */
const SUBMIT_URL = '/api/diagnosis-submit';

async function submitEmail(e) {
  e.preventDefault();

  const email = $('ec-email').value.trim();
  const name  = $('ec-name').value.trim();
  if (!email) return;

  const btn       = $('ec-submit');
  btn.disabled    = true;
  btn.textContent = '전송 중...';

  const payload = {
    email,
    name:      name || '익명',
    typeKey:   window._diagType      || 'F',
    typeName:  window._diagTypeName  || '',
    avg:       window._diagAvg       || 0,
    scores:    window._diagScores    || [],
    answers:   window._diagAnswers   || [],
    questions: window._diagQuestions || [],
  };

  try {
    const res  = await fetch(SUBMIT_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();

    if (res.ok && json.ok) {
      $('ec-form-wrap').style.display = 'none';
      $('ec-success').classList.add('show');
    } else {
      throw new Error(json.error || '전송 실패');
    }
  } catch (err) {
    console.error('진단 결과 전송 오류:', err);
    btn.disabled    = false;
    btn.textContent = '무료로 받기 →';
    alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  // start
  $('btn-start').addEventListener('click', () => {
    showScreen('s-quiz');
    renderQ();
  });

  // next
  $('btn-next').addEventListener('click', () => {
    if (!$('btn-next').classList.contains('on')) return;
    if (cur === QUESTIONS.length - 1) { buildResult(); return; }
    cur++;
    renderQ();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // prev
  $('btn-prev').addEventListener('click', () => {
    if (cur > 0) { cur--; renderQ(); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // retry
  $('btn-retry').addEventListener('click', () => {
    cur = 0;
    answers = new Array(QUESTIONS.length).fill(null);
    showScreen('s-intro');
    $('prog-fill').style.width = '0%';
  });

  // email form
  $('ec-email-form').addEventListener('submit', submitEmail);

  // email input validation
  $('ec-email').addEventListener('input', () => {
    const val = $('ec-email').value.trim();
    $('ec-submit').disabled = !val || !val.includes('@');
  });
});
