from flask import Blueprint, session, jsonify, request
from src.database.connection import get_connection
import bcrypt
import re

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

PASSWORD_REGEX = re.compile(r"^(?=.*[^a-zA-Z0-9\s])[\s\S]{9,}$")


@auth_bp.route("/register", methods=["POST"])
def api_register():
    data = request.get_json(silent=True) or {}

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all(isinstance(value, str) and value.strip() for value in (name, email, password)):
        return jsonify({"message": "invalid_data"}), 400

    # Mantém a mesma política aplicada pelo formulário: 9+ caracteres e
    # pelo menos um caractere especial que não seja espaço.
    if not PASSWORD_REGEX.fullmatch(password):
        return jsonify({"message": "invalid_password"}), 400

    hashed_password = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "insert into users (name, email, password) values (%s, %s, %s)",
            (name.strip(), email.strip(), hashed_password)
        )
        conn.commit()
    except Exception:
        conn.rollback()
        # Não expõe detalhes internos do banco ou se um endereço já está cadastrado.
        return jsonify({"message": "registration_failed"}), 400
    finally:
        cursor.close()
        conn.close()

    return jsonify({"message": "success"}), 201


@auth_bp.route("/login", methods=["POST"])
def api_login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")

    if not isinstance(email, str) or not isinstance(password, str):
        return jsonify({"message": "invalid_credentials"}), 401

    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("select * from users where email = %s", (email.strip(),))
        user = cursor.fetchone()
    finally:
        cursor.close()
        conn.close()

    # A mesma resposta é usada quando o e-mail não existe ou a senha falha.
    if user is None:
        return jsonify({"message": "invalid_credentials"}), 401

    hashed_password = user[3]
    if bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8")):
        session["user_id"] = user[0]
        return jsonify({"message": "success"}), 200

    return jsonify({"message": "invalid_credentials"}), 401


@auth_bp.route("/session", methods=["GET"])
def session_status():
    user_id = session.get("user_id")

    if user_id is None:
        return jsonify({"authenticated": False}), 401

    return jsonify({
        "authenticated": True,
        "user_id": user_id
    }), 200
