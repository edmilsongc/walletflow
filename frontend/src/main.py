from flask import Flask, render_template, redirect, request
from dotenv import load_dotenv
import requests
import os

load_dotenv()

BACKEND_URL = os.environ["BACKEND_URL"]

app = Flask(__name__)

def private_page(template):
    cookie = request.headers.get("Cookie")
    headers = {"Cookie": cookie} if cookie else {}
    try:
        response = requests.get(
            f"{BACKEND_URL.rstrip('/')}/api/session",
            headers=headers,
            timeout=5,
        )
    except requests.RequestException:
        app.logger.exception("Não foi possível validar a sessão no backend.")
        return "Serviço de autenticação indisponível.", 503
    if response.status_code != 200:
        return redirect("/login")
    return render_template(template)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/dashboard")
def dashboard():
    return private_page("dashboard.html")

@app.route("/accounts-receivable")
def accounts_receivable():
    return private_page("accounts-receivable.html")

@app.route("/accounts-payable")
def accounts_payable():
    return private_page("accounts-payable.html")

@app.route("/investment-plans")
def investment_plans():
    return private_page("investment-plans.html")

@app.route("/statements")
def statements():
    return private_page("statements.html")

@app.route("/transactions")
def transactions():
    return private_page("transactions.html")

@app.route("/support")
def support():
    return private_page("support.html")

@app.route("/settings")
def settings():
    return private_page("settings.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)