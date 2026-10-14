# ===== Blender Bridge - step 1 of 2 =====
# HOW TO USE:
#   1. In Blender, open the "Scripting" tab (top of the window).
#   2. Click "New" in the Text Editor toolbar.
#   3. Paste this whole file into the text box.
#   4. Click the triangle "Run Script" button.
#   5. The text box will switch to a message "BRIDGE IS RUNNING" -> good, leave Blender open.
# It opens a tiny local web server on port 9876 that lets an assistant run Python in Blender.
import bpy, json, threading, queue, traceback, io, contextlib
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = 9876
_cmds = queue.Queue()

# ---------- part 1: web server (runs in background threads) ----------
class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def _send(self, obj, code=200):
        body = json.dumps(obj, default=str).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._send({"status": "success", "result": {"bridge": "alive", "blender": bpy.app.version_string}})

    def do_POST(self):
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n)
        try:
            cmd = json.loads(raw.decode("utf-8"))
        except Exception:
            return self._send({"status": "error", "message": "bad json"}, 400)
        slot = queue.Queue()
        _cmds.put((cmd, slot))
        try:
            reply = slot.get(timeout=1800)
        except queue.Empty:
            reply = {"status": "error", "message": "timeout while Blender was busy"}
        self._send(reply)

    def log_message(self, *args):
        pass

def _serve():
    try:
        srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    except OSError as e:
        print("BRIDGE ERROR: cannot listen on port %d - %s" % (PORT, e))
        return
    srv.daemon_threads = True
    print("BRIDGE READY on 127.0.0.1:%d" % PORT)
    srv.serve_forever()

# ---------- part 2: command execution (must run on Blender's main thread) ----------
def _run():
    while True:
        try:
            cmd, slot = _cmds.get_nowait()
        except queue.Empty:
            break
        try:
            ctype = cmd.get("type", "")
            params = cmd.get("params") or {}
            if ctype == "ping":
                slot.put({"status": "success", "result": {"pong": True}})
                continue
            if ctype in ("get_blender_info", "get_addon_info"):
                slot.put({"status": "success", "result": {"blender_version": bpy.app.version_string, "bridge_port": PORT}})
                continue
            if ctype == "get_scene_info":
                sc = bpy.context.scene
                objs = [{"name": o.name, "type": o.type} for o in sc.objects]
                slot.put({"status": "success", "result": {"scene": sc.name, "object_count": len(objs), "objects": objs,
                                                          "frame": sc.frame_current, "frame_range": [sc.frame_start, sc.frame_end]}})
                continue
            if ctype == "execute_code":
                ns = {"bpy": bpy, "math": __import__("math"), "random": __import__("random"),
                      "time": __import__("time"), "json": json}
                for _mod in ("bmesh", "mathutils"):
                    try:
                        ns[_mod] = __import__(_mod)
                    except Exception:
                        pass
                buf = io.StringIO()
                with contextlib.redirect_stdout(buf):
                    exec(params.get("code", ""), ns)
                slot.put({"status": "success", "result": {"executed": True, "stdout": buf.getvalue(),
                                                          "result": ns.get("result")}})
                continue
            slot.put({"status": "error", "message": "unknown command type: %r" % (ctype,)})
        except Exception:
            slot.put({"status": "error", "message": traceback.format_exc()})
    return 0.1

if not bpy.app.timers.is_registered(_run):
    bpy.app.timers.register(_run, first_interval=0.1, persistent=True)
threading.Thread(target=_serve, daemon=True).start()

# ---------- part 3: show a clear message inside Blender ----------
_msg = ("BRIDGE IS RUNNING - port %d\n\n"
        "Step 2 is in Terminal (Spotlight -> Terminal):\n"
        "    ssh -R 80:localhost:9876 nokey@localhost.run\n\n"
        "Terminal will print a link like https://something.lhr.life\n"
        "Send that link to the assistant.\n\n"
        "Keep Blender open. If you close it, paste this script again and press Run Script.\n") % PORT
try:
    _block = bpy.data.texts.get("Bridge Status") or bpy.data.texts.new("Bridge Status")
    _block.clear()
    _block.write(_msg)
    _sd = bpy.context.space_data
    if _sd is not None and _sd.type == "TEXT_EDITOR":
        _sd.text = _block
except Exception:
    pass
print("BRIDGE: script finished running.")
