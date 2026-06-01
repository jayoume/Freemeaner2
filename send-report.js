/* ══════════════════════════════════════════════════════════════
   FreeMeaner · netlify/functions/send-report.js

   역할:
     운영자가 알림 이메일의 [결과서 발송하기] 버튼 클릭 시:
     1. 보안 토큰 검증
     2. Google Sheets에서 해당 이메일의 진단 데이터 조회
     3. Claude API로 심층 진단 결과서 생성
     4. 사용자 이메일로 결과서 발송 (Gmail)
     5. Google Sheets '결과서발송' 열에 완료 기록

   환경변수:
     GOOGLE_SERVICE_ACCOUNT_EMAIL
     GOOGLE_PRIVATE_KEY
     GOOGLE_SHEET_ID
     GMAIL_USER          → juhewowo@gmail.com
     GMAIL_PASS          → juhewowo 앱 비밀번호 16자리
     GEMINI_API_KEY      → Google AI Studio에서 발급받은 API 키
     REPORT_SECRET       → diagnosis-submit.js와 동일한 값
     URL_BASE            → 홈페이지 주소
══════════════════════════════════════════════════════════════ */

const nodemailer     = require('nodemailer');
const { createSign } = require('crypto');
const crypto         = require('crypto');

/* ── Google 서비스 계정 액세스 토큰 ─────────────────────────── */
async function getGoogleAccessToken() {
  const email      = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');
  const now        = Math.floor(Date.now() / 1000);

  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })).toString('base64url');

  const unsigned = `${header}.${payload}`;
  const signer   = createSign('RSA-SHA256');
  signer.update(unsigned);
  const jwt = `${unsigned}.${signer.sign(privateKey, 'base64url')}`;

  const res  = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(`Google 인증 실패: ${JSON.stringify(json)}`);
  return json.access_token;
}

/* ── 상수 ───────────────────────────────────────────────────── */
const DOMAINS = [
  { name: '일 구조',   count: 5 },
  { name: '수입 구조', count: 5 },
  { name: '건강 구조', count: 4 },
  { name: '관계 구조', count: 4 },
  { name: '의미 구조', count: 4 },
];

const TYPES = {
  A: '소진형 연소자', B: '외줄 타기형',  C: '인프라 붕괴형',
  D: '공허한 성공형', E: '전환 준비형',  F: '균형 설계형',
};

const TYPE_DESC = {
  A: '여러 영역에서 에너지를 쏟고 있지만 정작 자신을 위한 구조가 없는 상태입니다. 지금 가장 필요한 것은 회복 구조입니다.',
  B: '수입은 있지만 단일 구조에 의존하고 있어 변화에 취약한 상태입니다. 다층 구조 설계가 시급합니다.',
  C: '건강과 관계 기반이 흔들리고 있어 다른 영역도 연쇄적으로 무너질 위험이 있습니다. 기초 구조부터 점검이 필요합니다.',
  D: '외적 성취는 있지만 의미와 관계 영역이 비어있는 상태입니다. 지금이 구조를 재설계할 최적의 시점입니다.',
  E: '변화를 인식하고 준비하고 있지만 아직 구체적인 구조가 부족한 상태입니다. 방향은 맞습니다, 이제 실행 구조가 필요합니다.',
  F: '전반적으로 균형 잡힌 구조를 갖추고 있습니다. 지금은 유지보다 확장과 심화를 고민할 시점입니다.',
};

function getTierLabel(s) {
  if (s >= 80) return '탄탄한 구조';
  if (s >= 60) return '기초 구조 있음';
  if (s >= 40) return '구조 취약';
  return '구조 부재';
}

function verifyToken(email, token) {
  const expected = crypto
    .createHmac('sha256', process.env.REPORT_SECRET || 'fallback-secret')
    .update(email).digest('hex').slice(0, 24);
  return expected === token;
}

