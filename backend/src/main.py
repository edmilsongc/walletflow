from flask import Flask
from src.routes.auth import auth_bp
from src.routes.dataUser import dataUser_bp
from src.routes.accountsReceivable import accountsReceivable_bp
from src.routes.accountsPayable import accountsPayable_bp
from src.routes.exports import exports_bp

from dotenv import load_dotenv
from flask_cors import CORS
import os

load_dotenv()

SECRET_KEY = os.environ['SECRET_KEY']
FRONTEND_URL = os.environ['FRONTEND_URL']

app = Flask(__name__)

app.secret_key = SECRET_KEY

CORS(
    app,
    supports_credentials=True,
    origins=[FRONTEND_URL]
)

app.register_blueprint(auth_bp)
app.register_blueprint(dataUser_bp)
app.register_blueprint(accountsReceivable_bp)
app.register_blueprint(accountsPayable_bp)
app.register_blueprint(exports_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)