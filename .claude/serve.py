"""Local dev server with no-cache headers — 等 preview 即時 reflect 改動."""
import http.server
import socketserver
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    with socketserver.TCPServer(("", port), NoCacheHandler) as httpd:
        httpd.allow_reuse_address = True
        print(f"Serving on http://localhost:{port}/ (no-cache)")
        httpd.serve_forever()