/* ════════════════════════════════════════════════════════════
   1. Google Sheets에서 진단 데이터 조회
════════════════════════════════════════════════════════════ */
async function getFromSheets(email) {
  const token   = await getGoogleAccessToken();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const base    = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
  const auth    = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const res  = await fetch(`${base}/values/Sheet1`, { headers: auth });
  const json = await res.json();

  if (!json.values || json.values.length < 2) return null;

  const hdrs = json.values[0];
  const rows = json.values.slice(1);
  const eIdx = hdrs.indexOf('이메일');
  if (eIdx === -1) return null;

  // 해당 이메일의 가장 최근 행
  let targetRow = null;
  let targetIdx = -1;
  rows.forEach((row, i) => {
    if (row[eIdx] === email) { targetRow = row; targetIdx = i; }
  });
  if (!targetRow) return null;

  const get = key => {
    const i = hdrs.indexOf(key);
    return i !== -1 ? (targetRow[i] || '') : '';
  };

  return {
    name:     get('이름'),
    email:    get('이메일'),
    typeKey:  get('진단유형코드'),
    typeName: get('진단유형명'),
    avg:      Number(get('전체평균')),
    scores: [
      Number(get('일구조')),
      Number(get('수입구조')),
      Number(get('건강구조')),
      Number(get('관계구조')),
      Number(get('의미구조')),
    ],
    answers: Array.from({ length: 22 }, (_, i) => {
      const v = get(`Q${i + 1}`);
      return v && v !== '-' ? Number(v) : null;
    }),
    rowNum:  targetIdx + 2,  // 1-indexed + 헤더
    token,
    auth,
    base,
  };
}

/* ════════════════════════════════════════════════════════════
   2. Google Sheets 발송 완료 표시
════════════════════════════════════════════════════════════ */
async function markAsSent(diagData) {
  try {
    const hdrsRes  = await fetch(`${diagData.base}/values/Sheet1!1:1`, { headers: diagData.auth });
    const hdrsJson = await hdrsRes.json();
    const hdrs     = hdrsJson.values?.[0] || [];
    const colIdx   = hdrs.indexOf('결과서발송');
    if (colIdx === -1) return;

    const col      = String.fromCharCode(65 + colIdx);
    const cellRef  = `Sheet1!${col}${diagData.rowNum}`;
    const sentTime = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    await fetch(`${diagData.base}/values/${cellRef}?valueInputOption=RAW`, {
      method: 'PUT',
      headers: diagData.auth,
      body: JSON.stringify({ values: [[`발송완료 · ${sentTime}`]] }),
    });
  } catch (e) {
    console.warn('발송 완료 표시 실패 (치명적이지 않음):', e.message);
  }
}

/* ════════════════════════════════════════════════════════════
   3. Claude API로 심층 결과서 생성
════════════════════════════════════════════════════════════ */
async function generateReport(d) {
  const scoreText = DOMAINS.map((dom, i) =>
    `- ${dom.name}: ${d.scores[i]}점 (${getTierLabel(d.scores[i])})`
  ).join('\n');

  const weakAreas = DOMAINS
    .filter((_, i) => d.scores[i] < 60)
    .map((dom, i) => `${dom.name}(${d.scores[DOMAINS.indexOf(dom)]}점)`)
    .join(', ') || '없음';

  const strongAreas = DOMAINS
    .filter((_, i) => d.scores[i] >= 70)
    .map((dom, i) => `${dom.name}(${d.scores[DOMAINS.indexOf(dom)]}점)`)
    .join(', ') || '없음';

  const prompt = `당신은 프리미너 Life 2.0의 삶 구조 설계 전문가입니다.
아래 진단 결과를 바탕으로 ${d.name || '고객'}님을 위한 개인화된 심층 진단 결과서를 작성해주세요.

## 진단 정보
- 이름: ${d.name || '익명'}님
- 진단 유형: [${d.typeKey}] ${TYPES[d.typeKey]}
- 전체 평균: ${d.avg}점
- 유형 설명: ${TYPE_DESC[d.typeKey]}

## 영역별 점수
${scoreText}
- 강점 영역: ${strongAreas}
- 취약 영역: ${weakAreas}

## 작성 지침
1. 따뜻하고 전문적인 어조. 감정이 아닌 구조의 관점으로 해석
2. 각 섹션을 명확히 구분하여 작성
3. 구체적이고 실천 가능한 제안 포함
4. 전체 분량: 약 800~1,000자

## 결과서 구조 (반드시 이 순서로)

**[진단 유형 해석]**
현재 삶의 구조 상태를 유형 중심으로 설명 (150자 내외)

**[영역별 구조 분석]**
5대 영역 각각의 현재 상태와 구조적 의미 (각 60자 내외)

**[핵심 인사이트]**
이 진단 결과에서 가장 중요하게 봐야 할 구조적 패턴 1~2가지 (150자 내외)

**[90일 실험 제안]**
지금 당장 시작할 수 있는 구체적 행동 3가지. 작고 실천 가능하게. (각 50자 내외)

**[마무리 메시지]**
격려와 함께 다음 단계(뉴스레터 또는 워크북)로 자연스럽게 안내 (100자 내외)`;

  const apiKey = process.env.GEMINI_API_KEY;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
      }),
    }
  );

  if (!res.ok) throw new Error(`Gemini API 실패: ${await res.text()}`);
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

