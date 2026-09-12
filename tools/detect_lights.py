"""
각 문제의 터치 순간 전후 영상을 유튜브에서 짧게(5초) 받아, FIE 중계 그래픽의 '불' 표시를 읽어
양쪽 불(L/R)이 켜졌는지 판정합니다.  값: 'red' | 'green' | 'white' | 'off'

왜 영상 구간이 필요한가: 출처 사이트의 썸네일은 '첫 번째 불이 켜진 순간' 프레임이라
0.3초 뒤에 켜지는 두 번째 불이 안 보이는 경우가 많습니다. 그래서 터치 전후 몇 초를 훑어 최대치를 취합니다.

FIE 표준 하단 바(640x360 프레임 기준):
  - 시간 박스 흰색 하단: y=324~325, x=300~340  (이게 흰색이면 FIE 오버레이로 판단)
  - 이름 밑줄(불 표시): y=328~333, 왼쪽 x=90~280 / 오른쪽 x=370~560
    켜진 빨강 ≈ (246, 70, 95), 켜진 초록 ≈ (74, 247, 99), 흰 불 ≈ 밝은 흰색, 꺼짐 = 뒤 영상이 비침

사용법:
  python tools/detect_lights.py js/questions.js tools/lights.json [동시 다운로드 수]
필요: pip install yt-dlp imageio-ffmpeg pillow numpy
"""
import json, os, re, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor, as_completed

import numpy as np
from PIL import Image

QFILE, OUT = sys.argv[1], sys.argv[2]
WORKERS = int(sys.argv[3]) if len(sys.argv) > 3 else 3
CACHE = os.path.join(tempfile.gettempdir(), "fencing_quiz_segments")
os.makedirs(CACHE, exist_ok=True)

try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG = "ffmpeg"


def load_questions(path):
    s = open(path, encoding="utf-8").read()
    return [json.loads(l.strip().rstrip(",")) for l in s.splitlines() if l.strip().startswith("{")]


def classify_strip(px):
    m = px.reshape(-1, 3).mean(axis=0)
    sd = px.reshape(-1, 3).std(axis=0).mean()
    r, g, b = m
    if r > 195 and g < 120 and 50 < b < 150 and sd < 60:
        return "red"
    if g > 190 and r < 130 and b < 150 and sd < 60:
        return "green"
    if r > 200 and g > 200 and b > 200 and sd < 40:
        return "white"
    return "off"


def detect_frame(path):
    im = Image.open(path).convert("RGB")
    if im.size != (640, 360):
        im = im.resize((640, 360))
    a = np.asarray(im).astype(int)
    timebox = a[324:326, 300:340].reshape(-1, 3).mean(axis=0)
    digits = a[312:324, 300:342]  # 시간 숫자 부분: 흰 바탕(>50%) + 검은 숫자(10~45%)
    dark = (digits.max(axis=2) < 110).mean()
    white = (digits.min(axis=2) > 200).mean()
    if (timebox > 225).all() and white > 0.35 and 0.10 < dark < 0.45:
        return classify_strip(a[328:334, 90:280]), classify_strip(a[328:334, 370:560])
    # 다른 오버레이(박스형: 이름 박스 테두리가 빨강/초록으로 켜짐, 2018 우시·상하이 일부 경기)
    # 왼쪽 박스 y≈284~310, x≈62~280 / 오른쪽 박스 x≈362~578. 테두리 픽셀 수로 판정.
    def count(region, kind):
        r, g, b = region[..., 0], region[..., 1], region[..., 2]
        if kind == "red":
            return int(((r > 180) & (g < 140) & (b < 130) & (r > g + 80)).sum())
        if kind == "green":
            return int(((g > 160) & (r < 130) & (g > r + 80)).sum())
        return int(((r > 225) & (g > 225) & (b > 225)).sum())
    lbox, rbox = a[278:318, 60:282], a[278:318, 360:580]
    # 박스형 오버레이인지 확인: 시간 박스(x 300~345)가 파란 계열
    tb = a[288:306, 302:342].reshape(-1, 3).mean(axis=0)
    if not (tb[2] > tb[0] + 30):
        return None
    L = "red" if count(lbox, "red") > 120 else ("white" if count(lbox, "white") > 500 else "off")
    R = "green" if count(rbox, "green") > 120 else ("white" if count(rbox, "white") > 500 else "off")
    return L, R


