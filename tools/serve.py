#!/usr/bin/env python3
# The project's dev server: python's own http.server on the project root, plus one header, Cache-Control: no-store.
# The plain server sends no caching headers, so Safari kept page scripts it judged still fresh and ran them after a
# reload: on 17 Oct 2026 Sam's refresh fetched the page and two scripts and took interior.js, where the fix was, from its
# cache. With no-store every reload gets the files as they are on disk.
#   python3 tools/serve.py          (port 8611)
#   python3 tools/serve.py 8612
import functools
import http.server
import os
import sys


class NoStore(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8611
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
handler = functools.partial(NoStore, directory=root)
print('serving ' + root + ' on http://127.0.0.1:' + str(port), flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1', port), handler).serve_forever()
