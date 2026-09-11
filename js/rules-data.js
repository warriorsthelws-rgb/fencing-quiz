/* =====================================================
   규칙 설명 콘텐츠
   - RULES.basic    : 기본 개념 (공격권, 아딱, 빠라드-리뽀스트, 꽁딱, 판정 용어)
   - RULES.advanced : 심화 개념 (린느, 프레파라시옹, 르미즈, 시뮬따네 등)
   각 섹션은 { id, title, html } 형태. html은 그대로 렌더링됩니다.
   ===================================================== */

const TARGET_SVG = `
<svg viewBox="0 0 120 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="플러레 유효면: 몸통">
  <defs>
    <linearGradient id="tg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#2bb673"/><stop offset="1" stop-color="#1d8f58"/>
    </linearGradient>
  </defs>
  <!-- 머리 / 마스크 -->
  <circle cx="60" cy="26" r="17" fill="#c9ced9"/>
  <!-- 비브(턱받이) -->
  <path d="M46 40 Q60 52 74 40 L74 46 Q60 56 46 46 Z" fill="url(#tg)"/>
  <!-- 팔 -->
  <path d="M38 62 L16 118 L26 121 L48 72 Z" fill="#c9ced9"/>
  <path d="M82 62 L104 118 L94 121 L72 72 Z" fill="#c9ced9"/>
  <!-- 몸통(유효면) -->
  <path d="M40 50 Q60 44 80 50 L88 70 L84 128 Q60 136 36 128 L32 70 Z" fill="url(#tg)"/>
  <!-- 다리 -->
  <path d="M40 128 L36 205 L52 205 L58 134 Z" fill="#c9ced9"/>
  <path d="M80 128 L84 205 L68 205 L62 134 Z" fill="#c9ced9"/>
</svg>`;

