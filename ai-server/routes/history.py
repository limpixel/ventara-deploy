from flask import Blueprint, request, jsonify
import json
import os

history_bp = Blueprint(
    "history_bp",
    __name__
)

HISTORY_FILE = "history_data.json"


# =========================
# SAVE HISTORY
# =========================
@history_bp.route(
    "/save_history",
    methods=["POST"]
)
def save_history():

    data = request.get_json()

    # ambil data lama
    if os.path.exists(HISTORY_FILE):

        with open(HISTORY_FILE, "r") as f:
            histories = json.load(f)

    else:
        histories = []

    # tambah data baru paling depan
    histories.insert(0, data)

    # save ulang
    with open(HISTORY_FILE, "w") as f:
        json.dump(histories, f, indent=2)

    return jsonify({
        "success": True,
        "message": "History saved"
    })


# =========================
# GET HISTORY
# =========================
@history_bp.route(
    "/get_history",
    methods=["GET"]
)
def get_history():

    if os.path.exists(HISTORY_FILE):

        with open(HISTORY_FILE, "r") as f:
            histories = json.load(f)

    else:
        histories = []

    return jsonify(histories)