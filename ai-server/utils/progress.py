from threading import Lock

# =========================
# GENERATE PROGRESS
# =========================
generate_progress = {
    "running": False,
    "day": 0,
    "total": 7,
    "mode": "",
    "start_time": 0.0,
    "done": False,
    "nlp_report": None,
    "error": None,
    "last_mode": "general"
}

# =========================
# TRAIN PROGRESS
# =========================
train_progress = {
    "running": False,
    "step": "",
    "done": False,
    "error": None,
    "log": []
}

progress_lock = Lock()

train_lock = Lock()