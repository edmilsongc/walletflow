from dotenv import load_dotenv
from psycopg import connect
import os

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

def get_connection():
    postgres_host = os.getenv('POSTGRES_HOST')
    if postgres_host:
        return connect(
            host=postgres_host,
            port=int(os.getenv('POSTGRES_PORT', '5432')),
            dbname=os.environ['POSTGRES_DB'],
            user=os.environ['POSTGRES_USER'],
            password=os.environ['POSTGRES_PASSWORD'],
        )
    return connect(DATABASE_URL)