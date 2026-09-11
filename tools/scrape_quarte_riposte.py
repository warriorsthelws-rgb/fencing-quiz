"""
Quarte-Riposte Actions (https://actions.quarte-riposte.com/) 에서 '검증된(verified)' 판정이 붙은
동작을 무작위 id 로 수집해 JSON 으로 저장합니다. (심판 판정 + 유튜브 영상/시각 + 커뮤니티 투표)

사용법:
  python tools/scrape_quarte_riposte.py tools/qr_actions.json 1 12500 300 4
  (출력 JSON, id 최소, id 최대, 시도할 id 개수, 동시 요청 수)
  이미 있는 id 는 건너뛰므로 여러 번 실행해 누적할 수 있습니다.
  이후: python tools/build_questions.py tools/qr_actions.json

참고: /?id=N&results=true 는 3~5초, 검증된 비율은 약 17%. '/?onlyverified=on' 랜덤 페이지는 매우 느리니 쓰지 않습니다.
"""
import json, re, sys, random, html, time, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE = "https://actions.quarte-riposte.com"
OUT = sys.argv[1]
LO, HI, N = int(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4])
WORKERS = int(sys.argv[5]) if len(sys.argv) > 5 else 4

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (fencing-quiz research)"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8", "replace")

def text(h):
    h = re.sub(r"<script.*?</script>", " ", h, flags=re.S)
    h = re.sub(r"<style.*?</style>", " ", h, flags=re.S)
    t = re.sub(r"<[^>]+>", " ", h)
    return re.sub(r"\s+", " ", html.unescape(t))

def parse(aid, h):
    t = text(h)
    ver = re.search(r"verified as:\s*(.+?)\s+Votes so far", t)
    if not ver:
        return None
    yt = re.search(r'href="(https://www\.youtube\.com/watch\?v=[\w-]+&(?:amp;)?t=\d+)"', h)
    tour = re.search(r'<h5 class="text-muted">(.*?)</h5>', h, re.S)
    src = re.search(r'<source src="([^"]+)"', h)
    names = re.search(r"([A-Z][A-Za-z' \-]+, [A-Za-z' \-]+?) Slow ([A-Z][A-Za-z' \-]+, [A-Za-z' \-]+?) (Vote|Call|Verified|This)", t)
    votes = re.search(r"Votes so far \((\d+)\)", t)
    pat = r"Attack : (\d+) \d+% Counter attack : (\d+) \d+% Riposte : (\d+) \d+% Remise : (\d+) \d+% Line : (\d+) \d+% Unknown / other : (\d+) \d+% Simultaneous : (\d+)"
    L = re.search(r"Left " + pat, t)
    R = re.search(r"Right " + pat, t)
    Nn = re.search(r"Neither Simultaneous : (\d+)", t)
    cards = re.search(r"Card Left: (\d+) \d+% Card Right: (\d+)", t)
    return {
        "id": aid,
        "yt": html.unescape(yt.group(1)) if yt else None,
        "tour": html.unescape(tour.group(1).strip()) if tour else None,
        "src": src.group(1) if src else None,
        "left": names.group(1).strip() if names else None,
        "right": names.group(2).strip() if names else None,
        "verified": ver.group(1).strip(),
        "votes": int(votes.group(1)) if votes else None,
        "L": [int(x) for x in L.groups()] if L else None,
        "R": [int(x) for x in R.groups()] if R else None,
        "N": int(Nn.group(1)) if Nn else None,
        "cards": [int(x) for x in cards.groups()] if cards else None,
    }

def work(aid):
    try:
        h = get(f"{BASE}/?id={aid}&results=true")
        return aid, parse(str(aid), h), None
    except Exception as e:
        return aid, None, str(e)

try:
    data = json.load(open(OUT, encoding="utf-8"))
except Exception:
    data = {}

ids = random.sample(range(LO, HI + 1), N)
ids = [i for i in ids if str(i) not in data]
done = 0
with ThreadPoolExecutor(max_workers=WORKERS) as ex:
    futs = [ex.submit(work, i) for i in ids]
    for f in as_completed(futs):
        aid, rec, err = f.result()
        done += 1
        if err:
            print(aid, "ERR", err, flush=True)
        elif rec:
            data[str(aid)] = rec
            print(aid, "OK", rec["verified"], rec["yt"], rec["left"], "vs", rec["right"], rec["votes"], flush=True)
        else:
            print(aid, "unverified", flush=True)
        if done % 5 == 0:
            json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
json.dump(data, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("TOTAL verified:", len(data), flush=True)
