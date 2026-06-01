from threading import Lock

# =========================
# GENERATE PROGRESS
# =========================
generate_progress = {}

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