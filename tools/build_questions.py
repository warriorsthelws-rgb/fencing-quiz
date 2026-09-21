"""
qr_actions.json (Quarte-Riposte Actions 사이트에서 수집한 '검증된' 판정 데이터)
→ js/questions.js 로 변환합니다.

사용법:
  python tools/build_questions.py tools/qr_actions.json            # 유튜브 임베드 가능 여부까지 확인
  python tools/build_questions.py tools/qr_actions.json --no-embed-check
  python tools/build_questions.py tools/qr_actions.json --candidates --out /tmp/candidates.js
      # 불 정보가 아직 없는 클립도 포함한 후보 목록 → detect_lights.py 의 입력으로 사용

전체 파이프라인 (문제 추가 시):
  1) python tools/scrape_quarte_riposte.py tools/qr_actions.json 1 12500 300 4
  2) python tools/build_questions.py tools/qr_actions.json --candidates --out candidates.js
  3) python tools/detect_lights.py candidates.js tools/lights.json
  4) python tools/build_questions.py tools/qr_actions.json

각 문제는 유튜브 영상 ID + 시작/끝 초 + 심판 판정(누구/무슨 동작) + 커뮤니티 일치율로 구성됩니다.
난이도(level)는 일치율과 동작 종류로 자동 분류하며, 생성된 questions.js 는 손으로 수정해도 됩니다.
"""
import json, re, sys, os, html

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "js", "questions.js")
if "--out" in sys.argv:
    OUT = sys.argv[sys.argv.index("--out") + 1]

CALL_MAP = {"Attack": "attack", "Counter Attack": "counter", "Riposte": "riposte", "Remise": "remise", "Line": "line"}
CALL_IDX = {"attack": 0, "counter": 1, "riposte": 2, "remise": 3, "line": 4, "unknown": 5, "simultaneous": 6}


def parse_verified(s):
    if s.strip().lower().startswith("simultaneous"):
        return "S", "simultaneous"
    m = re.match(r"(Attack|Counter Attack|Riposte|Remise|Line) from the (?:the )?(Left|Right)", s)
    if not m:
        return None, None
    return ("L" if m.group(2) == "Left" else "R"), CALL_MAP[m.group(1)]


def short_event(t):
    if not t:
        return ""
    t = html.unescape(t).replace("®", "").strip()
    t = re.sub(r"\s+", " ", t)
    # 너무 긴 대회명 줄이기
    t = re.sub(r"Absolute Fencing Gear\s*", "", t)
    return t[:60]


def clean_name(n):
    """'Bonn HATOEL, Maor' 처럼 앞에 대회명이 붙은 경우 성(대문자)부터만 남김"""
    n = html.unescape(n or "").strip()
    m = re.search(r"((?:[A-Z][A-Z'\-]*\s)*[A-Z][A-Z'\-]+),\s*(.+)$", n)
    return f"{m.group(1)}, {m.group(2).strip()}" if m else n


CALL_KEYS = ["attack", "counter", "riposte", "remise", "line", "unknown", "simultaneous"]


def situation_for(side, call, L, R, N, votes):
    """투표 분포에서 '심판 판정 외에 가장 많이 나온 해석'을 찾아 장면의 상황을 분류합니다.
    반환: (situation_key, alt)  alt = {"side","call","pct"} 또는 None
      - clean        : 다른 해석이 거의 없음
      - opp-<call>   : 반대편 선수의 <call>로 본 사람이 많음  (예: 아딱 판정인데 상대 빠라드-리뽀스트로 본 경우 = 말빠레 상황)
      - same-<call>  : 같은 편의 다른 동작으로 본 사람이 많음 (예: 아딱 판정인데 같은 편 꽁딱으로 본 경우 = 준비 동작에 대한 공격)
      - any-<call>   : (시뮬따네 판정일 때) 한쪽의 <call>로 본 사람이 많음
    """
    cands = []
    for s_key, arr in (("L", L), ("R", R)):
        for i, c in enumerate(CALL_KEYS):
            if c == "unknown":
                continue
            if c == "simultaneous":
                continue  # 아래에서 합산
            if s_key == side and c == call:
                continue  # 심판 판정 자체
            cands.append((arr[i], s_key, c))
    sim_votes = L[6] + R[6] + N
    if call != "simultaneous":
        cands.append((sim_votes, None, "simultaneous"))
    if not cands or not votes:
        return "clean", None
    cnt, s_key, c = max(cands, key=lambda x: x[0])
    pct = round(cnt * 100 / votes)
    if cnt < 3 or pct < 12:
        return "clean", None
    if call == "simultaneous":
        key = "any-" + c
    elif c == "simultaneous":
        key = "opp-simul"
    else:
        key = ("same-" if s_key == side else "opp-") + c
    return key, {"side": s_key, "call": c, "pct": pct}


