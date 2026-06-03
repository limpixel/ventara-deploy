import json
import os
from datetime import datetime, timezone

COUNTER_FILE = "login_count.json"

def _today() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")

def get_login_count() -> int:
    if not os.path.exists(COUNTER_FILE):
        return 0
    with open(COUNTER_FILE) as f:
        data = json.load(f)
    if data.get("date") == _today():
        return data.get("count", 0)
    return 0

def increment_login_count() -> int:
    today = _today()
    count = 1
    if os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE) as f:
            data = json.load(f)
        if data.get("date") == today:
            count = data.get("count", 0) + 1
    with open(COUNTER_FILE, "w") as f:
        json.dump({"date": today, "count": count}, f)
    return count
