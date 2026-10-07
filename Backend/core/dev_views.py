"""Browser-based robot-pairing simulator, for testing before real hardware exists.

Nothing here is reachable unless settings.DEBUG is True (see urls.py) - this
must never be wired up in a deployed build. It exists so a human with a phone
can stand in for the robot's camera + firmware: scanning the QR opens this
page instead of talking straight to /api/device/pair/, and the page does that
call itself, with the device_key visible on screen instead of flashed into
silicon. Delete this file once real robot hardware is available and testing
moves onto it instead.
"""

from django.conf import settings
from django.http import Http404, HttpResponse

from .models import Robot
from .services.device import build_pair_payload, encode_pair_payload, PairPayloadError

_PAGE = """<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pair simulator - {robot_id}</title>
<style>
  body {{ font-family: system-ui, sans-serif; max-width: 480px; margin: 32px auto; padding: 0 16px; color: #1C1C1E; }}
  .card {{ border: 1px solid #ddd; border-radius: 12px; padding: 20px; }}
  .row {{ display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee; font-size: 14px; }}
  .row span:first-child {{ color: #888; }}
  button {{ width: 100%; margin-top: 20px; padding: 12px; border: none; border-radius: 10px; background: #059669; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; }}
  button:disabled {{ background: #9CA3AF; }}
  pre {{ background: #f5f5f5; border-radius: 8px; padding: 12px; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; }}
  .warn {{ font-size: 12px; color: #B45309; background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 8px; padding: 10px; margin-bottom: 16px; }}
  .ok {{ color: #059669; }}
  .err {{ color: #DC2626; }}
</style>
</head>
<body>
  <div class="warn">Dev-only tool. This page stands in for a real robot's camera + firmware, so you can test pairing before hardware exists. Never used by the real app.</div>
  <div class="card">
    <div class="row"><span>Robot</span><span>{robot_id}</span></div>
    <div class="row"><span>Currently assigned to</span><span>{farmer_name}</span></div>
    <div class="row"><span>Status</span><span>{status}</span></div>
    <button id="go">Simulate robot scan &amp; pair</button>
    <pre id="out" style="display:none"></pre>
  </div>
<script>
const btn = document.getElementById('go');
const out = document.getElementById('out');
btn.addEventListener('click', async () => {{
  btn.disabled = true;
  btn.textContent = 'Pairing...';
  out.style.display = 'block';
  out.textContent = 'Sending payload as the robot would...';
  try {{
    const res = await fetch('/api/device/pair/', {{
      method: 'POST',
      headers: {{
        'Content-Type': 'application/json',
        'Authorization': 'Device {device_key}',
      }},
      body: JSON.stringify({{ payload: {qr_payload_js} }}),
    }});
    const body = await res.json();
    out.className = res.ok ? 'ok' : 'err';
    out.textContent = (res.ok ? 'Paired.\\n\\n' : ('HTTP ' + res.status + '\\n\\n')) + JSON.stringify(body, null, 2);
    btn.textContent = res.ok ? 'Paired' : 'Try again';
    btn.disabled = res.ok;
  }} catch (e) {{
    out.className = 'err';
    out.textContent = 'Request failed: ' + e;
    btn.disabled = false;
    btn.textContent = 'Simulate robot scan & pair';
  }}
}});
</script>
</body>
</html>
"""


def pair_demo(request, robot_id):
    if not settings.DEBUG:
        raise Http404

    robot = Robot.objects.filter(id=robot_id).first()
    if robot is None:
        return HttpResponse(f"No robot '{robot_id}'.", status=404)

    if not (robot.farmer or "").strip():
        return HttpResponse(
            f"{robot_id} has no farmer assigned yet - assign one in the admin "
            "dashboard first.",
            status=400,
        )

    try:
        payload = build_pair_payload(robot, _farmer_id_for(robot))
    except PairPayloadError as exc:
        return HttpResponse(str(exc), status=400)

    qr_payload = encode_pair_payload(payload)

    html = _PAGE.format(
        robot_id=robot.id,
        farmer_name=robot.farmer,
        status=robot.status,
        device_key=robot.device_key,
        qr_payload_js=_js_string(qr_payload),
    )
    return HttpResponse(html)


def _js_string(value):
    import json

    return json.dumps(value)


def _farmer_id_for(robot):
    from .models import Farmer

    farmer = Farmer.objects.filter(full_name=robot.farmer).first()
    if farmer is None:
        raise PairPayloadError(f"No customer record found for '{robot.farmer}'.")
    return farmer.id
