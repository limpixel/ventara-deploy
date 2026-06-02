from flask import Blueprint, request, jsonify, session
import json

history_bp = Blueprint("history_bp", __name__)

# =========================
# TIER LIMITS
# =========================
TIER_LIMITS = {
    "gratis":    100 * 1024,
    "basic":    1 * 1024 * 1024,
    "pro":      10 * 1024 * 1024,
    "business": 100 * 1024 * 1024,
}

def get_username():
    return request.headers.get("X-Username") or session.get("username")

def get_history_usage_bytes(user: dict) -> int:
    return len(json.dumps(user.get("history", [])).encode("utf-8"))


# =========================
# SAVE HISTORY
# =========================
@history_bp.route("/save_history", methods=["POST"])
def save_history():
    from utils.user_helpers import load_user, save_user

    username = get_username()
    if not username:
        return jsonify({"success": False, "message": "Not logged in."}), 401

    user = load_user(username)
    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    data = request.get_json()
    if not data:
        return jsonify({"success": False, "message": "No data provided."}), 400

    tier = user.get("storage_tier", "gratis")
    limit = TIER_LIMITS.get(tier, TIER_LIMITS["gratis"])
    current_usage = get_history_usage_bytes(user)
    new_entry_size = len(json.dumps(data).encode("utf-8"))

    if current_usage + new_entry_size > limit:
        return jsonify({
            "success": False,
            "message": "Storage penuh. Upgrade tier untuk menyimpan lebih banyak.",
            "storage_full": True,
            "tier": tier,
            "usage": current_usage,
            "limit": limit,
        }), 403

    if "history" not in user:
        user["history"] = []

    user["history"].insert(0, data)
    save_user(user)

    return jsonify({"success": True, "message": "History saved"})


# =========================
# GET HISTORY
# =========================
@history_bp.route("/get_history", methods=["GET"])
def get_history():
    from utils.user_helpers import load_user

    username = get_username()

    if not username:
        return jsonify([]), 401

    user = load_user(username)

    if not user:
        return jsonify([]), 404

    history = user.get("history", [])

    result = []

    for item in history:
        if isinstance(item, dict) and "entry" in item:
            result.append(item["entry"])
        else:
            result.append(item)

    return jsonify(result)


# =========================
# STORAGE INFO
# =========================
@history_bp.route("/storage_info", methods=["GET"])
def storage_info():
    from utils.user_helpers import load_user

    username = get_username()

    print("USERNAME =", username)

    if not username:
        return jsonify({"success": False}), 401

    user = load_user(username)

    print("USER =", user)

    if not user:
        return jsonify({"success": False}), 404

    tier = user.get("storage_tier", "gratis")
    limit = TIER_LIMITS.get(tier, TIER_LIMITS["gratis"])
    usage = get_history_usage_bytes(user)

    print("HISTORY COUNT =", len(user.get("history", [])))
    print("USAGE =", usage)

    return jsonify({
        "success": True,
        "tier": tier,
        "usage": usage,
        "limit": limit,
        "usage_mb": round(usage / 1024 / 1024, 4),
        "limit_mb": round(limit / 1024 / 1024, 2),
        "percent": round((usage / limit) * 100, 4),
    })


# =========================
# UPGRADE TIER
# =========================
@history_bp.route("/upgrade_tier", methods=["POST"])
def upgrade_tier():
    from utils.user_helpers import load_user, save_user

    username = get_username()
    if not username:
        return jsonify({"success": False}), 401

    data = request.get_json()
    new_tier = data.get("tier")

    if new_tier not in TIER_LIMITS:
        return jsonify({"success": False, "message": "Tier tidak valid."}), 400

    user = load_user(username)
    if not user:
        return jsonify({"success": False}), 404

    user["storage_tier"] = new_tier
    save_user(user)

    return jsonify({
        "success": True,
        "tier": new_tier,
        "limit_mb": round(TIER_LIMITS[new_tier] / 1024 / 1024, 2),
    })


# =========================
# DELETE HISTORY
# =========================
@history_bp.route("/delete_history", methods=["DELETE"])
def delete_history():
    from utils.user_helpers import load_user, save_user

    username = get_username()
    if not username:
        return jsonify({"success": False}), 401

    entry_id = request.args.get("id")
    if not entry_id:
        return jsonify({"success": False, "message": "ID required."}), 400

    user = load_user(username)
    if not user:
        return jsonify({"success": False}), 404

    user["history"] = [
        h for h in user.get("history", [])
        if str(h.get("id")) != str(entry_id)
    ]
    save_user(user)

    return jsonify({"success": True})