def level_for(agree, side_agree, votes, call):
    if agree >= 80 and side_agree >= 90:
        lv = 1
    elif agree >= 60:
        lv = 2
    else:
        lv = 3
    if call in ("line", "remise", "simultaneous"):
        lv = max(lv, 2)
    if votes < 10:
        lv = max(lv, 2)  # 표본이 적으면 신뢰도 낮음
    return lv


def check_embeddable(video_ids):
    """유튜브 oEmbed 로 영상이 살아있고 임베드 가능한지 확인 (200 이면 OK). 결과는 tools/embed_cache.json 에 캐시."""
    import urllib.request
    cache_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "embed_cache.json")
    try:
        cache = json.load(open(cache_path, encoding="utf-8"))
    except Exception:
        cache = {}
    for vid in video_ids:
        if vid in cache:
            continue
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                cache[vid] = r.status
        except urllib.error.HTTPError as e:
            cache[vid] = e.code
        except Exception:
            cache[vid] = 0
        print("embed check", vid, cache[vid], flush=True)
    json.dump(cache, open(cache_path, "w", encoding="utf-8"), indent=1)
    return {v for v in video_ids if cache.get(v) == 200}


def load_lights():
    """tools/lights.json (detect_lights.py 결과): {qid: {"L": "red|white|off", "R": "green|white|off"}}"""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lights.json")
    try:
        return json.load(open(path, encoding="utf-8"))
    except Exception:
        return {}


