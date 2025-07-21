from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'mx3network_db')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Collections
users_collection = db.users
orders_collection = db.orders
carts_collection = db.carts

async def init_database():
    """Initialize database indexes"""
    # Create indexes for better performance
    await users_collection.create_index("email", unique=True)
    await users_collection.create_index("cpf", unique=True)
    await orders_collection.create_index("user_id")
    await orders_collection.create_index("created_at")
    await carts_collection.create_index("user_id", unique=True)