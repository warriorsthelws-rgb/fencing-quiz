# 펜싱 규칙 & 판정 퀴즈 (플러레)

플러레 공격권(우선권) 규칙 설명 + 실제 국제대회 영상으로 푸는 심판 판정 퀴즈.
모바일·데스크톱 겸용 정적 웹사이트 (HTML/CSS/JS, 빌드 도구 없음).

## 실행

유튜브 임베드는 `file://` 로 직접 열면 재생이 막힙니다(오류 153). **반드시 http 서버로 여세요.**

```bash
python -m http.server 8765
```

그다음 브라우저에서 http://localhost:8765 접속.

배포는 GitHub Pages, Netlify, Vercel 등 정적 호스팅에 폴더째 올리면 됩니다.

## 구조

```
index.html          진입점 (상단 바, 하단 탭바, 스크립트 로드)
css/style.css       스타일 (모바일 우선, 768px 이상 데스크톱, 다크 모드 자동)
js/rules-data.js    규칙 설명 콘텐츠 (기본 / 심화) — 섹션별 HTML
js/calls.js         판정 종류(아딱/꽁딱/빠라드-리뽀스트/린느/르미즈/시뮬따네) 해설 문구
js/questions.js     퀴즈 문제 데이터 (유튜브 ID, 구간, 정답, 일치율)
js/app.js           라우터 + 규칙 페이지 + 퀴즈 엔진 + YouTube IFrame Player
tools/build_questions.py   수집 데이터(JSON) → questions.js 변환 스크립트
```

## 퀴즈 흐름

1. 종목 선택 (현재 플러레만) → 2. 난이도 선택 (초급/중급/상급) → 3. 최대 10문제
4. 영상을 **한 번** 본 뒤 → `누구 불인지 (왼쪽/오른쪽/무효)` → `이유 (아딱/꽁딱/빠라드 리뽀스트/린느/르미즈)`
5. 즉시 `정답입니다!` / `틀렸습니다ㅜㅜ` + 심판 판정 문장 + 해설 + 규칙 링크
6. 언제든 **0.5배속** / 1배속으로 다시 보기 가능

## 문제 추가하기

`js/questions.js` 의 `QUESTIONS` 배열에 항목을 추가하면 됩니다.

```js
{
  "id": "my001", "weapon": "foil", "level": 1,
  "video": { "id": "유튜브영상ID", "start": 760, "end": 768 },   // 초 단위, 심판 판정 직전에 끝나도록
  "answer": { "side": "R", "call": "attack" },                 // side: L | R | S(시뮬따네), call: attack|counter|riposte|remise|line|null
  "left": "왼쪽 선수", "right": "오른쪽 선수", "event": "대회명",
  "agree": 88, "votes": 446,                                   // (선택) 커뮤니티 일치율
  "note": "이 장면만의 추가 해설 (선택)",
  "source": "출처 URL (선택)"
}
```

현재 문제들은 [Quarte-Riposte Actions](https://actions.quarte-riposte.com/)에서 **검증된(verified) 판정**이 붙은
FIE 국제대회 유튜브 클립을 수집한 것입니다. 난이도는 심판 판정과 커뮤니티 투표의 일치율, 동작 종류로 자동 분류했습니다.
더 수집하려면:

```bash
python tools/scrape_quarte_riposte.py tools/qr_actions.json 1 12500 300 4
```

```bash
python tools/build_questions.py tools/qr_actions.json --candidates --out candidates.js
```

```bash
python tools/detect_lights.py candidates.js tools/lights.json
```

```bash
python tools/build_questions.py tools/qr_actions.json
```

`detect_lights.py` 는 각 클립의 터치 전후 5초를 유튜브에서 받아(yt-dlp) 중계 그래픽의 심판기 불 표시를 읽습니다
(`pip install yt-dlp imageio-ffmpeg pillow numpy`). **중급·상급에는 양쪽 불이 모두 켜진 장면만** 들어가고,
한쪽 불만 켜진 장면은 초급으로 갑니다. 불 정보가 없는 문제는 제외됩니다.

## 앞으로

- 에페 / 사브르 종목 추가 (`weapon` 필드만 바꾸면 됨)
- 문제별 `note` 로 장면 맞춤 해설 보강
- 클립 `start`/`end` 미세 조정 (심판 손동작이 보이면 `end` 를 1초 줄이기)