/* ════════════════════════════════════════════════════════════
   4. 사용자에게 결과서 이메일 발송
════════════════════════════════════════════════════════════ */
async function sendReportEmail(d, reportText) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,     // juhewowo@gmail.com
      pass: process.env.GMAIL_PASS,
    },
  });

  // 마크다운 섹션 헤더를 HTML로 변환
  const reportHtml = reportText
    .replace(/\*\*\[(.+?)\]\*\*/g,
      '<h3 style="color:#1B3A6B;margin-top:24px;border-left:4px solid #1B3A6B;padding-left:12px;">$1</h3>')
    .replace(/\n/g, '<br>');

  const scoreRows = DOMAINS.map((dom, i) => `
    <tr style="background:${i % 2 === 0 ? '#f9f9f9' : '#fff'}">
      <td style="padding:8px 12px;color:#555;">${dom.name}</td>
      <td style="padding:8px 12px;font-weight:bold;">${d.scores[i]}점</td>
      <td style="padding:8px 12px;">
        <div style="background:#e0e0e0;border-radius:4px;height:8px;width:120px;">
          <div style="background:#1B3A6B;border-radius:4px;height:8px;width:${d.scores[i] * 1.2}px;"></div>
        </div>
      </td>
      <td style="padding:8px 12px;color:#888;font-size:12px;">${getTierLabel(d.scores[i])}</td>
    </tr>`).join('');

  const base = process.env.URL_BASE || '';

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="font-family:Arial,sans-serif;color:#1A1A2E;max-width:600px;margin:0 auto;padding:0;">

  <div style="background:#1B3A6B;padding:32px 24px;text-align:center;">
    <div style="color:#aac4e8;font-size:13px;margin-bottom:8px;">Freemeaner · 프리미너 Life 2.0</div>
    <h1 style="color:#fff;font-size:22px;margin:0;">삶 구조 심층 진단 결과서</h1>
    <div style="color:#aac4e8;font-size:13px;margin-top:8px;">
      ${d.name || ''}님 · ${new Date().toLocaleDateString('ko-KR')}
    </div>
  </div>

  <div style="background:#EEF4FB;padding:24px;text-align:center;border-bottom:1px solid #dce8f5;">
    <div style="color:#2E5FA3;font-size:13px;margin-bottom:6px;">나의 삶 구조 유형</div>
    <div style="font-size:28px;font-weight:bold;color:#1B3A6B;">
      [${d.typeKey}] ${TYPES[d.typeKey]}
    </div>
    <div style="color:#555;font-size:14px;margin-top:8px;">전체 평균 ${d.avg}점</div>
  </div>

  <div style="padding:24px;">
    <h2 style="color:#1B3A6B;font-size:16px;margin-bottom:12px;">영역별 구조 점수</h2>
    <table style="width:100%;border-collapse:collapse;">${scoreRows}</table>
  </div>

  <div style="padding:0 24px 24px;">
    <h2 style="color:#1B3A6B;font-size:16px;border-bottom:2px solid #1B3A6B;padding-bottom:8px;">
      심층 구조 분석
    </h2>
    <div style="line-height:1.8;font-size:14px;color:#333;">
      ${reportHtml}
    </div>
  </div>

  <div style="background:#f5f8ff;padding:24px;text-align:center;margin:0 0 24px;">
    <p style="color:#555;font-size:14px;margin-bottom:16px;">더 깊은 구조 설계를 원하신다면</p>
    <a href="${base}/newsletter.html"
       style="display:inline-block;background:#1B3A6B;color:#fff;
              padding:12px 28px;border-radius:6px;text-decoration:none;
              font-size:14px;font-weight:bold;margin:4px;">
      뉴스레터 구독하기 →
    </a>
    <a href="${base}/diagnosis.html"
       style="display:inline-block;background:transparent;color:#1B3A6B;
              padding:12px 28px;border-radius:6px;text-decoration:none;
              font-size:14px;border:1px solid #1B3A6B;margin:4px;">
      진단 다시 받기
    </a>
  </div>

  <div style="padding:16px 24px;border-top:1px solid #eee;text-align:center;">
    <p style="color:#aaa;font-size:11px;margin:0;">
      © 2026 Freemeaner · 프리미너 Life 2.0<br>
      본 결과서는 자기 탐색을 위한 참고 자료이며 전문적 진단을 대체하지 않습니다.
    </p>
  </div>

