import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from app.config import settings

logger = logging.getLogger("uvicorn")

class Database:
    client: AsyncIOMotorClient = None
    db = None

db = Database()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=8000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            maxPoolSize=10,
            minPoolSize=1,
            waitQueueTimeoutMS=5000
        )
        db.db = db.client[settings.DATABASE_NAME]
        
        try:
            # Warm-up: ping to establish connection early
            await db.db.command("ping")
            logger.info(f"Connected to MongoDB database: {settings.DATABASE_NAME}")
        except Exception as ping_err:
            logger.error(f"Failed to ping MongoDB Atlas, but client is created: {ping_err}")
            
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB Atlas: {e}")


async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("Closed MongoDB connection.")
