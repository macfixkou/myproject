#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse
import mimetypes

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="/home/user/webapp", **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        # 基本的な静的ファイル配信
        if self.path == '/':
            self.path = '/index.html'
        
        return super().do_GET()

PORT = 9500
Handler = MyHTTPRequestHandler

print(f"Starting server on port {PORT}...")
print(f"Server directory: /home/user/webapp")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server running at http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        httpd.shutdown()