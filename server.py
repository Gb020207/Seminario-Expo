import http.server
import socketserver
import webbrowser
from threading import Timer

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

def open_browser():
    webbrowser.open(f"http://localhost:{PORT}")

if __name__ == "__main__":
    Timer(1, open_browser).start()
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Servidor corriendo en http://localhost:{PORT}")
        print("Presiona Ctrl+C para apagarlo.")
        httpd.serve_forever()