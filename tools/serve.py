"""
로컬 개발용 정적 서버. PORT 환경변수가 있으면 그 포트, 없으면 8765 를 씁니다.
  python tools/serve.py
"""
import functools
import http.server
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("PORT", "8765"))

handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), handler) as httpd:
    print(f"Serving {ROOT} at http://127.0.0.1:{PORT}", flush=True)
    httpd.serve_forever()
