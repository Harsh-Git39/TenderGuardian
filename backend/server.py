from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
import asyncio

from encryption_utils import encrypt_file_content, generate_sha3_512_hash, generate_sha256_hash
from emergentintegrations.llm.chat import LlmChat, UserMessage
from automation import AutomationEngine

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize automation engine
automation = AutomationEngine(db)

# Create the main app
app = FastAPI(title="AI Tender Guardian", description="Autonomous Procurement System")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Models
class SealedBid(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    tenderId: str
    bidHash: str
    timestamp: str
    bidderId: str
    status: str = "SEALED"
    encryptedFileBase64: Optional[str] = None
    iv: Optional[str] = None

class SealBidResponse(BaseModel):
    success: bool
    bidHash: str
    message: str
    bidderId: str
    automated: bool = True

class ComplianceCheckRequest(BaseModel):
    tenderRequirements: str
    bidSummary: str

class ComplianceCheckResponse(BaseModel):
    success: bool
    analysis: str
    violations: List[str]

class TenderCreate(BaseModel):
    tenderId: str
    description: str
    budget: Optional[float] = None
    deadline: Optional[str] = None
    requirements: str

class TenderUpdate(BaseModel):
    tenderId: str
    updateContent: str
    updatedBy: str = "system"

class TenderUpdateResponse(BaseModel):
    success: bool
    updateHash: str
    timestamp: str

class AuditLogEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    tenderId: str
    bidHash: str
    timestamp: str
    bidderId: str
    status: str

class AutomationStats(BaseModel):
    total_bids: int
    total_tenders: int
    automation_events: int
    last_24h_bids: int

# Routes
@api_router.get("/")
async def root():
    return {
        "message": "AI Tender Guardian - Autonomous Procurement System",
        "version": "2.0",
        "features": ["Auto-Notifications", "Auto-Compliance", "Smart Analytics"],
        "automation": "Built-in (No external tools required)"
    }

@api_router.post("/seal", response_model=SealBidResponse)
async def seal_bid(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    tender_id: str = File(...)
):
    """Seal a bid with automatic notifications"""
    try:
        # Read file content
        file_content = await file.read()
        
        # Encrypt file using AES-256
        encrypted_content, iv = encrypt_file_content(file_content)
        
        # Generate SHA-3-512 hash of encrypted file
        bid_hash = generate_sha3_512_hash(encrypted_content)
        
        # Generate unique bidder ID
        bidder_id = str(uuid.uuid4())
        
        # Store metadata in database
        timestamp = datetime.now(timezone.utc).isoformat()
        
        sealed_bid = {
            "tenderId": tender_id,
            "bidHash": bid_hash,
            "timestamp": timestamp,
            "bidderId": bidder_id,
            "status": "SEALED",
            "encryptedFileBase64": base64.b64encode(encrypted_content).decode('utf-8'),
            "iv": base64.b64encode(iv).decode('utf-8')
        }
        
        await db.bids.insert_one(sealed_bid)
        
        # AUTO: Send notification in background
        background_tasks.add_task(
            automation.notify_bid_sealed,
            tender_id,
            bidder_id,
            bid_hash
        )
        
        return SealBidResponse(
            success=True,
            bidHash=bid_hash,
            message="Bid sealed with AES-256 encryption. Notification sent.",
            bidderId=bidder_id,
            automated=True
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seal bid: {str(e)}")

@api_router.post("/compliance", response_model=ComplianceCheckResponse)
async def check_compliance(request: ComplianceCheckRequest):
    """AI-powered compliance checking"""
    try:
        # Initialize Gemini chat with Emergent LLM key
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"compliance-{uuid.uuid4()}",
            system_message="You are an AI procurement compliance assistant. Analyze requirements and identify violations precisely."
        ).with_model("gemini", "gemini-3-flash-preview")
        
        # Create compliance check prompt
        prompt = f"""Analyze this bid for compliance:

TENDER REQUIREMENTS:
{request.tenderRequirements}

BID SUMMARY:
{request.bidSummary}

Provide concise analysis and list violations as bullet points (use - or •). If compliant, state "No violations detected"."""
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse response for violations
        violations = []
        if response:
            lines = response.split('\n')
            for line in lines:
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                    violations.append(line.lstrip('-•* ').strip())
        
        return ComplianceCheckResponse(
            success=True,
            analysis=response or "No violations detected",
            violations=violations if violations else ["No violations detected"]
        )
        
    except Exception as e:
        logging.error(f"Compliance check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Compliance check failed: {str(e)}")

@api_router.post("/tender", response_model=TenderUpdateResponse)
async def create_tender(
    background_tasks: BackgroundTasks,
    tender: TenderCreate
):
    """Create new tender with automatic workflow"""
    try:
        # Generate SHA-256 hash of the tender
        tender_content = f"{tender.tenderId}:{tender.description}:{tender.requirements}"
        tender_hash = generate_sha256_hash(tender_content)
        
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Store in tender_updates collection
        tender_doc = {
            "tenderId": tender.tenderId,
            "description": tender.description,
            "budget": tender.budget,
            "deadline": tender.deadline,
            "requirements": tender.requirements,
            "updateContent": f"Tender created: {tender.description}. Requirements: {tender.requirements}",
            "updatedBy": "system",
            "updateHash": tender_hash,
            "timestamp": timestamp,
            "status": "OPEN"
        }
        
        await db.tender_updates.insert_one(tender_doc)
        
        # AUTO: Log automation event
        background_tasks.add_task(
            automation.log_automation_event,
            tender.tenderId,
            "TENDER_CREATED",
            {"description": tender.description, "hash": tender_hash}
        )
        
        return TenderUpdateResponse(
            success=True,
            updateHash=tender_hash,
            timestamp=timestamp
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create tender: {str(e)}")

@api_router.get("/audit", response_model=List[AuditLogEntry])
async def get_audit_log():
    """Retrieve immutable audit log of all sealed bids"""
    try:
        # Fetch all bids, exclude _id and encrypted data
        bids = await db.bids.find(
            {},
            {"_id": 0, "tenderId": 1, "bidHash": 1, "timestamp": 1, "bidderId": 1, "status": 1}
        ).sort("timestamp", -1).to_list(1000)
        
        return bids
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch audit log: {str(e)}")

@api_router.get("/stats", response_model=AutomationStats)
async def get_automation_stats():
    """Get system automation statistics"""
    try:
        total_bids = await db.bids.count_documents({})
        total_tenders = await db.tender_updates.count_documents({})
        automation_events = await db.automation_events.count_documents({})
        
        # Count last 24h bids
        yesterday = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        last_24h_bids = await db.bids.count_documents({
            "timestamp": {"$gte": yesterday}
        })
        
        return AutomationStats(
            total_bids=total_bids,
            total_tenders=total_tenders,
            automation_events=automation_events,
            last_24h_bids=last_24h_bids
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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
    logger.info("🚀 AI Tender Guardian started - Autonomous mode enabled")
    # Start background automation tasks
    asyncio.create_task(automation.generate_daily_report())

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
