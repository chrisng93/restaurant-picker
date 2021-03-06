"""
    Flask extensions
"""
from flask_sqlalchemy import SQLAlchemy
from flask_redis import FlaskRedis

db = SQLAlchemy()
redis_store = FlaskRedis()