def fetch_segment(vid, end):
    """터치 전후 [end-2, end+3] 구간 mp4 (360p) 를 캐시 폴더에 저장"""
    out = os.path.join(CACHE, f"{vid}_{end}.mp4")
    if os.path.exists(out) and os.path.getsize(out) > 20000:
        return out
    cmd = [sys.executable, "-m", "yt_dlp", "--quiet", "--no-warnings", "--ffmpeg-location", FFMPEG,
           "-f", "134/bv*[height<=360][protocol=https][ext=mp4]/bv*[height<=480][protocol=https]",
           "--download-sections", f"*{max(0, end - 2)}-{end + 3}", "-o", out,
           f"https://www.youtube.com/watch?v={vid}"]
    try:
        subprocess.run(cmd, capture_output=True, text=True, timeout=240)
    except subprocess.TimeoutExpired:
        return None
    return out if os.path.exists(out) and os.path.getsize(out) > 20000 else None


def analyze(q):
    vid, end = q["video"]["id"], q["video"]["end"]
    seg = fetch_segment(vid, end)
    if not seg:
        return q["id"], {"error": "download failed"}
    fdir = tempfile.mkdtemp(prefix="frames_")
    subprocess.run([FFMPEG, "-hide_banner", "-loglevel", "error", "-i", seg, "-vf", "fps=5,scale=640:360",
                    os.path.join(fdir, "f_%03d.png")], capture_output=True, timeout=120)
    frames = sorted(f for f in os.listdir(fdir) if f.endswith(".png"))
    seq = []
    for f in frames:
        seq.append(detect_frame(os.path.join(fdir, f)))
    for f in frames:
        os.remove(os.path.join(fdir, f))
    os.rmdir(fdir)
    seq_txt = [x[0] + "/" + x[1] if x else "-" for x in seq]
    L, R = aggregate(seq_txt)
    return q["id"], {"L": L, "R": R, "frames": len(seq), "fieFrames": sum(1 for s in seq if s), "seq": seq_txt}


def aggregate(seq_txt, min_frames=5):
    """프레임별 'L/R' 문자열 목록 → 5프레임(1초) 이상 나타난 상태만 인정하고 가장 강한 상태를 택함
    (한 프레임짜리 흰색 오검출 등을 걸러냄)"""
    from collections import Counter
    rank = {"off": 0, "white": 1, "green": 2, "red": 2}
    cl, cr = Counter(), Counter()
    for t in seq_txt:
        if t == "-":
            continue
        l, r = t.split("/")
        cl[l] += 1
        cr[r] += 1
    if not cl:
        return None, None
    pick = lambda c: max((k for k, n in c.items() if n >= min_frames or k == "off"), key=lambda k: rank[k], default="off")
    return pick(cl), pick(cr)


def main():
    qs = load_questions(QFILE)
    try:
        res = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        res = {}
    # 이미 분석된 항목은 저장된 프레임 시퀀스로 다시 집계 (규칙이 바뀌어도 재다운로드 불필요)
    for v in res.values():
        if v.get("seq"):
            v["L"], v["R"] = aggregate(v["seq"])
    todo = [q for q in qs if q["id"] not in res or res[q["id"]].get("error") or res[q["id"]].get("L") is None]
    print(f"{len(todo)} to analyze ({len(qs)} total)", flush=True)
    with ThreadPoolExecutor(max_workers=WORKERS) as ex:
        futs = {ex.submit(analyze, q): q for q in todo}
        for i, f in enumerate(as_completed(futs), 1):
            try:
                qid, r = f.result()
            except Exception as e:  # 한 항목 실패가 전체를 멈추지 않도록
                qid, r = futs[f]["id"], {"error": str(e)[:200]}
            res[qid] = r
            print(i, qid, r.get("L"), r.get("R"), r.get("error", ""), flush=True)
            if i % 5 == 0:
                json.dump(res, open(OUT, "w", encoding="utf-8"), indent=1)
    json.dump(res, open(OUT, "w", encoding="utf-8"), indent=1)
    from collections import Counter
    print(Counter((v.get("L"), v.get("R")) for v in res.values()), flush=True)


if __name__ == "__main__":
    main()
