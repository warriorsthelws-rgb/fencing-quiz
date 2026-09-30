/* =====================================================
   경고·카드 판정 — 영상 문제
   =====================================================

   ▶ 문제 추가하는 법 (이 파일만 고치면 됩니다)

   아래 배열에 한 덩어리씩 추가하세요. 필요한 건 4개뿐입니다.

     video : 유튜브 영상 ID (주소의 v= 뒤 11글자)
     start : 클립 시작 초
     end   : 클립 끝 초  ← 심판이 카드를 꺼내기 "직전"에서 끊으세요
     answer: 'none' | 'yellow' | 'red' | 'black'

   나머지(offence·explain·event)는 있으면 해설에 뜨고, 없어도 동작합니다.

     {
       id: 'cv10',                                  // 겹치지 않는 아무 값
       video: '11p4BKtdPr4', start: 0.5, end: 10,   // 0분30초 = 30
       answer: 'yellow',
       offence: '밀치기',                            // (선택) 반칙 이름
       explain: '한 줄 해설',                        // (선택)
       event: '2019 Anaheim GP',                    // (선택) 대회명
     },

   💡 시간 확인 요령: 유튜브에서 영상을 열고 카드가 나오는 지점의 시각을 봅니다.
      end 는 그보다 1~2초 앞으로 잡아야 답이 미리 보이지 않습니다.

   💡 카드 장면 찾기 좋은 영상
      - https://www.youtube.com/watch?v=11p4BKtdPr4  선수 카드 모음 (플러레, 5분)
      - https://www.youtube.com/watch?v=kxb70pG0jfc  코치 카드 모음 (플러레, 2분, 전부 옐로)
   ===================================================== */

const CARD_VIDEO_QUESTIONS = [
  {
    id: 'cv01',
    video: '11p4BKtdPr4', start: 0.5, end: 10.0,
    answer: 'yellow',
    event: '2019 Anaheim Foil GP · SAFIN vs ASPROMONTE',
    explain: '접근전이 이어진 뒤 심판이 옐로 카드를 꺼냈습니다. 1군 반칙의 첫 번째이므로 경고이고 점수는 그대로입니다.',
  },
];