const RULES = {
  basic: {
    key: 'basic',
    title: '기본 개념',
    subtitle: '플러레의 공격권(우선권)과 판정의 뼈대. 퀴즈 초급을 풀기 전에 꼭 읽어 보세요.',
    sections: [
      {
        id: 'weapons',
        title: '펜싱 3종목, 그리고 플러레',
        html: `
<p>펜싱은 <span class="term">플러레(Fleuret)</span>, <span class="term">에페(Épée)</span>, <span class="term">사브르(Sabre)</span> 세 종목으로 나뉩니다. 종목마다 <strong>유효면(찌를 수 있는 부위)</strong>과 <strong>공격권(우선권) 규칙의 유무</strong>가 다릅니다.</p>
<div class="table-wrap"><table>
  <thead><tr><th>종목</th><th>득점 방식</th><th>유효면</th><th>공격권</th></tr></thead>
  <tbody>
    <tr><td><strong>플러레</strong></td><td>찌르기(포인트)만</td><td>몸통 (팔·다리·머리 제외)</td><td><strong>있음</strong></td></tr>
    <tr><td>에페</td><td>찌르기만</td><td>전신</td><td>없음 (먼저 찌른 쪽 득점, 동시면 둘 다 득점)</td></tr>
    <tr><td>사브르</td><td>찌르기 + 베기</td><td>허리 위 (머리·팔 포함)</td><td>있음</td></tr>
  </tbody>
</table></div>
<p>이 사이트는 우선 <strong>플러레</strong>만 다룹니다. 플러레와 사브르는 "누가 먼저 올바르게 공격했는가"를 심판이 판단하는 <strong>공격권(Right of Way, 우선권)</strong> 종목이라 판정이 어렵고, 그래서 배우는 재미도 있습니다.</p>`
      },
      {
        id: 'target',
        title: '유효면과 불(램프)',
        html: `
<div class="target-fig">
  ${TARGET_SVG}
  <div class="target-legend">
    <div><span style="background:#2bb673"></span><strong>유효면</strong> — 몸통 전체(앞·옆·등)와 마스크 턱받이(비브)</div>
    <div><span style="background:#c9ced9"></span><strong>무효면</strong> — 머리(마스크), 팔, 다리</div>
  </div>
</div>
<p>플러레는 <strong>금속 조끼(라메)</strong>를 입은 몸통 부위가 유효면입니다. 목 아래부터 골반선(사타구니)까지, 앞·옆·등 모두 포함되며 마스크 아래 턱받이(비브)의 전도성 부분도 유효면입니다. 팔, 다리, 마스크는 <strong>무효면</strong>입니다.</p>
<div class="lamps">
  <div class="lamp red"><i></i>빨간 불<br>왼쪽 선수 유효</div>
  <div class="lamp green"><i></i>초록 불<br>오른쪽 선수 유효</div>
  <div class="lamp white"><i></i>흰 불<br>무효면 접촉</div>
</div>
<ul>
  <li><strong>색 불(빨강/초록)</strong>: 유효면을 찔렀다는 뜻. 일반적으로 심판 기준 왼쪽 선수가 빨강, 오른쪽 선수가 초록입니다.</li>
  <li><strong>흰 불</strong>: 무효면(팔·다리·마스크)을 찔렀다는 뜻. 점수는 없지만 <strong>동작을 멈추게 합니다(알트)</strong>. 흰 불 뒤에 들어온 찌르기는 모두 무효입니다.</li>
  <li>한쪽 불만 켜지면 심판이 고민할 것이 거의 없습니다. <strong>양쪽 불이 함께 켜졌을 때</strong> 비로소 "누구의 점수인가"를 <strong>공격권</strong>으로 판정합니다.</li>
</ul>
<div class="callout tip"><span class="ct">왜 양쪽 불이 같이 켜지나요?</span>심판기는 첫 번째 찌르기가 들어온 뒤 아주 짧은 시간(현행 규정 약 0.3초) 안에 들어온 상대의 찌르기까지 함께 표시합니다. 이 시간 안에 두 사람이 모두 찌르면 두 불이 켜지고, 심판이 공격권으로 판정합니다.</div>`
      },
      {
        id: 'row',
        title: '공격권(우선권)이란?',
        html: `
<p><span class="term">공격권(Right of Way / Priorité)</span>은 "양쪽이 동시에 찔렀을 때 <strong>누구의 점수로 인정할 것인가</strong>"를 정하는 규칙입니다. 핵심 원칙은 딱 하나입니다.</p>
<div class="callout key"><span class="ct">핵심 원칙</span><strong>먼저 올바르게 공격을 시작한 선수</strong>가 공격권을 가진다. 공격을 받은 쪽은 그 공격을 <strong>막거나(빠라드) 피한 뒤</strong>에야 공격권을 가져올 수 있다.</div>
<p>즉 상대가 이미 공격 중인데 그냥 같이 찔러 들어가면(꽁딱), 둘 다 맞더라도 점수는 <strong>공격한 쪽</strong>이 가져갑니다. 공격권은 다음과 같이 옮겨 다닙니다.</p>
<div class="flow">
  <div class="step"><span class="n">1</span><div><b>공격(아딱)</b> — 먼저 팔을 펴며 포인트로 상대 유효면을 위협하면서 전진하면 공격권을 가집니다.</div></div>
  <div class="step"><span class="n">2</span><div><b>막기(빠라드)</b> — 공격받은 쪽이 상대 칼을 막아내면 공격권이 <b>넘어옵니다</b>.</div></div>
  <div class="step"><span class="n">3</span><div><b>되받아치기(리뽀스트)</b> — 막은 직후 바로 찌르면 그 찌르기가 우선권을 가집니다.</div></div>
  <div class="step"><span class="n">4</span><div><b>공격 실패(아딱 노)</b> — 공격이 빗나가거나 짧으면 공격권이 사라지고, 상대가 새로 공격할 수 있습니다.</div></div>
</div>
<p>심판은 "알트!" 이후 이 흐름을 말로 <strong>재구성(분석)</strong>해서 판정을 내립니다. 예: <em>"아딱 드와뜨(오른쪽 공격), 빠라드 리뽀스트 고슈(왼쪽이 막고 되받음), 뚜슈. 점수 왼쪽."</em></p>`
      },
      {
        id: 'attack',
        title: '아딱(공격) — 공격이 성립하려면',
        html: `
<p><span class="term">아딱 <span class="fr">Attaque</span></span>은 <strong>먼저 시작한 공격 동작</strong>입니다. 그런데 "먼저 앞으로 나갔다"가 곧 공격은 아닙니다. 규정상 공격으로 인정받으려면 다음 조건이 필요합니다.</p>
<ul>
  <li><strong>팔이 펴지기 시작</strong>하면서 <strong>포인트가 상대의 유효면을 위협</strong>해야 합니다.</li>
  <li>팔 펴기가 <strong>팡뜨(런지)나 플레슈의 시작보다 먼저</strong> 나와야 합니다.</li>
  <li>마르셰(전진 스텝)-팡뜨로 공격할 때는 <strong>전진이 끝나기 전에</strong> 팔이 펴지기 시작해야 합니다.</li>
  <li><strong>팔을 굽힌 채</strong> 전진하거나 페인트를 거는 동작은 공격이 아니라 <strong>준비 동작(프레파라시옹)</strong>입니다. 이때 상대가 팔을 펴고 들어오면 상대의 공격이 됩니다. (자세한 내용은 심화 편)</li>
</ul>
<div class="phrase">
  <div class="p-row"><span class="p-who L">왼쪽</span><span>팔을 펴며 마르셰-팡뜨로 공격 시작</span></div>
  <div class="p-row"><span class="p-who R">오른쪽</span><span>막지 않고 그대로 팔을 펴서 같이 찌름 (꽁딱)</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span class="p-res">"아딱 고슈, 뚜슈." → 왼쪽 점수</span></div>
</div>
<p>공격의 종류: <span class="term">직접 공격</span>(그대로 찌르기), <span class="term">데가제</span>(상대 칼 밑으로 돌려 찌르기), <span class="term">꾸뻬</span>(상대 칼 위로 넘겨 찌르기), <span class="term">복합 공격</span>(페인트 후 찌르기), <span class="term">바뜨망 아딱</span>(상대 칼을 치고 찌르기) 등이 있지만, 판정에서 중요한 것은 종류보다 <strong>"누가 먼저 올바르게 시작했나"</strong>입니다.</p>`
      },
      {
        id: 'parry',
        title: '빠라드 → 리뽀스트 (막고 되받기)',
        html: `
<p><span class="term">빠라드 <span class="fr">Parade</span></span>는 상대의 공격을 칼로 막아 <strong>공격선에서 벗어나게</strong> 하는 동작입니다. 빠라드에 성공하면 <strong>공격권이 넘어옵니다.</strong> 그 직후에 하는 찌르기가 <span class="term">리뽀스트 <span class="fr">Riposte</span></span>입니다.</p>
<ul>
  <li>리뽀스트는 <strong>즉시</strong> 해야 우선권을 확실히 가집니다. 막고 나서 머뭇거리면 상대가 다시 찌르는 <strong>르미즈</strong>에 점수를 뺏길 수 있습니다. (심화 편 참고)</li>
  <li>리뽀스트를 다시 막고 되받으면 <span class="term">꽁뜨르 리뽀스트</span>가 됩니다. 이렇게 공격권은 막을 때마다 계속 넘어갑니다.</li>
  <li>칼이 <strong>살짝 스치기만 한 것</strong>은 빠라드로 보지 않습니다. 상대 칼을 실제로 공격선에서 밀어내야 합니다.</li>
</ul>
<div class="phrase">
  <div class="p-row"><span class="p-who R">오른쪽</span><span>팡뜨로 공격</span></div>
  <div class="p-row"><span class="p-who L">왼쪽</span><span>4번(꺄르트) 빠라드로 막고 바로 리뽀스트</span></div>
  <div class="p-row"><span class="p-who R">오른쪽</span><span>막힌 뒤에도 계속 밀어 넣어 같이 불이 켜짐 (르미즈)</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span class="p-res">"아딱 드와뜨, 빠라드 리뽀스트 고슈, 뚜슈." → 왼쪽 점수</span></div>
</div>
<div class="callout tip"><span class="ct">보는 요령</span>양쪽 불이 켜졌을 때 <strong>칼이 부딪히는 소리·순간</strong>이 있었다면 "누가 막았는가"를 먼저 보세요. 공격하던 쪽의 칼이 밀려났다면 막은 쪽의 리뽀스트가 점수입니다.</div>`
      },
      {
        id: 'counter',
        title: '꽁뜨르 아딱(꽁딱) — 반격',
        html: `
<p><span class="term">꽁뜨르 아딱 <span class="fr">Contre-attaque</span></span>, 흔히 <span class="term">꽁딱</span>이라고 부르는 동작은 <strong>상대가 공격하는 도중에 막지 않고 찌르는 것</strong>입니다. 상대 공격이 올바르게 진행 중이라면 꽁딱은 <strong>공격권이 없습니다.</strong> 둘 다 맞으면 공격한 쪽 점수입니다.</p>
<p>그렇다면 꽁딱은 언제 점수가 될까요?</p>
<ul>
  <li><strong>꽁딱만 맞았을 때</strong> — 상대 공격이 빗나가거나 무효면(흰 불)이 아닌 완전한 헛찌르기가 되고 나만 유효면을 찔렀다면 당연히 내 점수입니다.</li>
  <li><strong>상대 공격이 공격의 조건을 갖추지 못했을 때</strong> — 상대가 팔을 굽힌 채 전진하는 '준비 동작' 중에 내가 팔을 펴고 찌르면, 그것은 꽁딱이 아니라 <strong>내 공격(아딱)</strong>이 됩니다. 심판은 "아딱 오 프레파라시옹" 또는 그냥 "아딱"으로 판정합니다.</li>
  <li><strong>복합 공격 중 한 템포 먼저 도착</strong> — 상대가 페인트를 거는 동안 내 찌르기가 상대의 마지막 동작이 시작되기 전에 먼저 들어가면 꽁딱이 유효합니다. (심화 편)</li>
</ul>
<div class="phrase">
  <div class="p-row"><span class="p-who L">왼쪽</span><span>팔 펴며 팡뜨 공격</span></div>
  <div class="p-row"><span class="p-who R">오른쪽</span><span>뒤로 빠지며 팔만 펴서 찌름 (꽁딱) — 양쪽 불</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span class="p-res">"아딱 고슈, 꽁뜨르 아딱 드와뜨, 뚜슈 고슈." → 왼쪽 점수</span></div>
</div>
<div class="callout warn"><span class="ct">초보자가 가장 많이 틀리는 판정</span>"내가 먼저 맞췄는데 왜 상대 점수?" — 플러레에서는 <strong>먼저 닿은 것</strong>이 아니라 <strong>먼저 올바르게 공격을 시작한 것</strong>이 기준입니다. 이것이 에페와 가장 다른 점입니다.</div>`
      },
      {
        id: 'simul',
        title: '시뮬따네(동시 공격) — 둘 다 무효',
        html: `
<p>양쪽이 <strong>같은 순간에 공격을 착상하고 실행</strong>해서 둘 다 맞으면 <span class="term">시뮬따네 <span class="fr">Simultané</span></span>입니다. 이때는 <strong>양쪽 모두 점수 없이</strong> 제자리에서 다시 시작합니다.</p>
<ul>
  <li>심판은 두 손을 나란히 들어 보이며 "시뮬따네" 또는 "빠 드 뚜슈(점수 없음)"라고 합니다.</li>
  <li>양쪽 불이 켜졌다고 항상 시뮬따네가 되는 건 아닙니다. 대부분은 한쪽의 <strong>실수(늦은 공격, 꽁딱, 늦은 리뽀스트 등)</strong>가 있어서 한쪽 점수가 됩니다. 심판이 "누구의 잘못인지 <strong>도저히 가릴 수 없을 때</strong>"에만 시뮬따네입니다.</li>
  <li>이 사이트의 퀴즈에서는 '무효(시뮬따네)' 선택지가 있습니다. 상급에서 특히 자주 나옵니다.</li>
</ul>`
      },
      {
        id: 'referee',
        title: '심판의 판정 순서와 용어',
        html: `
<p>심판은 다음 순서로 경기를 진행합니다. 용어는 프랑스어를 그대로 씁니다.</p>
<div class="table-wrap"><table>
  <thead><tr><th>용어</th><th>원어</th><th>뜻</th></tr></thead>
  <tbody>
    <tr><td><strong>앙 가르드</strong></td><td>En garde</td><td>준비 자세</td></tr>
    <tr><td><strong>프레?</strong></td><td>Prêts?</td><td>준비됐나요?</td></tr>
    <tr><td><strong>알레!</strong></td><td>Allez!</td><td>시작</td></tr>
    <tr><td><strong>알트!</strong></td><td>Halte!</td><td>멈춤</td></tr>
    <tr><td><strong>아딱</strong></td><td>Attaque</td><td>공격</td></tr>
    <tr><td><strong>빠라드 (리뽀스트)</strong></td><td>Parade (riposte)</td><td>막기 (되받기)</td></tr>
    <tr><td><strong>꽁뜨르 아딱 / 꽁딱</strong></td><td>Contre-attaque</td><td>반격</td></tr>
    <tr><td><strong>린느</strong></td><td>(Pointe en) ligne</td><td>팔을 펴고 포인트를 겨눈 자세</td></tr>
    <tr><td><strong>르미즈</strong></td><td>Remise</td><td>막힌 뒤 팔을 접지 않고 다시 찌름</td></tr>
    <tr><td><strong>시뮬따네</strong></td><td>Simultané</td><td>동시 공격 → 무효</td></tr>
    <tr><td><strong>뚜슈</strong></td><td>Touche</td><td>유효, 점수</td></tr>
    <tr><td><strong>빠 드 뚜슈 / 농 발라블</strong></td><td>Pas de touche / Non valable</td><td>점수 없음 / 무효</td></tr>
    <tr><td><strong>드와뜨 / 고슈</strong></td><td>Droite / Gauche</td><td>오른쪽 / 왼쪽</td></tr>
  </tbody>
</table></div>
<h3>판정 문장 읽는 법</h3>
<p>심판은 <strong>"누가 무엇을 했는지"를 순서대로</strong> 말하고 마지막에 결과를 말합니다.</p>
<div class="phrase">
  <div class="p-row"><span class="p-who J">심판</span><span>"아딱 드와뜨(오른쪽 공격), 빠라드 리뽀스트 고슈(왼쪽이 막고 되받음), <span class="p-res">뚜슈 고슈</span>."</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span>"아딱 고슈 노(왼쪽 공격 실패), 리뽀스트 드와뜨, <span class="p-res">뚜슈 드와뜨</span>."</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span>"린느 드와뜨(오른쪽 린느), 아딱 고슈 당 라 린느(왼쪽이 린느 안으로 공격), <span class="p-res">뚜슈 드와뜨</span>."</span></div>
</div>
<p>손동작도 함께 씁니다. 공격한 쪽을 가리키며 앞으로 미는 손짓(아딱), 손바닥으로 막는 시늉(빠라드), 두 손을 나란히 드는 동작(시뮬따네) 등입니다. 영상 퀴즈에서 심판의 손을 보면 판정을 알 수 있으니, 이 사이트의 클립은 심판 판정 직전에 끝납니다.</p>`
      },
      {
        id: 'checklist',
        title: '초급 판정 체크리스트',
        html: `
<p>양쪽 불이 켜졌을 때 아래 순서로 스스로 물어보세요.</p>
<div class="flow">
  <div class="step"><span class="n">1</span><div><b>누가 먼저 팔을 펴며 앞으로 나갔나?</b> → 그 사람이 일단 공격권.</div></div>
  <div class="step"><span class="n">2</span><div><b>칼이 부딪혔나? 누가 막았나?</b> → 막은 쪽이 바로 찔렀으면 리뽀스트 점수.</div></div>
  <div class="step"><span class="n">3</span><div><b>공격이 빗나가거나 짧았나?</b> → 공격권 소멸. 그 다음 동작을 본다.</div></div>
  <div class="step"><span class="n">4</span><div><b>공격받은 쪽이 막지 않고 그냥 찔렀나?</b> → 꽁딱. 공격한 쪽 점수.</div></div>
  <div class="step"><span class="n">5</span><div><b>정말 똑같이 시작했나?</b> → 시뮬따네, 무효.</div></div>
</div>
<p>이제 <a href="#/quiz">판정 퀴즈 초급</a>으로 가서 실제 경기 영상으로 연습해 보세요.</p>`
      }
    ]
  },

  advanced: {
    key: 'advanced',
    title: '심화 개념',
    subtitle: '린느, 프레파라시옹, 르미즈, 시뮬따네… 실제 판정이 갈리는 부분들. 퀴즈 중급·상급용.',
    sections: [
      {
        id: 'line',
        title: '린느 (뽀앙 앙 린느)',
        html: `
<p><span class="term">린느 <span class="fr">Pointe en ligne</span></span>는 <strong>팔을 완전히 펴고 포인트가 상대의 유효면을 계속 위협하는 자세</strong>입니다. 상대가 공격을 <strong>시작하기 전</strong>에 이 자세가 확립되어 있으면, 린느 쪽이 <strong>우선권</strong>을 가집니다.</p>
<div class="callout key"><span class="ct">규정의 핵심</span>상대가 린느 상태일 때 공격하려면 <strong>먼저 상대의 칼을 쳐내야(바뜨망·프리즈 드 페르)</strong> 합니다. 칼을 쳐내지 않고 그냥 들어가서 둘 다 맞으면 <strong>린느 쪽 점수</strong>입니다. 심판은 <em>"린느 드와뜨, 아딱 고슈 당 라 린느(린느 안으로 공격), 뚜슈 드와뜨"</em>라고 판정합니다.</div>
<h3>린느가 인정되는 조건</h3>
<ul>
  <li><strong>팔이 완전히 펴져</strong> 있고, 포인트가 <strong>유효면</strong>을 향해야 합니다. 팔이 굽어 있거나 포인트가 하늘·바닥·팔을 향하면 린느가 아닙니다.</li>
  <li>상대 공격이 <strong>시작되기 전에</strong> 확립돼야 합니다. 상대가 이미 팔을 펴며 공격을 시작한 뒤 팔을 펴는 것은 린느가 아니라 <strong>꽁딱</strong>입니다.</li>
  <li>린느는 <strong>유지</strong>해야 합니다. 팔을 굽히거나 포인트가 크게 흔들려 위협이 끊기면 그 순간 우선권을 잃습니다. 뒤로 물러나며 유지하는 것은 괜찮습니다.</li>
</ul>
<h3>린느를 깨는 방법과 데로브망</h3>
<ul>
  <li>공격자가 <strong>바뜨망(치기)이나 프리즈 드 페르(잡기)</strong>로 상대 칼을 공격선 밖으로 밀어내면 공격권이 공격자에게 넘어옵니다. <strong>살짝 스치는 것으로는 부족</strong>합니다.</li>
  <li>린느 쪽이 칼을 돌려 상대의 바뜨망을 <strong>피하면(데로브망 <span class="fr">Dérobement</span>)</strong> 린느는 그대로 유지되고, 공격자가 그대로 들어가 둘 다 맞으면 린느 쪽 점수입니다.</li>
  <li>칼을 쳐낸 뒤 린느 쪽이 <strong>막지 않고 다시 팔을 펴서</strong> 같이 맞으면, 공격자 점수입니다.</li>
</ul>
<div class="phrase">
  <div class="p-row"><span class="p-who R">오른쪽</span><span>팔을 펴고 린느 확립, 뒤로 물러나며 유지</span></div>
  <div class="p-row"><span class="p-who L">왼쪽</span><span>칼을 찾으려 바뜨망 시도 → 오른쪽이 데로브망으로 피함 → 왼쪽 그대로 팡뜨</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span class="p-res">"린느 드와뜨, 아딱 고슈 당 라 린느, 뚜슈 드와뜨." → 오른쪽 점수</span></div>
</div>
<div class="callout warn"><span class="ct">실전 판정의 어려움</span>린느는 심판마다 엄격함이 다릅니다. "팔이 충분히 펴졌는가", "공격 시작보다 먼저였는가"를 두고 판정이 갈립니다. 국제 대회에서는 <strong>팔이 완전히 펴지고 포인트가 안정된 경우</strong>에만 린느를 인정하는 경향이 강합니다. 조금이라도 늦거나 팔이 굽으면 꽁딱으로 봅니다.</div>`
      },
      {
        id: 'prep',
        title: '프레파라시옹과 아딱 오 프레파라시옹',
        html: `
<p><span class="term">프레파라시옹 <span class="fr">Préparation</span></span>은 공격을 하기 위한 <strong>준비 동작</strong>입니다. 팔을 굽힌 채 전진하기, 칼을 찾으려 흔들기, 페인트로 상대 반응 보기 등이 모두 준비 동작입니다. <strong>준비 동작은 공격이 아니므로 공격권이 없습니다.</strong></p>
<p>상대가 준비 동작을 하는 동안 내가 <strong>팔을 펴며 공격을 시작</strong>하면 그것이 진짜 공격이 됩니다. 이를 <span class="term">아딱 오 프레파라시옹 <span class="fr">Attaque sur la préparation</span></span>(준비 동작에 대한 공격)이라고 합니다.</p>
<div class="phrase">
  <div class="p-row"><span class="p-who L">왼쪽</span><span>팔을 굽힌 채 마르셰로 밀고 들어옴 (준비)</span></div>
  <div class="p-row"><span class="p-who R">오른쪽</span><span>왼쪽이 아직 팔을 펴기 전에 팔을 펴며 팡뜨 → 왼쪽도 뒤늦게 팔을 펴 둘 다 맞음</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span class="p-res">"아딱 드와뜨(오 프레파라시옹), 뚜슈 드와뜨." → 오른쪽 점수</span></div>
</div>
<h3>판정 포인트: 팔이 먼저인가, 발이 먼저인가</h3>
<ul>
  <li>공격은 <strong>팔이 펴지기 시작하는 순간</strong>부터입니다. 앞으로 나가는 발만 보면 틀립니다.</li>
  <li>전진하는 쪽이 <strong>팔을 늦게 펴면</strong> 그 사이에 상대가 팔을 편 공격이 우선입니다. 이것이 "밀고 들어오는 쪽이 졌다"고 느껴지는 판정의 정체입니다.</li>
  <li>반대로 전진하는 쪽이 <strong>팔을 펴며(포인트가 위협하며)</strong> 들어오고 있었다면, 물러나던 쪽이 팔을 펴서 찌른 것은 <strong>꽁딱</strong>입니다.</li>
  <li>양쪽 다 팔이 굽은 채 동시에 팔을 펴면 → 시뮬따네에 가까워집니다.</li>
</ul>
<div class="callout tip"><span class="ct">0.5배속으로 볼 때 확인할 것</span>두 선수의 <strong>팔꿈치</strong>를 보세요. 어느 쪽 팔이 먼저 펴지기 시작하는지, 그때 상대의 팔은 굽어 있었는지가 판정의 90%입니다.</div>`
      },
      {
        id: 'attack-no',
        title: '아딱 노(공격 실패)와 공격의 끝',
        html: `
<p>공격이 <strong>빗나가거나(헛찌름), 짧거나(포인트가 닿지 않음)</strong>, 막히면 그 공격은 끝난 것이고 공격권도 사라집니다. 심판은 <em>"아딱 노(Attaque non)"</em> 또는 <em>"아딱 빠(pas)"</em>라고 합니다.</p>
<h3>공격은 언제 끝나는가</h3>
<ul>
  <li><strong>팡뜨(런지)</strong>로 한 공격은 <strong>앞발이 착지하고 포인트가 도착하거나 빗나간 순간</strong> 끝납니다. 그 뒤에 계속 밀어 넣는 것은 새 공격이 아니라 <strong>르미즈</strong>입니다.</li>
  <li><strong>플레슈</strong>로 한 공격은 찌르기가 도착하거나 빗나가는 순간 끝납니다. 지나쳐 달리는 동안 상대가 찌르면 상대 점수입니다.</li>
  <li>공격이 끝난 뒤 상대가 하는 찌르기는 <strong>리뽀스트(막았을 때)</strong> 또는 <strong>새로운 공격(피했을 때)</strong>으로 우선권을 가집니다.</li>
</ul>
<div class="phrase">
  <div class="p-row"><span class="p-who L">왼쪽</span><span>팡뜨 공격 → 오른쪽이 뒤로 빠져 포인트가 짧게 빗나감 (아딱 노)</span></div>
  <div class="p-row"><span class="p-who R">오른쪽</span><span>공격이 끝난 뒤 팔을 펴며 팡뜨 (새 공격)</span></div>
  <div class="p-row"><span class="p-who L">왼쪽</span><span>팡뜨 자세에서 팔을 다시 뻗어 같이 맞음 (르미즈)</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span class="p-res">"아딱 고슈 노, 아딱(리뽀스트) 드와뜨, 뚜슈 드와뜨." → 오른쪽 점수</span></div>
</div>
<div class="callout tip"><span class="ct">흰 불이 켜졌다면</span>무효면(팔·다리·마스크)을 찌르면 흰 불이 켜지고 <strong>동작이 즉시 멈춥니다.</strong> 그 이후의 찌르기는 모두 무효라서, "아딱 노"와는 다릅니다. 예: 공격이 팔을 찔러 흰 불 → 그 뒤 상대의 리뽀스트가 몸통에 들어가도 점수 없음.</div>`
      },
      {
        id: 'remise',
        title: '르미즈·르두블망·르쁘리즈 vs 리뽀스트',
        html: `
<p>공격이 막히거나 빗나간 뒤 <strong>공격자가 다시 찌르는 동작</strong>을 통틀어 <strong>공격의 재개</strong>라고 합니다.</p>
<div class="table-wrap"><table>
  <thead><tr><th>용어</th><th>원어</th><th>뜻</th></tr></thead>
  <tbody>
    <tr><td><strong>르미즈</strong></td><td>Remise</td><td>팔을 접지 않고 <strong>같은 선에서</strong> 다시 밀어 넣기</td></tr>
    <tr><td><strong>르두블망</strong></td><td>Redoublement</td><td>팔을 접었다가 또는 <strong>다른 선으로</strong> 다시 찌르기 (같은 자리에서)</td></tr>
    <tr><td><strong>르쁘리즈</strong></td><td>Reprise d'attaque</td><td>앙 가르드로 돌아온 뒤 <strong>새로 팡뜨</strong>하는 공격</td></tr>
  </tbody>
</table></div>
<h3>리뽀스트와의 우선권 — 규정의 정확한 기준</h3>
<div class="callout key"><span class="ct">규정</span>막은 쪽이 <strong>즉시, 한 템포에, 팔을 회수하지 않고 하는 단순 리뽀스트</strong>는 르미즈·르두블망·르쁘리즈보다 우선합니다. 반대로 막은 뒤 <strong>머뭇거리거나(지연 리뽀스트), 팔을 접었다 펴거나, 페인트를 섞으면</strong> 그 사이에 들어온 르미즈가 우선합니다.</div>
<ul>
  <li>즉 르미즈는 <strong>"상대가 리뽀스트를 늦게 했을 때"</strong>만 점수가 됩니다. 심판이 "르미즈 뚜슈"라고 하면 상대의 리뽀스트가 늦었다는 뜻입니다.</li>
  <li>공격이 <strong>빗나간(아딱 노) 뒤</strong> 상대가 막지도 않고 바로 공격했다면, 그것은 리뽀스트가 아니라 새 공격이고, 이때 원래 공격자의 르미즈는 우선권이 없습니다. 상대의 새 공격이 <strong>즉시</strong>였는지가 역시 핵심입니다.</li>
</ul>
<div class="phrase">
  <div class="p-row"><span class="p-who R">오른쪽</span><span>공격 → 왼쪽이 6번(식스트) 빠라드</span></div>
  <div class="p-row"><span class="p-who L">왼쪽</span><span>막고 나서 한 박자 쉬었다가(페인트) 리뽀스트</span></div>
  <div class="p-row"><span class="p-who R">오른쪽</span><span>그 사이 팔을 그대로 두고 다시 밀어 넣어 먼저 도착 (르미즈)</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span class="p-res">"아딱 드와뜨, 빠라드 고슈, 르미즈 드와뜨, 뚜슈 드와뜨." → 오른쪽 점수</span></div>
</div>`
      },
      {
        id: 'compound',
        title: '복합 공격과 꽁딱의 "한 템포" 규칙',
        html: `
<p>페인트를 섞은 <span class="term">복합 공격</span>은 동작이 길기 때문에 상대가 중간에 찌를 틈이 생깁니다. 규정은 이렇게 정합니다.</p>
<div class="callout key"><span class="ct">규정</span>복합 공격 중의 꽁딱(스톱 히트)은 <strong>공격의 마지막 동작이 시작되기 전에 도착</strong>해야, 즉 <strong>한 펜싱 템포 앞서야</strong> 유효합니다. 마지막 동작과 같은 순간에 들어가면 꽁딱은 무효이고 공격자 점수입니다.</div>
<ul>
  <li>복합 공격이 올바르려면 첫 페인트에서 팔이 펴지며 위협하고, <strong>이후 동작에서 팔을 굽히면 안 됩니다.</strong> 중간에 팔을 굽히거나 멈칫하면 그 순간부터 준비 동작이 되어 상대 꽁딱(사실상 공격)이 우선합니다.</li>
  <li>상대가 복합 공격 중에 <strong>칼을 찾아 막았는데도(빠라드)</strong> 공격자가 계속 밀어 넣어 둘 다 맞으면, 즉시 리뽀스트한 쪽 점수입니다.</li>
  <li><span class="term">꽁뜨르 땅 <span class="fr">Contre-temps</span></span>: 상대의 꽁딱을 유도해 놓고 그것을 막고 되받는 동작. 이 경우 "꽁딱 → 빠라드 리뽀스트"로 판정합니다.</li>
</ul>
<div class="phrase">
  <div class="p-row"><span class="p-who L">왼쪽</span><span>원-투(페인트 후 데가제) 복합 공격 시작 — 페인트 중 팔이 살짝 굽음</span></div>
  <div class="p-row"><span class="p-who R">오른쪽</span><span>페인트 순간 팔을 펴 찌름 → 왼쪽의 마지막 데가제보다 확실히 먼저 도착</span></div>
  <div class="p-row"><span class="p-who J">심판</span><span class="p-res">"아딱 고슈 꽁뽀제, 꽁뜨르 아딱 드와뜨 앙 땅(한 템포 앞), 뚜슈 드와뜨." → 오른쪽 점수</span></div>
</div>`
      },
      {
        id: 'blade',
        title: '칼 접촉: 바뜨망인가, 빠라드인가',
        html: `
<p>양쪽 불이 켜지기 직전에 <strong>칼이 부딪혔다면</strong> 판정은 "그 접촉이 <strong>누구의 동작</strong>이었나"로 갈립니다.</p>
<div class="table-wrap"><table>
  <thead><tr><th>접촉의 주체</th><th>이름</th><th>결과</th></tr></thead>
  <tbody>
    <tr><td>공격하는 쪽이 상대 칼을 치고 들어감</td><td><strong>바뜨망 / 프리즈 드 페르</strong></td><td>공격자 공격권 유지 (특히 상대가 린느일 때 필수)</td></tr>
    <tr><td>공격받는 쪽이 상대 칼을 막아냄</td><td><strong>빠라드</strong></td><td>공격권이 막은 쪽으로 이동 → 즉시 리뽀스트 우선</td></tr>
    <tr><td>공격자가 상대 칼을 찾았지만 실패 (상대가 피함)</td><td><strong>데로브망</strong></td><td>공격권이 피한 쪽(린느)으로 넘어감</td></tr>
    <tr><td>서로 칼이 스치기만 함</td><td>접촉 아님</td><td>공격권 변동 없음 — 원래 공격이 계속</td></tr>
  </tbody>
</table></div>
<ul>
  <li>판단 기준은 <strong>누가 칼을 움직여서 상대 칼을 찾았는가</strong>, 그리고 <strong>그 접촉 뒤 누구 칼이 공격선에서 밀려났는가</strong>입니다.</li>
  <li>공격자가 <strong>바뜨망을 했는데 상대 칼이 밀리지 않은 채</strong> 상대가 바로 찌르면, 그것은 상대의 리뽀스트가 아니라 여전히 꽁딱입니다(공격은 계속 유효). 반대로 상대가 공격자의 바뜨망을 <strong>받아 막으며(빠라드처럼)</strong> 되받았다면 리뽀스트입니다. 이 구분이 상급 판정에서 가장 어렵습니다.</li>
  <li>뒤로 물러나면서 <strong>상대 칼을 톡톡 치는 것</strong>은 흔히 방어적 준비 동작으로 보며, 이때 상대가 팔을 펴고 들어오면 상대 공격입니다.</li>
</ul>`
      },
      {
        id: 'simul-adv',
        title: '시뮬따네 vs 더블 뚜슈 — 어떻게 가르나',
        html: `
<p>양쪽이 맞았을 때 결과는 둘 중 하나입니다.</p>
<ul>
  <li><strong>시뮬따네(동시 공격)</strong>: 두 선수가 <strong>동시에 공격을 착상하고 실행</strong>. 한쪽이 무효면을 맞혔더라도 <strong>양쪽 다 무효</strong>, 점수 없음.</li>
  <li><strong>더블 뚜슈(한쪽의 잘못)</strong>: 한쪽의 잘못된 동작(꽁딱, 지연 리뽀스트, 린느 안으로의 공격, 준비 동작 중 피격 등)으로 둘 다 맞음 → <strong>잘못한 쪽만 맞은 것으로</strong> 판정, 상대 점수.</li>
</ul>
<h3>규정이 "공격받은 쪽만 맞은 것"으로 보는 경우</h3>
<ul>
  <li>상대의 단순 공격에 <strong>꽁딱</strong>을 했을 때</li>
  <li>막지 않고 <strong>피하려다 실패</strong>했을 때</li>
  <li>막고 나서 <strong>머뭇거려</strong> 상대에게 르미즈·르두블망·르쁘리즈 기회를 줬을 때</li>
  <li>복합 공격 중 <strong>한 템포 앞서지 못한</strong> 꽁딱을 했을 때</li>
  <li>린느 상태에서 칼을 <strong>쳐냈는데도</strong> 막지 않고 다시 찌르거나 린느를 다시 잡았을 때</li>
</ul>
<h3>규정이 "공격한 쪽만 맞은 것"으로 보는 경우</h3>
<ul>
  <li>상대가 <strong>린느</strong>인데 칼을 쳐내지 않고 공격했을 때</li>
  <li>칼을 찾으려다 <strong>데로브망</strong>으로 실패했는데 그대로 공격했을 때</li>
  <li>복합 공격 중 상대가 <strong>막았는데도</strong> 계속 공격하고 상대가 즉시 리뽀스트했을 때</li>
  <li>복합 공격 중 <strong>팔을 굽히거나 멈칫</strong>했을 때 상대가 찌른 경우</li>
  <li>복합 공격 중 <strong>한 템포 앞선 꽁딱</strong>을 맞았을 때</li>
  <li>상대가 즉시·한 템포·팔 회수 없이 <strong>단순 리뽀스트</strong>했는데 르미즈로 같이 맞았을 때</li>
</ul>
<div class="callout tip"><span class="ct">심판이 정말 판단할 수 없을 때만</span>규정은 "심판이 어느 쪽 잘못인지 명확히 가릴 수 없을 때" 양쪽을 다시 앙 가르드시키라고(시뮬따네) 합니다. 따라서 <strong>시뮬따네는 판정의 기본값이 아니라 마지막 선택지</strong>입니다. 상급 퀴즈에서 '무효'를 고를 때는 정말로 양쪽 팔이 같은 순간에 펴졌는지 확인하세요.</div>`
      },
      {
        id: 'misc',
        title: '플레슈·꼬르 아 꼬르·경계선·카드',
        html: `
<ul>
  <li><span class="term">플레슈 <span class="fr">Flèche</span></span>: 달려 들어가는 공격. 플러레에서 허용되며(사브르는 금지) 찌르기가 끝나면 공격도 끝납니다. 상대를 <strong>지나친 뒤</strong>에는 찌를 수 없고, 상대는 즉시 리뽀스트할 수 있습니다.</li>
  <li><span class="term">꼬르 아 꼬르 <span class="fr">Corps à corps</span></span>: 몸이 부딪힌 상태. 심판이 "알트"로 멈춥니다. 플러레에서는 <strong>고의로 몸을 부딪히거나 상대를 미는 행위</strong>가 경고(옐로 카드) 대상입니다. 꼬르 아 꼬르 직전에 들어온 유효 찌르기는 인정됩니다.</li>
  <li><span class="term">피스트 뒤 경계선</span>: 두 발이 모두 뒤 경계선을 완전히 넘으면 <strong>상대 점수</strong>입니다. 옆선을 한 발이라도 넘으면 알트, 넘은 선수가 <strong>1m 뒤로 물러난 위치</strong>에서 재개합니다(패널티). 넘은 뒤에 들어온 찌르기는 무효.</li>
  <li><span class="term">등 돌리기, 무효면 가리기</span>: 상대에게 등을 보이거나(경고), 무기 잡지 않은 손·팔로 유효면을 가리는 것(경고, 반복 시 상대 점수)은 반칙입니다.</li>
  <li><span class="term">카드</span>: 옐로(경고) → 같은 경기에서 다시 반칙 시 레드(상대 1점). 블랙 카드는 퇴장. 준비 자세 전 출발(알레 전 출발)도 경고 대상입니다.</li>
</ul>
<p>퀴즈에서는 공격권 판정에 집중하지만, 실제 경기 영상에서 "알트" 뒤 카드가 나오는 장면이 있을 수 있습니다.</p>`
      },
      {
        id: 'adv-checklist',
        title: '상급 판정 체크리스트',
        html: `
<div class="flow">
  <div class="step"><span class="n">1</span><div><b>공격 시작 전에 린느가 있었나?</b> 있었다면 공격자가 칼을 확실히 쳐냈는가? 아니면 린느 점수.</div></div>
  <div class="step"><span class="n">2</span><div><b>먼저 전진한 쪽의 팔이 펴져 있었나?</b> 굽은 채 전진(준비) 중에 상대가 팔을 폈다면 상대 공격.</div></div>
  <div class="step"><span class="n">3</span><div><b>칼 접촉이 있었다면 누가 찾았나?</b> 공격자의 바뜨망이면 공격 유지, 방어자의 빠라드면 리뽀스트 우선.</div></div>
  <div class="step"><span class="n">4</span><div><b>공격이 끝났나(팡뜨 착지·빗나감)?</b> 끝났다면 그 뒤의 찌르기는 상대의 새 공격/리뽀스트가 우선. 단 상대가 즉시였을 때만.</div></div>
  <div class="step"><span class="n">5</span><div><b>리뽀스트가 즉시였나?</b> 지연·팔 회수·페인트가 있었다면 르미즈 점수.</div></div>
  <div class="step"><span class="n">6</span><div><b>정말 같은 순간이었나?</b> 두 팔꿈치가 동시에 펴졌다면 시뮬따네. 아니면 늦은 쪽이 꽁딱.</div></div>
</div>
<p>영상 퀴즈에서 헷갈리면 <strong>0.5배속</strong>으로 두 선수의 팔꿈치와 칼 접촉만 따로 보세요. 준비됐다면 <a href="#/quiz">퀴즈 중급·상급</a>으로!</p>`
      },
      {
        id: 'glossary',
        title: '용어 사전',
        html: `
<div class="table-wrap"><table>
  <thead><tr><th>한글 표기</th><th>원어</th><th>뜻</th></tr></thead>
  <tbody>
    <tr><td>아딱</td><td>Attaque</td><td>공격. 팔을 펴며 포인트로 유효면을 위협하는 첫 공세 동작</td></tr>
    <tr><td>아딱 노 / 빠</td><td>Attaque non / pas</td><td>공격 실패(빗나감·짧음)</td></tr>
    <tr><td>아딱 오 프레파라시옹</td><td>Attaque sur la préparation</td><td>상대 준비 동작 중의 공격</td></tr>
    <tr><td>아딱 꽁뽀제</td><td>Attaque composée</td><td>복합 공격(페인트 포함)</td></tr>
    <tr><td>바뜨망</td><td>Battement</td><td>상대 칼 치기</td></tr>
    <tr><td>빠라드</td><td>Parade</td><td>막기 (4번 꺄르트, 6번 식스트, 7번 셉띰, 8번 옥따브 등)</td></tr>
    <tr><td>리뽀스트</td><td>Riposte</td><td>막은 뒤 되받아 찌르기</td></tr>
    <tr><td>꽁뜨르 리뽀스트</td><td>Contre-riposte</td><td>리뽀스트를 막고 되받기</td></tr>
    <tr><td>꽁뜨르 아딱 (꽁딱)</td><td>Contre-attaque</td><td>상대 공격 중 막지 않고 찌르기(반격)</td></tr>
    <tr><td>꽁뜨르 땅</td><td>Contre-temps</td><td>상대의 꽁딱을 막고 되받기</td></tr>
    <tr><td>린느 / 뽀앙 앙 린느</td><td>Pointe en ligne</td><td>팔을 펴고 포인트를 겨눈 우선권 자세</td></tr>
    <tr><td>데로브망</td><td>Dérobement</td><td>린느 상태에서 상대의 칼 찾기를 피함</td></tr>
    <tr><td>프리즈 드 페르</td><td>Prise de fer</td><td>상대 칼을 잡아 옮기기</td></tr>
    <tr><td>르미즈</td><td>Remise</td><td>같은 선에서 다시 밀어 넣기</td></tr>
    <tr><td>르두블망</td><td>Redoublement</td><td>다른 선/팔 회수 후 다시 찌르기</td></tr>
    <tr><td>르쁘리즈</td><td>Reprise d'attaque</td><td>앙 가르드 복귀 후 새 공격</td></tr>
    <tr><td>시뮬따네</td><td>Simultané</td><td>동시 공격 → 무효</td></tr>
    <tr><td>프레파라시옹</td><td>Préparation</td><td>준비 동작(팔 굽힌 전진, 페인트 등)</td></tr>
    <tr><td>페인트</td><td>Feinte</td><td>속임 동작</td></tr>
    <tr><td>데가제</td><td>Dégagé</td><td>상대 칼 아래로 돌려 찌르기</td></tr>
    <tr><td>꾸뻬</td><td>Coupé</td><td>상대 칼 위로 넘겨 찌르기</td></tr>
    <tr><td>마르셰 / 롱쁘</td><td>Marche / Rompre</td><td>전진 / 후진 스텝</td></tr>
    <tr><td>팡뜨</td><td>Fente</td><td>런지</td></tr>
    <tr><td>플레슈</td><td>Flèche</td><td>달려 들어가는 공격</td></tr>
    <tr><td>꼬르 아 꼬르</td><td>Corps à corps</td><td>몸 부딪힘</td></tr>
    <tr><td>뚜슈 / 빠 드 뚜슈</td><td>Touche / Pas de touche</td><td>유효 / 점수 없음</td></tr>
    <tr><td>드와뜨 / 고슈</td><td>Droite / Gauche</td><td>오른쪽 / 왼쪽</td></tr>
  </tbody>
</table></div>`
      }
    ]
  }
};
