from flask import Blueprint, request, jsonify
import json
import os
from utils.recaptcha import verify_recaptcha

auth_bp = Blueprint("auth_bp", __name__)

USERS_FILE = "users.json"

# Default admin hardcoded
DEFAULT_USERS = [
    {
        "username": "admin",
        "password": "admin123",
        "role": "admin",
        "name": "Administrator"
    }
]

def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, "r") as f:
            return json.load(f)
    # Kalau belum ada, bikin file dengan default admin
    with open(USERS_FILE, "w") as f:
        json.dump(DEFAULT_USERS, f, indent=2)
    return DEFAULT_USERS

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f, indent=2)


# =========================
# REGISTER
# =========================
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    name = data.get("name", username).strip()

    if not username or not email or not password:
        return jsonify({"success": False, "message": "All fields are required."}), 400

    users = load_users()

    # Cek username sudah ada
    if any(u["username"] == username for u in users):
        return jsonify({"success": False, "message": "Username already taken."}), 400

    # Cek email sudah ada
    if any(u.get("email") == email for u in users):
        return jsonify({"success": False, "message": "Email already registered."}), 400

    new_user = {
        "username": username,
        "email": email,
        "password": password,
        "role": "user",
        "name": name
    }

    users.append(new_user)
    save_users(users)

    return jsonify({"success": True, "message": f"Welcome {name}!"})


# =========================
# LOGIN
# =========================
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    print("DATA MASUK:", data)

    token = data.get("token")

    print("TOKEN:", token)

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not verify_recaptcha(token):
        print("CAPTCHA GAGAL")

        return jsonify({
            "success": False,
            "message": "Captcha verification failed."
        }), 400

    print("CAPTCHA BERHASIL")

    users = load_users()

    found = next(
        (
            u for u in users
            if u["username"] == username
            and u["password"] == password
        ),
        None
    )

    if not found:
        return jsonify({
            "success": False,
            "message": "Wrong username or password."
        }), 401

    return jsonify({
        "success": True,
        "role": found["role"],
        "name": found["name"],
        "username": found["username"],
        "email": found.get("email", "")
    })
    
# =========================
# UPDATE PROFILE
# =========================
@auth_bp.route("/update_profile", methods=["POST"])
def update_profile():
    data = request.get_json()
    token = data.get("token")
    username = data.get("username", "").strip()
    new_name = data.get("name", "").strip()
    new_email = data.get("email", "").strip()
    
    if not verify_recaptcha(token):
        return jsonify({
            "success": False,
            "message": "Captcha verification failed."
        }), 400

    if not username:
        return jsonify({"success": False, "message": "Username required."}), 400

    users = load_users()

    user = next((u for u in users if u["username"] == username), None)

    if not user:
        return jsonify({"success": False, "message": "User not found."}), 404

    # Cek email sudah dipakai user lain
    if new_email and any(u.get("email") == new_email and u["username"] != username for u in users):
        return jsonify({"success": False, "message": "Email already used."}), 400

    if new_name:
        user["name"] = new_name
    if new_email:
        user["email"] = new_email

    save_users(users)

    return jsonify({
        "success": True,
        "name": user["name"],
        "email": user.get("email", ""),
    })
    
    # =========================
# GET USERS
# =========================
@auth_bp.route("/users", methods=["GET"])
def get_users():

    users = load_users()

    return jsonify(users)