</body>
</html>`;

  await transporter.sendMail({
    from:    `"프리미너 Life 2.0" <${process.env.GMAIL_USER}>`,
    to:      d.email,
    subject: `[프리미너] ${d.name || ''}님의 삶 구조 심층 진단 결과서가 도착했습니다`,
    html,
  });
}

/* ════════════════════════════════════════════════════════════
   메인 핸들러 (GET — 이메일 버튼 클릭)
════════════════════════════════════════════════════════════ */
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET')
    return { statusCode: 405, body: 'Method not allowed' };

  const { email, token } = event.queryStringParameters || {};

  if (!email || !token)
    return { statusCode: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' },
             body: errorPage('잘못된 요청입니다.') };

  if (!verifyToken(email, token))
    return { statusCode: 403, headers: { 'Content-Type': 'text/html; charset=utf-8' },
             body: errorPage('유효하지 않은 요청입니다.') };

  try {
    const diagData = await getFromSheets(email);
    if (!diagData)
      return { statusCode: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' },
               body: errorPage('진단 데이터를 찾을 수 없습니다.') };

    const reportText = await generateReport(diagData);
    await sendReportEmail(diagData, reportText);
    await markAsSent(diagData);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: successPage(email),
    };

  } catch (err) {
    console.error('send-report 오류:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      body: errorPage(`오류가 발생했습니다: ${err.message}`),
    };
  }
};

/* ── 성공 / 실패 페이지 ─────────────────────────────────────── */
function successPage(email) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<title>발송 완료</title>
<style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;
min-height:100vh;margin:0;background:#f5f8ff;}
.card{background:#fff;padding:40px;border-radius:12px;text-align:center;max-width:400px;
box-shadow:0 4px 20px rgba(0,0,0,0.08);}
.icon{font-size:48px;margin-bottom:16px;}
h2{color:#1B3A6B;margin:0 0 12px;}p{color:#555;font-size:14px;line-height:1.6;}</style>
</head><body><div class="card">
<div class="icon">✅</div>
<h2>결과서 발송 완료</h2>
<p><strong>${email}</strong>으로<br>심층 진단 결과서가 발송되었습니다.</p>
<p style="color:#aaa;font-size:12px;margin-top:20px;">
Google Sheets의 '결과서발송' 열에 완료가 기록됩니다.</p>
</div></body></html>`;
}

function errorPage(msg) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">
<title>오류</title>
<style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;
min-height:100vh;margin:0;background:#fff5f5;}
.card{background:#fff;padding:40px;border-radius:12px;text-align:center;max-width:400px;
box-shadow:0 4px 20px rgba(0,0,0,0.08);}
.icon{font-size:48px;margin-bottom:16px;}
h2{color:#c0392b;margin:0 0 12px;}p{color:#555;font-size:14px;}</style>
</head><body><div class="card">
<div class="icon">❌</div>
<h2>오류 발생</h2>
<p>${msg}</p>
</div></body></html>`;
}
