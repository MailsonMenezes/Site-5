from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

# Import routes
from routes.auth_routes import router as auth_router
from routes.cart_routes import router as cart_router
from routes.order_routes import router as order_router
from routes.utils_routes import router as utils_router

# Import database initialization
from database import init_database, client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(
    title="MX3 Network API",
    description="API para e-commerce MX3 Network",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint
@api_router.get("/")
async def root():
    return {
        "message": "MX3 Network API", 
        "status": "online",
        "version": "1.0.0"
    }

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mx3network-api"}

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(cart_router)
api_router.include_router(order_router)
api_router.include_router(utils_router)

# Include the main router in the app
app.include_router(api_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_database()
    logger.info("Database initialized successfully")

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on shutdown"""
    client.close()
    logger.info("Database connection closed")
