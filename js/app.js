/* =====================================================
   펜싱 규칙 & 판정 퀴즈 — 앱 로직
   - 해시 라우터 (#/, #/rules/basic, #/rules/advanced, #/quiz ...)
   - 규칙 페이지 렌더링 (RULES: rules-data.js)
   - 퀴즈 엔진 + YouTube IFrame Player (QUESTIONS: questions.js)
   ===================================================== */
(function () {
  'use strict';

  const $app = document.getElementById('app');

  /* ---------- 유틸 ---------- */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const SIDE_KO = { L: '왼쪽', R: '오른쪽', S: '무효(시뮬따네)' };
  const SIDE_FR = { L: '고슈', R: '드와뜨' };
  const other = (s) => (s === 'L' ? 'R' : 'L');
  // 조사 '로/으로' 자동 선택 (받침 유무)
  const ro = (w) => { const c = w.charCodeAt(w.length - 1); if (c < 0xac00 || c > 0xd7a3) return w + '로'; const jong = (c - 0xac00) % 28; return w + (jong === 0 || jong === 8 ? '로' : '으로'); };

  const LEVELS = {
    1: { name: '초급', ico: '🌱', desc: '아딱·빠라드-리뽀스트·꽁딱처럼 판정이 명확한 동작. 심판과 커뮤니티가 거의 일치한 클립.', tag: '입문 1년차' },
    2: { name: '중급', ico: '⚔️', desc: '초급보다 판정이 갈리는 장면. 준비 동작 중 공격, 말빠레, 르미즈 등 규칙을 알아야 보이는 동작. (베타)', tag: '선수·심판 지망' },
    3: { name: '상급', ico: '🏆', desc: '양쪽 불이 모두 켜진 장면 중 심판들끼리도 갈리는 동작과 시뮬따네. 0.5배속으로 팔꿈치를 보세요.', tag: '국제 심판 수준' },
  };

  /* ---------- 편집 모드 (수정본은 js/overrides.js 에 GitHub API로 저장) ---------- */
  const GH_REPO = 'warriorsthelws-rgb/fencing-quiz';
  const OV = (typeof OVERRIDES !== 'undefined') ? OVERRIDES : { rules: {}, questions: {} };
  OV.rules = OV.rules || {}; OV.questions = OV.questions || {};
  let editMode = false, dirty = 0;
  try { editMode = localStorage.getItem('fq_edit') === '1'; } catch (e) { /* noop */ }
  QUESTIONS.forEach((q) => Object.assign(q, OV.questions[q.id] || {}));

  function markDirty() { dirty++; renderEditBar(); }
  function renderEditBar() {
    let bar = document.getElementById('edit-bar');
    if (!editMode) { if (bar) bar.remove(); return; }
    if (!bar) { bar = el('<div id="edit-bar" class="edit-bar"></div>'); document.body.appendChild(bar); }
    bar.innerHTML = `<span>✏️ 편집 모드${dirty ? ` · 변경 ${dirty}건` : ''}</span>
      <button class="btn btn-primary" id="edit-save" ${dirty ? '' : 'disabled'}>GitHub에 저장</button>
      <button class="btn" id="edit-off">끄기</button>`;
    bar.querySelector('#edit-save').addEventListener('click', saveOverrides);
    bar.querySelector('#edit-off').addEventListener('click', () => toggleEdit(false));
  }
  function toggleEdit(on) {
    editMode = on;
    try { localStorage.setItem('fq_edit', on ? '1' : '0'); } catch (e) { /* noop */ }
    renderEditBar(); render();
  }
  document.getElementById('edit-toggle').addEventListener('click', (e) => { e.preventDefault(); toggleEdit(!editMode); });

  async function saveOverrides() {
    let token = '';
    try { token = localStorage.getItem('fq_gh_token') || ''; } catch (e) { /* noop */ }
    if (!token) {
      token = prompt('GitHub 개인 액세스 토큰을 붙여넣으세요.\n(github.com → Settings → Developer settings → Fine-grained tokens, 이 저장소의 Contents: Read and write 권한)\n이 브라우저에만 저장됩니다.') || '';
      if (!token) return;
      try { localStorage.setItem('fq_gh_token', token.trim()); } catch (e) { /* noop */ }
    }
    const headers = { Authorization: `Bearer ${token.trim()}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' };
    const api = `https://api.github.com/repos/${GH_REPO}/contents/js/overrides.js`;
    const btn = document.getElementById('edit-save'); if (btn) { btn.disabled = true; btn.textContent = '저장 중…'; }
    try {
      const cur = await fetch(api, { headers }).then((r) => (r.ok ? r.json() : null));
      const content = "/* 사이트의 '편집 모드'에서 저장한 수정본. 직접 고쳐도 됩니다.\n" +
        '   rules.<basic|advanced>.<섹션id> = 섹션 본문 HTML (원본 rules-data.js 대신 사용)\n' +
        '   questions.<문제id> = { level: 1|2|3, explain: "이 문제 전용 해설" }   (questions.js 재생성해도 유지됨) */\n' +
        `const OVERRIDES = ${JSON.stringify(OV, null, 1)};\n`;
      const body = { message: `편집 모드: 수정 ${dirty}건`, content: btoa(unescape(encodeURIComponent(content))), branch: 'main' };
      if (cur && cur.sha) body.sha = cur.sha;
      const r = await fetch(api, { method: 'PUT', headers, body: JSON.stringify(body) });
      if (!r.ok) throw new Error(`${r.status} ${(await r.json()).message || ''}`);
      dirty = 0; renderEditBar();
      alert('저장했습니다. 1~2분 뒤 사이트에 반영됩니다.');
    } catch (err) {
      if (/40[13]/.test(String(err))) { try { localStorage.removeItem('fq_gh_token'); } catch (e) { /* noop */ } }
      alert('저장 실패: ' + err.message + (/40[13]/.test(String(err)) ? '\n토큰을 다시 확인하세요 (다음 저장 때 다시 물어봅니다).' : ''));
      renderEditBar();
    }
  }

  /* ---------- 라우터 ---------- */
  function currentPath() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [path, query = ''] = raw.split('?');
    const params = Object.fromEntries(new URLSearchParams(query));
    return { path: path.replace(/\/+$/, '') || '/', params };
  }

  function navigate(hash) { location.hash = hash; }

  function updateNav(path) {
    const key = path === '/' ? 'home' : path.startsWith('/rules') ? 'rules' : path.startsWith('/quiz') ? 'quiz' : '';
    document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === key));
  }

  function render() {
    const { path, params } = currentPath();
    updateNav(path);
    if (!path.startsWith('/quiz/play')) Quiz.leaveView();

    if (path === '/') renderHome();
    else if (path.startsWith('/rules')) renderRules(path.split('/')[2] || 'basic', params);
    else if (path === '/quiz') renderWeaponSelect();
    else if (path === '/quiz/level') renderLevelSelect(params);
    else if (path === '/quiz/play') Quiz.enterView(params);
    else if (path === '/quiz/result') Quiz.renderResult();
    else renderHome();

    if (!path.startsWith('/rules')) window.scrollTo({ top: 0, behavior: 'instant' });
  }

  window.addEventListener('hashchange', render);

  /* ---------- 홈 ---------- */
  function renderHome() {
    const total = QUESTIONS.length;
    const byLevel = [1, 2, 3].map((l) => QUESTIONS.filter((q) => q.level === l).length);
    $app.innerHTML = `
      <section class="hero">
        <span class="badge">FOIL · 플러레 편</span>
        <h1>펜싱 공격권,<br>보면서 배우자</h1>
        <p>플러레의 공격권(우선권) 규칙을 쉽게 정리하고, 실제 국제대회 영상으로 "누구의 점수인지" 직접 판정해 보는 퀴즈입니다. 휴대폰과 컴퓨터 모두에서 볼 수 있어요.</p>
        <div class="btn-row">
          <a class="btn btn-primary btn-lg" href="#/quiz">🎯 판정 퀴즈 시작</a>
          <a class="btn btn-ghost btn-lg" style="color:#fff;border-color:rgba(255,255,255,.35)" href="#/rules/basic">📖 규칙부터 읽기</a>
        </div>
      </section>
      <div class="grid-2">
        <a class="feature" href="#/rules/basic">
          <div class="ico">🧭</div>
          <h3>기본 개념</h3>
          <p>유효면과 불, 공격권이 무엇인지, 아딱·빠라드-리뽀스트·꽁딱이 어떻게 판정되는지. 심판 용어까지.</p>
          <span class="cta">읽어보기 →</span>
        </a>
        <a class="feature" href="#/rules/advanced">
          <div class="ico">🔬</div>
          <h3>심화 개념</h3>
          <p>린느, 프레파라시옹, 아딱 노, 르미즈 vs 리뽀스트, 복합 공격의 한 템포, 시뮬따네 판단 기준.</p>
          <span class="cta">읽어보기 →</span>
        </a>
        <a class="feature" href="#/quiz">
          <div class="ico">🎬</div>
          <h3>영상 판정 퀴즈</h3>
          <p>영상을 한 번 보고 누구 불인지, 이유는 무엇인지 고르면 바로 정답과 해설이 나옵니다. 헷갈리면 0.5배속으로!</p>
          <span class="cta">총 ${total}문제 · 초급 ${byLevel[0]} / 중급 ${byLevel[1]} / 상급 ${byLevel[2]} →</span>
        </a>
        <div class="feature" style="cursor:default">
          <div class="ico">💡</div>
          <h3>이렇게 활용하세요</h3>
          <p>① 기본 개념을 읽고 초급 퀴즈 → ② 틀린 문제의 해설에서 규칙 링크로 복습 → ③ 심화 개념 후 중급·상급 도전.</p>
        </div>
      </div>`;
  }

  /* ---------- 규칙 페이지 ---------- */
  // 섹션 참고 영상 (유튜브 임베드, 화면에 보일 때 로드)
  function renderVideos(videos) {
    if (!videos || !videos.length) return '';
    return `<div class="vids"><div class="vids-h">🎬 참고 영상</div><div class="vids-grid">${videos.map((v) => `
      <figure class="vid">
        <div class="vid-frame"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/${esc(v.id)}${v.start ? `?start=${v.start}` : ''}" title="${esc(v.title)}" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
        <figcaption><a href="https://www.youtube.com/watch?v=${esc(v.id)}" target="_blank" rel="noopener">${esc(v.title)}</a>${v.note ? `<span>${esc(v.note)}</span>` : ''}</figcaption>
      </figure>`).join('')}</div></div>`;
  }

  let tocObserver = null;
  function renderRules(key, params) {
    const page = RULES[key] || RULES.basic;
    const otherKey = key === 'advanced' ? 'basic' : 'advanced';
    $app.innerHTML = `
      <div class="rules-tabs">
        <a href="#/rules/basic" class="${key === 'basic' ? 'active' : ''}">기본 개념</a>
        <a href="#/rules/advanced" class="${key === 'advanced' ? 'active' : ''}">심화 개념</a>
      </div>
      <div class="rules-layout">
        <aside class="rules-side">
          <nav class="toc" id="toc">
            ${page.sections.map((s, i) => `<a href="#/rules/${page.key}?s=${s.id}" data-sec="${s.id}">${i + 1}. ${esc(s.title)}</a>`).join('')}
          </nav>
        </aside>
        <div class="rules-main">
          <div class="card" style="margin-bottom:16px">
            <h1 style="font-size:24px">${esc(page.title)}</h1>
            <p style="color:var(--text-2);margin:0">${esc(page.subtitle)}</p>
          </div>
          ${page.sections.map((s, i) => `
            <section class="card rule-section" id="sec-${s.id}">
              <h2><span class="num">${i + 1}</span>${esc(s.title)}</h2>
              <div class="sec-body" data-id="${s.id}">${(OV.rules[page.key] || {})[s.id] || s.html}</div>
              ${editMode ? `<div class="edit-tools"><button class="btn" data-edit="${s.id}">✏️ 이 섹션 글 편집</button><button class="btn btn-primary hidden" data-done="${s.id}">✅ 적용</button>${(OV.rules[page.key] || {})[s.id] ? `<button class="btn" data-reset="${s.id}">↩ 원본으로</button>` : ''}</div>` : ''}
              ${renderVideos(s.videos)}
            </section>`).join('')}
          <div class="card" style="margin-top:16px;text-align:center">
            <p style="margin-bottom:10px">${key === 'basic' ? '기본이 정리됐다면' : '심화까지 읽었다면'}</p>
            <div class="btn-row" style="justify-content:center">
              <a class="btn btn-primary" href="#/quiz">🎯 퀴즈 풀러 가기</a>
              <a class="btn" href="#/rules/${otherKey}">${otherKey === 'basic' ? '기본 개념' : '심화 개념'} 보기</a>
            </div>
          </div>
        </div>
      </div>`;

    // 편집 모드: 섹션 본문을 contenteditable 로 열고, 적용 시 오버라이드에 저장
    if (editMode) {
      $app.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => {
        const body = document.querySelector(`.sec-body[data-id="${b.dataset.edit}"]`);
        body.contentEditable = 'true'; body.classList.add('editing'); body.focus();
        b.classList.add('hidden'); $app.querySelector(`[data-done="${b.dataset.edit}"]`).classList.remove('hidden');
      }));
      $app.querySelectorAll('[data-done]').forEach((b) => b.addEventListener('click', () => {
        const body = document.querySelector(`.sec-body[data-id="${b.dataset.done}"]`);
        (OV.rules[page.key] = OV.rules[page.key] || {})[b.dataset.done] = body.innerHTML;
        markDirty(); renderRules(key, { s: b.dataset.done });
      }));
      $app.querySelectorAll('[data-reset]').forEach((b) => b.addEventListener('click', () => {
        delete OV.rules[page.key][b.dataset.reset]; markDirty(); renderRules(key, { s: b.dataset.reset });
      }));
    }

    // 섹션 하이라이트 (스크롤 관찰)
    if (tocObserver) tocObserver.disconnect();
    const links = [...document.querySelectorAll('#toc a')];
    tocObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id.replace('sec-', '');
          links.forEach((a) => a.classList.toggle('active', a.dataset.sec === id));
        }
      });
    }, { rootMargin: '-70px 0px -70% 0px', threshold: 0 });
    document.querySelectorAll('.rule-section').forEach((s) => tocObserver.observe(s));

    // 특정 섹션으로 이동
    if (params.s) {
      const target = document.getElementById('sec-' + params.s);
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }

  /* ---------- 퀴즈: 종목 선택 ---------- */
  function renderWeaponSelect() {
    $app.innerHTML = `
      <div class="stepper"><span class="on">① 종목</span> › <span>② 난이도</span> › <span>③ 퀴즈</span></div>
      <h1 style="font-size:24px">어떤 종목을 연습할까요?</h1>
      <p style="color:var(--text-2)">지금은 플러레만 준비되어 있어요. 에페·사브르는 곧 추가됩니다.</p>
      <div class="choice-grid">
        <button class="choice" data-weapon="foil">
          <span class="c-tag" style="background:var(--ok-bg);color:var(--ok)">준비 완료</span>
          <div class="c-ico">🤺</div>
          <div class="c-title">플러레 <small style="font-weight:600;color:var(--muted)">Foil</small></div>
          <div class="c-desc">몸통만 유효 · 공격권 있음 · 찌르기</div>
        </button>
        <button class="choice" disabled>
          <span class="c-tag">준비 중</span>
          <div class="c-ico">🗡️</div>
          <div class="c-title">에페 <small style="font-weight:600;color:var(--muted)">Épée</small></div>
          <div class="c-desc">전신 유효 · 공격권 없음</div>
        </button>
        <button class="choice" disabled>
          <span class="c-tag">준비 중</span>
          <div class="c-ico">⚔️</div>
          <div class="c-title">사브르 <small style="font-weight:600;color:var(--muted)">Sabre</small></div>
          <div class="c-desc">허리 위 유효 · 공격권 있음 · 베기 가능</div>
        </button>
      </div>`;
    $app.querySelector('[data-weapon="foil"]').addEventListener('click', () => navigate('#/quiz/level?w=foil'));
  }

  /* ---------- 퀴즈: 난이도 선택 ---------- */
  function renderLevelSelect(params) {
    const w = params.w || 'foil';
    const counts = [1, 2, 3].map((l) => QUESTIONS.filter((q) => q.weapon === w && q.level === l).length);
    $app.innerHTML = `
      <div class="stepper"><span>① 플러레</span> › <span class="on">② 난이도</span> › <span>③ 퀴즈</span></div>
      <h1 style="font-size:24px">난이도를 골라 주세요</h1>
      <p style="color:var(--text-2)">한 세트는 최대 10문제. 문제는 매번 무작위로 섞입니다.</p>
      <div class="choice-grid">
        ${[1, 2, 3].map((l) => `
          <button class="choice" data-level="${l}" ${counts[l - 1] === 0 ? 'disabled' : ''}>
            <span class="c-tag">${counts[l - 1]}문제</span>
            <div class="c-ico">${LEVELS[l].ico}</div>
            <div class="c-title">${LEVELS[l].name}</div>
            <div class="c-desc">${LEVELS[l].desc}</div>
          </button>`).join('')}
      </div>
      <p style="margin-top:16px;font-size:13.5px;color:var(--muted)">정답은 <strong>실제 경기에서 심판이 내린 판정</strong>입니다. 초급은 아딱·꽁딱·빠라드 리뽀스트·르미즈가 골고루 나오는 명확한 장면 100개, <strong>상급은 양쪽 불(색불 또는 흰불)이 모두 켜져 심판이 공격권을 판정해야 했던 장면만</strong> 나옵니다. 난이도는 판정과 커뮤니티 투표의 일치율, 동작의 종류로 나눴고, 상급에는 심판 판정에 동의하지 않는 사람이 더 많은 장면도 있어요.</p>`;
    $app.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => {
      const lv = Number(b.dataset.level);
      if (lv === 1) { navigate(`#/quiz/play?w=${w}&lv=1`); return; }
      // 중급·상급은 베타: 자동 분류·해설이 부정확할 수 있음을 먼저 알림
      $app.innerHTML = `
        <div class="card" style="max-width:560px;margin:0 auto">
          <h2 style="font-size:20px">🧪 ${LEVELS[lv].name}은 베타 버전이에요</h2>
          <p style="color:var(--text-2)">정답은 실제 심판 판정이지만, <strong>난이도 분류와 해설은 투표 분포로 자동 생성</strong>한 것이라 장면에 따라 부정확할 수 있습니다. 클립이 심판 손동작 직전에 정확히 안 끊기는 경우도 있어요.</p>
          <p style="color:var(--text-2)">이상한 문제는 정답 확인 후 <strong>✏️ 편집 모드</strong>로 난이도·해설을 고칠 수 있습니다.</p>
          <div class="btn-row">
            <button class="btn btn-primary btn-lg" id="beta-go">알겠어요, 시작</button>
            <a class="btn btn-lg" href="#/quiz/level?w=${w}">돌아가기</a>
          </div>
        </div>`;
      $app.querySelector('#beta-go').addEventListener('click', () => navigate(`#/quiz/play?w=${w}&lv=${lv}`));
    }));
  }

  /* =====================================================
     퀴즈 엔진
     ===================================================== */
  const Quiz = (() => {
    const SET_SIZE = 10;
    let session = null;   // { weapon, level, list, index, answers[] }
    let q = null;         // 현재 문제 진행 상태 { played, side, done, rate }
    let player = null;    // YT.Player
    let playerReady = false;
    let pendingCreate = null;
    let desiredRate = 1;
    let ytFailedTimer = null;

    // YouTube API 준비 콜백 (전역)
    window.onYouTubeIframeAPIReady = () => { if (pendingCreate) { const f = pendingCreate; pendingCreate = null; f(); } };

    // 본 문제 기록 (다시 방문하면 안 본 문제부터)
    const seenKey = 'fq_seen';
    const loadSeen = () => { try { return new Set(JSON.parse(localStorage.getItem(seenKey) || '[]')); } catch (e) { return new Set(); } };
    const markSeen = (id) => { try { const s = loadSeen(); s.add(id); localStorage.setItem(seenKey, JSON.stringify([...s])); } catch (e) { /* noop */ } };

    // 동작 종류(아딱/꽁딱/리뽀스트…)별로 번갈아 뽑아 한 세트에 다양하게 섞고, 안 본 문제를 먼저 씁니다.
    function pickSet(pool, n) {
      const seen = loadSeen();
      const groups = {};
      shuffle(pool).forEach((x) => { const k = x.answer.call || 'S'; (groups[k] = groups[k] || []).push(x); });
      Object.values(groups).forEach((g) => g.sort((a, b) => (seen.has(a.id) ? 1 : 0) - (seen.has(b.id) ? 1 : 0)));
      const keys = shuffle(Object.keys(groups)); const out = [];
      while (out.length < n && keys.some((k) => groups[k].length)) keys.forEach((k) => { if (out.length < n && groups[k].length) out.push(groups[k].shift()); });
      return out;
    }

    function start(weapon, level) {
      const pool = QUESTIONS.filter((x) => x.weapon === weapon && x.level === level);
      const list = pickSet(pool, SET_SIZE);
      // 초급: 말빠레(빠라드 불충분) 장면을 가능하면 한 문제 넣기 — 초급에 없으면 중급에서 빌려옴
      if (level === 1 && list.length && !list.some((x) => x.situation === 'opp-riposte')) {
        const mp = shuffle(QUESTIONS.filter((x) => x.weapon === weapon && x.situation === 'opp-riposte' && x.level <= 2 && !list.includes(x)))[0];
        if (mp) { const i = list.findIndex((x) => x.answer.call === 'attack' && x.situation === 'clean'); list[i >= 0 ? i : list.length - 1] = mp; }
      }
      session = { weapon, level, list: shuffle(list), index: 0, answers: [] };
    }

    function enterView(params) {
      const weapon = params.w || 'foil';
      const level = Number(params.lv) || 1;
      if (!session || session.weapon !== weapon || session.level !== level || session.index >= session.list.length) start(weapon, level);
      if (session.list.length === 0) {
        $app.innerHTML = `<div class="card empty">이 난이도에는 아직 문제가 없어요.<br><a class="btn" style="margin-top:12px" href="#/quiz/level">난이도 다시 고르기</a></div>`;
        return;
      }
      buildSkeleton();
      showQuestion();
    }

    function leaveView() {
      if (player) { try { player.destroy(); } catch (e) { /* noop */ } }
      player = null; playerReady = false; pendingCreate = null; q = null;
      clearTimeout(ytFailedTimer);
    }

    function buildSkeleton() {
      // 화면을 새로 그리면 이전 플레이어(iframe)는 DOM에서 사라지므로 함께 버림
      if (player) { try { player.destroy(); } catch (e) { /* noop */ } player = null; playerReady = false; }
      $app.innerHTML = `
        <div class="stepper"><span>① 플러레</span> › <span>② ${LEVELS[session.level].name}</span> › <span class="on">③ 퀴즈</span></div>
        <div class="quiz-head">
          <div class="q-no" id="q-no"></div>
          <div class="q-meta" id="q-meta"></div>
        </div>
        <div class="progress"><i id="q-bar" style="width:0%"></i></div>

        <div class="card" style="padding:12px">
          <div class="video-wrap" id="video-wrap">
            <div id="yt-player"></div>
            <div class="video-shield" id="video-shield"></div>
            <div class="video-cover" id="video-cover"></div>
          </div>
          <div class="side-label"><span class="L">◀ 왼쪽 선수 (빨간 불)</span><span class="R">오른쪽 선수 (초록 불) ▶</span></div>
          <div class="replay-bar" id="replay-bar"></div>
        </div>

        <div class="card answer-panel" id="answer-panel"></div>
        <div id="result-area"></div>
        <div class="next-bar" id="next-bar"></div>`;
    }

    function current() { return session.list[session.index]; }

    function showQuestion() {
      const item = current();
      q = { played: false, started: false, side: null, done: false, rate: 1, replays: 0, wantPlay: null };
      desiredRate = 1;

      document.getElementById('q-no').textContent = `문제 ${session.index + 1} / ${session.list.length}`;
      document.getElementById('q-meta').textContent = item.event || '';
      document.getElementById('q-bar').style.width = `${(session.index / session.list.length) * 100}%`;
      document.getElementById('result-area').innerHTML = '';
      document.getElementById('next-bar').innerHTML = '';
      document.getElementById('replay-bar').innerHTML = '';
      renderCover('initial');
      renderAnswerPanel();

      ensurePlayer(() => {
        try { player.cueVideoById({ videoId: item.video.id, startSeconds: item.video.start, endSeconds: item.video.end }); } catch (e) { /* noop */ }
      });
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    /* ----- 플레이어 ----- */
    function ensurePlayer(onReady) {
      if (player && playerReady) { onReady(); return; }
      if (player) { pendingCue = onReady; return; }
      const create = () => {
        const vars = { controls: 0, rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, disablekb: 1, fs: 0 };
        if (location.protocol.startsWith('http')) vars.origin = location.origin;
        player = new YT.Player('yt-player', {
          width: '100%', height: '100%',
          playerVars: vars,
          events: {
            onReady: () => {
              playerReady = true; clearTimeout(ytFailedTimer); onReady();
              if (pendingCue) { const f = pendingCue; pendingCue = null; f(); }
              if (q && q.wantPlay) { const r = q.wantPlay; q.wantPlay = null; playClip(r); }
            },
            onStateChange: onPlayerState,
            onError: onPlayerError,
          },
        });
      };
      if (window.YT && window.YT.Player) create(); else pendingCreate = create;
      ytFailedTimer = setTimeout(() => { if (!playerReady) renderCover('noapi'); }, 8000);
    }
    let pendingCue = null;

    function onPlayerState(e) {
      if (window.DEBUG_YT) (window.__ytlog = window.__ytlog || []).push([Date.now() % 100000, e.data, session && session.index]);
      if (!q) return;
      const S = window.YT.PlayerState;
      if (e.data === S.PLAYING) {
        q.started = true;
        hideCover();
        try { if (player.getPlaybackRate() !== desiredRate) player.setPlaybackRate(desiredRate); } catch (err) { /* noop */ }
      } else if (e.data === S.ENDED) {
        // cueVideoById 직후에도 ENDED(0)가 한 번 잘못 발생하므로, 실제로 재생이 시작됐던 경우만 처리
        if (!q.started) return;
        q.started = false;
        q.played = true;
        renderCover('ended');
        renderReplayBar();
        if (!q.side && !q.done) renderAnswerPanel();
      }
    }

    function onPlayerError(e) {
      renderCover('error', e && e.data);
    }

    function playClip(rate) {
      const item = current();
      if (!player || !playerReady) {
        // 플레이어가 아직 준비 전이면 준비되는 즉시 재생
        q.wantPlay = rate;
        const cover = document.getElementById('video-cover');
        if (cover) cover.innerHTML = `<div class="vc-title"><span class="spinner" style="vertical-align:middle"></span>영상 준비 중…</div>`;
        return;
      }
      desiredRate = rate;
      q.rate = rate;
      if (q.played) q.replays++;
      hideCover();
      try {
        player.setPlaybackRate(rate);
        player.loadVideoById({ videoId: item.video.id, startSeconds: item.video.start, endSeconds: item.video.end });
      } catch (err) { renderCover('error'); }
      renderReplayBar();
    }

    function hideCover() {
      document.getElementById('video-cover').classList.add('hidden');
    }

    function renderCover(mode, code) {
      const cover = document.getElementById('video-cover');
      if (!cover) return;
      cover.classList.remove('hidden');
      const item = current();
      if (mode === 'initial') {
        cover.innerHTML = `
          <div class="vc-title">문제 ${session.index + 1}</div>
          <div class="vc-sub">영상을 <strong>한 번</strong> 본 뒤 누구의 점수인지 판정해 보세요. 심판 판정 직전에 영상이 멈춥니다.</div>
          <button class="play-big" id="play-first" aria-label="영상 재생">▶</button>
          <div class="vc-sub" style="font-size:12px">${esc(item.left || '왼쪽')} <span style="color:#ff8a94">◀</span> vs <span style="color:#6fe0a8">▶</span> ${esc(item.right || '오른쪽')}</div>`;
        cover.querySelector('#play-first').addEventListener('click', () => playClip(1));
      } else if (mode === 'ended') {
        cover.innerHTML = `
          <div class="vc-title">${q.done ? '판정 완료' : '판정할 시간!'}</div>
          <div class="vc-sub">${q.done ? '아래 해설을 확인하고 다음 문제로 넘어가세요.' : '아래에서 답을 고르거나, 헷갈리면 천천히 다시 보세요.'}</div>
          <div class="btn-row">
            <button class="btn btn-primary" id="play-slow">🐢 0.5배속으로 보기</button>
            <button class="btn" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.3)" id="play-again">↻ 다시 보기</button>
          </div>`;
        cover.querySelector('#play-slow').addEventListener('click', () => playClip(0.5));
        cover.querySelector('#play-again').addEventListener('click', () => playClip(1));
      } else if (mode === 'noapi') {
        cover.innerHTML = `
          <div class="vc-title">영상을 불러오지 못했어요</div>
          <div class="vc-sub">유튜브 플레이어가 로드되지 않았습니다. 인터넷 연결을 확인하거나, 파일을 직접 열었다면 로컬 서버(http://)로 열어 주세요.</div>
          <a class="btn btn-primary" target="_blank" rel="noopener" href="${esc(ytLink(item))}">유튜브에서 직접 보기</a>`;
      } else {
        cover.innerHTML = `
          <div class="vc-title">이 영상은 여기서 재생할 수 없어요 ${code ? `(오류 ${esc(code)})` : ''}</div>
          <div class="vc-sub">영상이 삭제되었거나 외부 재생이 막혀 있을 수 있습니다. 유튜브에서 직접 보거나 다음 문제로 넘어가세요.</div>
          <div class="btn-row">
            <a class="btn btn-primary" target="_blank" rel="noopener" href="${esc(ytLink(item))}">유튜브에서 보기</a>
            <button class="btn" style="background:rgba(255,255,255,.12);color:#fff;border-color:rgba(255,255,255,.3)" id="skip-q">이 문제 건너뛰기</button>
          </div>`;
        cover.querySelector('#skip-q').addEventListener('click', () => {
          session.list.splice(session.index, 1);
          if (session.list.length === 0) { navigate('#/quiz/level?w=' + session.weapon); return; }
          if (session.index >= session.list.length) { navigate('#/quiz/result'); return; }
          showQuestion();
        });
      }
    }

    function renderReplayBar() {
      const bar = document.getElementById('replay-bar');
      if (!bar) return;
      if (!q.played) { bar.innerHTML = ''; return; }
      bar.innerHTML = `
        <button class="btn" id="rb-slow">🐢 0.5배속</button>
        <button class="btn" id="rb-again">↻ 1배속</button>
        <span>${q.replays > 0 ? `다시 본 횟수 ${q.replays}` : '한 번 봤어요'}</span>`;
      bar.querySelector('#rb-slow').addEventListener('click', () => playClip(0.5));
      bar.querySelector('#rb-again').addEventListener('click', () => playClip(1));
    }

    function ytLink(item) { return `https://www.youtube.com/watch?v=${item.video.id}&t=${item.video.start}`; }

    /* ----- 답 선택 ----- */
    function renderAnswerPanel() {
      const panel = document.getElementById('answer-panel');
      if (!panel) return;
      if (!q.played) {
        panel.innerHTML = `<h3>① 누구의 점수(불)일까요?</h3><div class="locked">▶ 먼저 영상을 한 번 보세요. 영상이 끝나면 선택할 수 있어요.</div>`;
        return;
      }
      if (q.done) return;
      if (!q.side) {
        panel.innerHTML = `
          <h3>① 누구의 점수(불)일까요?</h3>
          <div class="side-grid">
            <button class="side-btn L" data-side="L">◀ 왼쪽<small>${esc(current().left || '왼쪽 선수')}</small></button>
            <button class="side-btn R" data-side="R">오른쪽 ▶<small>${esc(current().right || '오른쪽 선수')}</small></button>
            <button class="side-btn S" data-side="S">양쪽 무효 — 시뮬따네<small>동시 공격, 점수 없음</small></button>
          </div>`;
        panel.querySelectorAll('[data-side]').forEach((b) => b.addEventListener('click', () => pickSide(b.dataset.side)));
      } else {
        panel.innerHTML = `
          <h3>② <span class="picked-side ${q.side}">${SIDE_KO[q.side]}</span> 점수인 이유는?</h3>
          <div class="reason-grid">
            ${CALL_ORDER.map((k) => `<button class="reason-btn" data-call="${k}"><span class="r-ko">${CALLS[k].ko}</span><span class="r-fr">${CALLS[k].fr}</span></button>`).join('')}
          </div>
          <p style="margin:10px 0 0;font-size:13px;color:var(--muted)"><a href="#" id="reset-side" style="color:var(--info);font-weight:700">← 불 다시 고르기</a></p>`;
        panel.querySelectorAll('[data-call]').forEach((b) => b.addEventListener('click', () => pickCall(b.dataset.call)));
        panel.querySelector('#reset-side').addEventListener('click', (e) => { e.preventDefault(); q.side = null; renderAnswerPanel(); });
      }
    }

    function pickSide(side) {
      if (!q.played || q.done) return;
      if (side === 'S') { finish('S', null); return; }
      q.side = side;
      renderAnswerPanel();
      document.getElementById('answer-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function pickCall(call) {
      if (!q.side || q.done) return;
      finish(q.side, call);
    }

    /* ----- 채점 & 해설 ----- */
    function finish(side, call) {
      const item = current();
      const a = item.answer;
      const sideOk = side === a.side;
      const correct = sideOk && (a.side === 'S' || call === a.call);
      q.done = true;
      session.answers.push({ id: item.id, side, call, correct, sideOk });
      markSeen(item.id);

      const panel = document.getElementById('answer-panel');
      panel.innerHTML = `
        <h3>내 판정</h3>
        <div class="r-answer" style="display:flex;gap:8px;flex-wrap:wrap">
          <span class="picked-side ${side === 'S' ? '' : side}" style="${side === 'S' ? 'background:var(--brand-2)' : ''}">${SIDE_KO[side]}</span>
          ${call ? `<span class="picked-side" style="background:var(--surface-2);color:var(--text);border:1px solid var(--line)">${CALLS[call].ko}</span>` : ''}
        </div>`;

      const res = document.getElementById('result-area');
      res.innerHTML = buildResultHTML(item, side, call, correct, sideOk);
      const apply = res.querySelector('#eq-apply');
      if (apply) apply.addEventListener('click', () => {
        const o = { level: Number(res.querySelector('#eq-level').value) };
        const ex = res.querySelector('#eq-explain').value.trim(); if (ex) o.explain = ex;
        OV.questions[item.id] = o; item.level = o.level; item.explain = ex || undefined;
        markDirty(); apply.textContent = '적용됨 ✓';
      });
      renderCover('ended');

      const next = document.getElementById('next-bar');
      const last = session.index >= session.list.length - 1;
      next.innerHTML = `<button class="btn btn-dark btn-lg" id="btn-next">${last ? '결과 보기 🏁' : '다음 문제 →'}</button>`;
      next.querySelector('#btn-next').addEventListener('click', () => {
        if (last) { navigate('#/quiz/result'); return; }
        session.index++;
        showQuestion();
      });
      document.getElementById('q-bar').style.width = `${((session.index + 1) / session.list.length) * 100}%`;
      res.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // 장면 상황(item.situation)에 맞는 해설 선택. 없으면 clean, 그것도 없으면 null
    function situationFor(item) {
      const a = item.answer;
      const key = a.side === 'S' ? 'simultaneous' : a.call;
      const table = (typeof SITUATIONS !== 'undefined') && SITUATIONS[key];
      if (!table) return null;
      return table[item.situation] || table.clean || null;
    }

    // {me}/{op}/{meKo}/{opKo}/{altKo} 치환
    function fillTpl(text, item) {
      const a = item.answer;
      const me = a.side === 'S' ? '' : SIDE_FR[a.side];
      const op = a.side === 'S' ? '' : SIDE_FR[other(a.side)];
      const meKo = a.side === 'S' ? '' : SIDE_KO[a.side];
      const opKo = a.side === 'S' ? '' : SIDE_KO[other(a.side)];
      const altKo = item.alt && item.alt.side ? SIDE_KO[item.alt.side] : (a.side === 'S' ? '한쪽' : opKo);
      return String(text).replace(/\{me\}/g, me).replace(/\{op\}/g, op).replace(/\{meKo\}/g, meKo).replace(/\{opKo\}/g, opKo).replace(/\{altKo\}/g, altKo)
        // '오른쪽/왼쪽' 뒤 조사 교정 (받침 있음)
        .replace(/(오른쪽|왼쪽)가/g, '$1이').replace(/(오른쪽|왼쪽)는/g, '$1은').replace(/(오른쪽|왼쪽)를/g, '$1을').replace(/(오른쪽|왼쪽)로/g, '$1으로');
    }

    function refPhrase(item) {
      const sit = situationFor(item);
      if (sit && sit.phrase) return fillTpl(sit.phrase, item);
      const a = item.answer;
      if (a.side === 'S') return '시뮬따네, 빠 드 뚜슈. (양쪽 무효)';
      const me = SIDE_FR[a.side], op = SIDE_FR[other(a.side)];
      switch (a.call) {
        case 'attack': return `아딱 ${me}, 뚜슈 ${me}.`;
        case 'counter': return `아딱 ${op} 노(또는 프레파라시옹), 꽁뜨르 아딱 ${me}, 뚜슈 ${me}.`;
        case 'riposte': return `아딱 ${op}, 빠라드 리뽀스트 ${me}, 뚜슈 ${me}.`;
        case 'remise': return `아딱 ${me}, 빠라드 ${op}(리뽀스트 지연), 르미즈 ${me}, 뚜슈 ${me}.`;
        case 'line': return `린느 ${me}, 아딱 ${op} 당 라 린느, 뚜슈 ${me}.`;
        default: return '';
      }
    }

    function buildResultHTML(item, side, call, correct, sideOk) {
      const a = item.answer;
      const LAMP = { red: '🔴', green: '🟢', white: '⚪', off: '⚫' };
      const lampChip = item.lights
        ? `<span class="chip" title="터치 순간 심판기 불">${LAMP[item.lights.L] || '⚫'} ${LAMP[item.lights.R] || '⚫'} ${item.lights.L !== 'off' && item.lights.R !== 'off' ? '양쪽 불' : (item.lights.L !== 'off' ? '왼쪽만' : '오른쪽만')}</span>`
        : '';
      const ansChips = a.side === 'S'
        ? `<span class="chip">🤝 양쪽 무효 — 시뮬따네</span>`
        : `<span class="chip ${a.side}">${a.side === 'L' ? '◀ 왼쪽' : '오른쪽 ▶'} 점수</span><span class="chip">${CALLS[a.call].ko} <small style="color:var(--muted)">${CALLS[a.call].fr}</small></span>`;

      let sub;
      if (correct) sub = a.side === 'S' ? '동시 공격을 정확히 잡아냈어요.' : `${SIDE_KO[a.side]} 선수의 ${CALLS[a.call].ko}! 심판 판정과 같아요.`;
      else if (sideOk) sub = `불은 맞았어요! 하지만 이유가 달라요. 심판은 ${ro(CALLS[a.call].ko)} 봤습니다.`;
      else if (a.side === 'S') sub = '심판은 양쪽 모두 동시에 공격을 시작했다고 보고 무효로 판정했어요.';
      else sub = `심판은 ${SIDE_KO[a.side]} 점수로 판정했어요. (${CALLS[a.call].ko})`;

      const info = a.side === 'S' ? CALLS.simultaneous : CALLS[a.call];
      const sit = situationFor(item);
      const altLine = item.alt && item.alt.call
        ? `<p class="alt-line">이 장면을 <strong>${ro((item.alt.side ? SIDE_KO[item.alt.side] + ' ' : '') + (item.alt.call === 'simultaneous' ? '시뮬따네' : CALLS[item.alt.call].ko))}</strong> 본 사람도 ${item.alt.pct}%였어요. 심판 판정과 갈린 이유가 이 장면의 핵심입니다.</p>`
        : '';
      const explainBlock = sit
        ? `<div class="explain">
            <h4>📖 이 장면: ${esc(fillTpl(sit.title, item))}</h4>
            <p>${esc(item.explain || fillTpl(sit.explain, item))}</p>
            ${altLine}
            <p class="watch"><strong>🔍 0.5배속으로 볼 것</strong> — ${esc(fillTpl(sit.watch, item))}</p>
            <p style="margin-top:6px"><a href="${info.link}" style="color:var(--info);font-weight:700">${info.ko} 규칙 설명 보기 →</a></p>
          </div>`
        : `<div class="explain">
            <h4>📖 ${info.ko}${info.fr ? ` (${info.fr})` : ''} — 왜 이렇게 판정할까?</h4>
            <p>${info.explain}</p>
            <p style="margin-top:6px"><a href="${info.link}" style="color:var(--info);font-weight:700">규칙 설명에서 자세히 보기 →</a></p>
          </div>`;
      let whyNot = '';
      if (!correct) {
        const key = side === 'S' ? 'simultaneous' : call;
        const tip = key && WHY_NOT[key];
        const mine = key === 'simultaneous' ? '시뮬따네' : `${SIDE_KO[side]} ${CALLS[key].ko}`;
        if (tip) whyNot = `<div class="explain"><h4>💭 ${esc(ro(mine))} 보였다면</h4><p>${tip}</p></div>`;
      }
      const note = item.note ? `<div class="explain"><h4>📝 이 장면 메모</h4><p>${item.note}</p></div>` : '';
      const editForm = editMode ? `<div class="explain edit-q">
            <h4>✏️ 이 문제 편집 <small style="color:var(--muted)">${esc(item.id)}</small></h4>
            <label>난이도 <select id="eq-level">${[1, 2, 3].map((l) => `<option value="${l}" ${item.level === l ? 'selected' : ''}>${LEVELS[l].name}</option>`).join('')}</select></label>
            <label>해설 (비우면 자동 해설)<textarea id="eq-explain" rows="5">${esc(item.explain || '')}</textarea></label>
            <button class="btn btn-primary" id="eq-apply">적용</button>
          </div>` : '';
      const agree = typeof item.agree === 'number' ? `<span class="meter">커뮤니티 일치율 <i><b style="width:${item.agree}%"></b></i> ${item.agree}%${item.votes ? ` (${item.votes}표)` : ''}</span>` : '';

      return `
        <div class="result ${correct ? 'ok' : 'ng'}">
          <div class="r-title">${correct ? '정답입니다! 🎉' : '틀렸습니다ㅜㅜ'}</div>
          <div class="r-sub">${sub}</div>
          <div class="r-answer">심판 판정: ${ansChips}${lampChip}</div>
          <div class="explain">
            <h4>🗣️ 심판 판정 문장</h4>
            <p>"${refPhrase(item)}"</p>
          </div>
          ${explainBlock}
          ${whyNot}
          ${note}
          ${editForm}
          <div class="r-foot">
            ${agree}
            ${item.left && item.right ? `<span>${esc(item.left)} vs ${esc(item.right)}</span>` : ''}
            <a href="${esc(ytLink(item))}" target="_blank" rel="noopener">원본 영상(유튜브) ↗</a>
            ${item.source ? `<a href="${esc(item.source)}" target="_blank" rel="noopener">판정 출처 ↗</a>` : ''}
          </div>
        </div>`;
    }

    /* ----- 결과 요약 ----- */
    function renderResult() {
      if (!session || session.answers.length === 0) { navigate('#/quiz'); return; }
      const n = session.list.length, ok = session.answers.filter((x) => x.correct).length;
      const sideOnly = session.answers.filter((x) => !x.correct && x.sideOk).length;
      const pct = Math.round((ok / n) * 100);
      const msg = pct === 100 ? '완벽해요! 국제 심판 해도 되겠는데요? 🏆' : pct >= 80 ? '훌륭해요! 판정 감각이 좋아요 👏' : pct >= 50 ? '좋아요. 틀린 문제의 해설을 다시 읽어 보세요 📖' : '아직 헷갈리죠? 규칙 설명을 읽고 다시 도전! 💪';
      const byId = Object.fromEntries(QUESTIONS.map((x) => [x.id, x]));
      $app.innerHTML = `
        <div class="card score-hero">
          <div style="font-size:13px;color:var(--muted);font-weight:700">플러레 · ${LEVELS[session.level].name}</div>
          <div class="big">${ok}<small> / ${n}</small></div>
          <div class="msg">${msg}</div>
          ${sideOnly ? `<div style="font-size:13px;color:var(--muted);margin-top:6px">불은 맞췄지만 이유가 틀린 문제 ${sideOnly}개</div>` : ''}
          <div class="btn-row" style="justify-content:center;margin-top:18px">
            <a class="btn btn-primary btn-lg" href="#/quiz/play?w=${session.weapon}&lv=${session.level}&r=${Date.now()}">같은 난이도 다시 풀기</a>
            <a class="btn btn-lg" href="#/quiz/level?w=${session.weapon}">다른 난이도</a>
          </div>
        </div>
        <div class="card">
          <h3 style="font-size:17px">문제별 결과</h3>
          <ul class="review-list">
            ${session.answers.map((ans, i) => {
              const item = byId[ans.id]; const a = item.answer;
              const answerText = a.side === 'S' ? '무효(시뮬따네)' : `${SIDE_KO[a.side]} · ${CALLS[a.call].ko}`;
              const mine = ans.side === 'S' ? '무효' : `${SIDE_KO[ans.side]} · ${ans.call ? CALLS[ans.call].ko : ''}`;
              return `<li><span class="mark ${ans.correct ? 'ok' : 'ng'}">${ans.correct ? '✓' : '✗'}</span>
                <div><div><strong>${i + 1}.</strong> ${answerText}</div>${ans.correct ? '' : `<div style="font-size:12.5px;color:var(--muted)">내 판정: ${mine}</div>`}</div>
                <a href="${esc(ytLink(item))}" target="_blank" rel="noopener">영상 ↗</a></li>`;
            }).join('')}
          </ul>
        </div>
        <div class="card" style="text-align:center">
          <p style="margin-bottom:10px">규칙을 다시 확인하고 싶다면</p>
          <div class="btn-row" style="justify-content:center">
            <a class="btn" href="#/rules/basic">기본 개념</a>
            <a class="btn" href="#/rules/advanced">심화 개념</a>
            <a class="btn" href="#/">홈으로</a>
          </div>
        </div>`;
      session = null;
    }

    return { enterView, leaveView, renderResult };
  })();

  /* ---------- 시작 ---------- */
  render();
  renderEditBar();
})();
