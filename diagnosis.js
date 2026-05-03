function onFormSubmit(e) {
  var values = e.values;
  var name    = values[1] || '익명';
  var email   = values[2];
  var rawData = values[3];

  if (!email) return;

  var data = {};
  try { data = JSON.parse(rawData); } catch(err) { data = {}; }

  var typeCode = data.typeCode || 'F';
  var typeName = data.typeName || '';
  var scores   = data.scores   || [0,0,0,0,0];
  var avg      = data.avg      || 0;

  var domainLabels = ['일 구조','수입 구조','건강 구조','관계 구조','의미 구조'];

  var typeMessages = {
    A: { headline: '지금 가장 열심히 살고 있지만, 그 열심이 삶을 갉아먹고 있습니다.', body: '열심히가 아닌 올바른 방향이 필요한 시점입니다. 5대 영역 중 4개가 동시에 취약한 상태는 노력의 문제가 아니라 구조의 문제입니다. 지금 당장 가장 취약한 영역 하나에만 집중해보세요.', action: '오늘 할 일: "이 조직이 없어도 나에게 남는 역량"을 3가지 적어보세요.' },
    B: { headline: '하나의 수입원에 삶 전체가 걸려 있습니다.', body: '지금 당장 두 번째 기둥을 세우는 것이 가장 시급한 과제입니다. 수입 구조가 단일 경로에 집중되어 있어 작은 충격에도 전체가 흔들릴 수 있습니다.', action: '오늘 할 일: 지금 내가 아는 것 중 누군가에게 도움이 될 것 하나를 적어보세요.' },
    C: { headline: '건강과 관계라는 삶의 인프라가 흔들리고 있습니다.', body: '이 두 영역이 무너지면 다른 모든 성취가 의미를 잃습니다. 지금 당장 가장 기본적인 것을 먼저 돌볼 필요가 있습니다.', action: '오늘 할 일: 주 3회 30분 걷기, 밤 12시 전 취침 중 하나를 선택해 2주간 실행해보세요.' },
    D: { headline: '겉으로 보면 안정적이지만 안에서 공허함이 자랍니다.', body: '이제 성취를 넘어 충만으로 이동할 때입니다. 더 많은 성공이 아니라 더 깊은 의미가 필요한 시점입니다.', action: '오늘 할 일: "나는 왜 사는가"에 대한 답을 한 문장으로 적어보세요.' },
    E: { headline: '왜 살아야 하는지는 알고 있습니다.', body: '이제 그 의미를 현실 구조 — 일과 수입 — 로 연결하는 작업이 남아 있습니다. 방향은 맞습니다. 구조만 완성하면 됩니다.', action: '오늘 할 일: 내가 중요하게 생각하는 가치와 연결된 일 한 가지를 이번 주 시작해보세요.' },
    F: { headline: '5대 영역의 기초 구조가 갖춰진 상태입니다.', body: '이제 각 영역의 깊이를 더하고 영역 간 시너지를 설계할 단계입니다. 지금의 균형을 더 정교하게 다듬으면 삶 전체의 질이 한 단계 올라갑니다.', action: '오늘 할 일: 5개 영역 중 가장 낮은 점수의 영역에 이번 달 집중해보세요.' },
  };

  var t = typeMessages[typeCode] || typeMessages['F'];

  var scoreRows = domainLabels.map(function(label, i) {
    return label + ': ' + (scores[i] || 0) + '점';
  }).join('\n');

  var subject = '[프리미너] ' + name + '님의 삶 구조 진단 결과 — [' + typeCode + '] ' + typeName;

  var body = name + '님 안녕하세요.\n\n'
    + '삶 구조 진단 결과를 보내드립니다.\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '유형: [' + typeCode + '] ' + typeName + '\n'
    + '전체 평균: ' + avg + '점\n\n'
    + '영역별 점수\n'
    + scoreRows + '\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + '핵심 진단\n'
    + t.headline + '\n\n'
    + t.body + '\n\n'
    + '━━━━━━━━━━━━━━━━━━━━\n'
    + t.action + '\n\n'
    + '삶은 노력이 아닌 구조로 바뀝니다. 3년이면 충분합니다.\n\n'
    + '프리미너 FreeMeaner\n'
    + 'https://juhewow.gumroad.com/l/hsvdwi';

  GmailApp.sendEmail(email, subject, body);
}