def main():
    data = json.load(open(SRC, encoding="utf-8"))
    lights = load_lights()
    out = []
    dropped_single = 0
    for rec in data.values():
        side, call = parse_verified(rec.get("verified") or "")
        if not side:
            continue
        m = re.search(r"v=([\w-]{11})&(?:amp;)?t=(\d+)", rec.get("yt") or "")
        if not m:
            continue
        vid, t = m.group(1), int(m.group(2))
        ms = re.search(r"/combined/(\d+)\.mp4", rec.get("src") or "")
        end = int(ms.group(1)) if ms else t + 8
        if end <= t:
            end = t + 8
        votes = rec.get("votes") or 0
        L, R, N = rec.get("L") or [0] * 7, rec.get("R") or [0] * 7, rec.get("N") or 0
        if call == "simultaneous":
            agree_votes = L[6] + R[6] + N
            side_votes = agree_votes
        else:
            agree_votes = (L if side == "L" else R)[CALL_IDX[call]]
            side_votes = sum(L if side == "L" else R)
        agree = round(agree_votes * 100 / votes) if votes else None
        side_agree = round(side_votes * 100 / votes) if votes else None
        # 투표가 충분한데 '누구 점수인지'조차 커뮤니티가 크게 다르게 본 클립은 제외 (라벨 오류/과도한 논란 가능성)
        if votes >= 10 and side_agree is not None and side_agree < 35:
            print("skip (side disagreement)", rec["id"], rec["verified"], side_agree, votes)
            continue
        situation, alt = situation_for(side, call, L, R, N, votes)
        level = level_for(agree if agree is not None else 0, side_agree if side_agree is not None else 0, votes, call)
        # 불(램프) 정보: 중급·상급은 양쪽 불이 켜진(공격권 판정이 실제로 필요한) 장면만.
        # 한쪽 불만 켜진 장면은 초급으로, 그중 판정 해석이 갈린 것(일치율 < 60%)은 제외.
        lt = lights.get(f"qr{rec['id']}") or {}
        lights_lr = {"L": lt.get("L"), "R": lt.get("R")} if lt.get("L") and lt.get("R") else None
        two_lights = bool(lights_lr and lights_lr["L"] != "off" and lights_lr["R"] != "off")
        if lights_lr is None:
            if "--candidates" not in sys.argv:
                print("skip (lights unknown)", rec["id"], rec["verified"])
                continue
            # 후보 모드: 불 정보가 없어도 포함 (detect_lights.py 입력용)
            lights_lr = {"L": None, "R": None}
        elif lights_lr["L"] == "off" and lights_lr["R"] == "off":
            print("skip (no lights detected)", rec["id"], rec["verified"])
            continue
        elif not two_lights:
            if (agree or 0) < 60:
                dropped_single += 1
                continue
            level = 1
        out.append({
            "id": f"qr{rec['id']}",
            "weapon": "foil",
            "level": level,
            "lights": lights_lr,
            "video": {"id": vid, "start": t, "end": end},
            "answer": {"side": side, "call": None if side == "S" else call},
            "situation": situation,
            "alt": alt,
            "left": clean_name(rec.get("left")),
            "right": clean_name(rec.get("right")),
            "event": short_event(rec.get("tour")),
            "agree": agree,
            "sideAgree": side_agree,
            "votes": votes,
            "source": f"https://actions.quarte-riposte.com/?id={rec['id']}&results=true",
        })

    # 초급은 동작 종류별로 번갈아 가며 가장 명확한(일치율 높은) 100개만 남기고, 나머지는 중급으로 올림
    EASY_CAP = 100
    easy = [x for x in out if x["level"] == 1]
    groups = {}
    for x in sorted(easy, key=lambda x: (-(x["agree"] or 0), -(x["sideAgree"] or 0), -x["votes"])):
        groups.setdefault(x["answer"]["call"] or "S", []).append(x)
    keep = set()
    while len(keep) < EASY_CAP and any(groups.values()):
        for g in list(groups.values()):
            if g and len(keep) < EASY_CAP:
                keep.add(g.pop(0)["id"])
    for x in easy:
        if x["id"] not in keep or x["answer"]["call"] == "line":  # 린느는 초급에서 제외
            x["level"] = 2
    print("easy kept:", len(keep), "promoted to level 2:", len(easy) - len(keep))

    if "--no-embed-check" not in sys.argv:
        ok_videos = check_embeddable(sorted({x["video"]["id"] for x in out}))
        before = len(out)
        out = [x for x in out if x["video"]["id"] in ok_videos]
        print("removed (video unavailable / not embeddable):", before - len(out))

    out.sort(key=lambda x: (x["level"], -(x["agree"] or 0)))

    lines = []
    lines.append("/* =====================================================")
    lines.append("   퀴즈 문제 데이터 (tools/build_questions.py 로 생성, 직접 수정 가능)")
    lines.append("")
    lines.append("   필드 설명")
    lines.append("   - id       : 고유 ID")
    lines.append("   - weapon   : 'foil' (플러레). 나중에 'epee', 'sabre' 추가")
    lines.append("   - level    : 1 초급 / 2 중급 / 3 상급")
    lines.append("   - video    : { id: 유튜브 영상 ID, start: 시작 초, end: 끝 초 } — 심판 판정 직전에 끝나도록")
    lines.append("   - answer   : { side: 'L' | 'R' | 'S'(시뮬따네·무효), call: 'attack'|'counter'|'riposte'|'remise'|'line'|null }")
    lines.append("   - left/right : 왼쪽/오른쪽 선수 이름, event: 대회명")
    lines.append("   - lights   : 터치 순간 불 { L: 'red'|'white'|'off', R: 'green'|'white'|'off' } — 중급·상급은 양쪽 불 켜진 장면만")
    lines.append("   - situation: 장면 상황 분류 (clean | opp-<call> | same-<call> | opp-simul | any-<call>) — calls.js 의 SITUATIONS 키")
    lines.append("   - alt      : 심판 판정 외에 가장 많았던 해석 { side, call, pct }")
    lines.append("   - agree    : 커뮤니티 투표가 심판 판정(누구+동작)과 일치한 비율(%), sideAgree: '누구 점수인지'만 일치한 비율, votes: 투표 수")
    lines.append("   - note     : (선택) 이 장면만의 추가 해설")
    lines.append("   - source   : 판정 출처 URL")
    lines.append("   ===================================================== */")
    lines.append("")
    lines.append("const QUESTIONS = [")
    for x in out:
        lines.append("  " + json.dumps(x, ensure_ascii=False) + ",")
    lines.append("];")
    lines.append("")
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
    from collections import Counter
    print("written", OUT, len(out), "questions")
    print("levels:", Counter(x["level"] for x in out))
    print("calls:", Counter((x["answer"]["call"] or "simul") for x in out))
    print("dropped single-light with low agreement:", dropped_single)
    print("lights by level:", sorted(Counter((x["level"], "two" if x["lights"]["L"] not in ("off", None) and x["lights"]["R"] not in ("off", None) else ("unknown" if x["lights"]["L"] is None else "single")) for x in out).items()))
    print("situations:", sorted(Counter(((x["answer"]["call"] or "simultaneous"), x["situation"]) for x in out).items()))


if __name__ == "__main__":
    main()
