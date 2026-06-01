/* ══════════════════════════════════════════════════════
   FreeMeaner · copy-protect.js
   콘텐츠 보호 스크립트
   ─ 텍스트 드래그 선택 차단
   ─ 우클릭 컨텍스트 메뉴 차단
   ─ Ctrl+C / Ctrl+A / Ctrl+S / Ctrl+U 단축키 차단
   ─ F12 / Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C 차단
   ─ 개발자 도구 감지 시 경고 오버레이 표시
══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* 1. 우클릭 차단 ─────────────────────────────────── */
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  });

  /* 2. 단축키 차단 ─────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    var k = e.key ? e.key.toUpperCase() : '';
    var ctrl  = e.ctrlKey || e.metaKey;   // Mac Cmd 포함
    var shift = e.shiftKey;

    /* Ctrl+C, Ctrl+A, Ctrl+S, Ctrl+U */
    if (ctrl && (k === 'C' || k === 'A' || k === 'S' || k === 'U')) {
      e.preventDefault();
      return false;
    }
    /* F12 */
    if (k === 'F12') {
      e.preventDefault();
      return false;
    }
    /* Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (개발자 도구) */
    if (ctrl && shift && (k === 'I' || k === 'J' || k === 'C')) {
      e.preventDefault();
      return false;
    }
  });

  /* 3. 텍스트 드래그 선택 차단 (CSS) ──────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '*, *::before, *::after {',
    '  -webkit-user-select: none !important;',
    '  -moz-user-select:    none !important;',
    '  -ms-user-select:     none !important;',
    '  user-select:         none !important;',
    '}',
    /* 진단 폼 인풋은 입력 가능하게 예외 처리 */
    'input, textarea {',
    '  -webkit-user-select: text !important;',
    '  -moz-user-select:    text !important;',
    '  user-select:         text !important;',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  /* 4. 드래그 이벤트 차단 ─────────────────────────── */
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
    return false;
  });



})();
