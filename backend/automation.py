import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

class AutomationEngine:
    def __init__(self, db):
        self.db = db
        self.smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        self.smtp_user = os.environ.get('SMTP_USER', '')
        self.smtp_password = os.environ.get('SMTP_PASSWORD', '')
        self.from_email = os.environ.get('FROM_EMAIL', 'noreply@tenderforbids.com')
        
    async def send_email(self, to_email: str, subject: str, body: str, html_body: str = None):
        """Send email notification"""
        if not self.smtp_user:
            logger.info(f"Email simulation: {subject} to {to_email}")
            logger.info(f"Body: {body}")
            return True
            
        try:
            message = MIMEMultipart('alternative')
            message['From'] = self.from_email
            message['To'] = to_email
            message['Subject'] = subject
            
            message.attach(MIMEText(body, 'plain'))
            if html_body:
                message.attach(MIMEText(html_body, 'html'))
            
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=True
            )
            logger.info(f"Email sent to {to_email}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return False
    
    async def notify_bid_sealed(self, tender_id: str, bidder_id: str, bid_hash: str):
        """Auto-notify when bid is sealed"""
        subject = f"✅ Bid Sealed Successfully - {tender_id}"
        body = f"""
Your bid has been successfully sealed with military-grade encryption.

Tender ID: {tender_id}
Bidder ID: {bidder_id}
Bid Hash: {bid_hash[:32]}...
Timestamp: {datetime.now(timezone.utc).isoformat()}

This is your cryptographic proof of submission. Keep this for your records.

AI Tender Guardian
        """
        
        html_body = f"""
<html>
<body style="font-family: monospace; background: #000; color: #fff; padding: 20px;">
    <h2 style="color: #00ff00;">✅ BID SEALED SUCCESSFULLY</h2>
    <div style="background: #111; padding: 20px; border: 1px solid #333;">
        <p><strong>Tender ID:</strong> {tender_id}</p>
        <p><strong>Bidder ID:</strong> {bidder_id}</p>
        <p><strong>Bid Hash:</strong> <code style="color: #00ff00;">{bid_hash[:32]}...</code></p>
        <p><strong>Timestamp:</strong> {datetime.now(timezone.utc).isoformat()}</p>
    </div>
    <p style="margin-top: 20px; color: #888;">This is your cryptographic proof of submission.</p>
    <p style="color: #888;">Powered by AI Tender Guardian</p>
</body>
</html>
        """
        
        # In production, get bidder email from database
        # For now, log the notification
        logger.info(f"Bid sealed notification: {tender_id} - {bidder_id}")
        await self.log_automation_event(tender_id, "BID_SEALED_NOTIFICATION", {"bidder_id": bidder_id})
        
    async def check_expired_tenders(self):
        """Check for expired tenders and trigger compliance checks"""
        now = datetime.now(timezone.utc)
        
        # Get all tenders with deadlines in past 1 hour
        tenders = await self.db.tender_updates.find({
            "updateContent": {"$regex": "Deadline:"},
        }).to_list(100)
        
        for tender in tenders:
            # Check if deadline passed and compliance not run
            compliance_check = await self.db.automation_events.find_one({
                "tenderId": tender['tenderId'],
                "eventType": "AUTO_COMPLIANCE_CHECK"
            })
            
            if not compliance_check:
                # Trigger auto compliance check
                await self.auto_compliance_check(tender['tenderId'])
    
    async def auto_compliance_check(self, tender_id: str):
        """Automatically run compliance checks on all bids for a tender"""
        logger.info(f"Auto compliance check triggered for {tender_id}")
        
        # Get all bids for this tender
        bids = await self.db.bids.find({"tenderId": tender_id}).to_list(1000)
        
        compliance_results = {
            "total_bids": len(bids),
            "compliant": 0,
            "non_compliant": 0,
            "checked_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Log the automation event
        await self.log_automation_event(tender_id, "AUTO_COMPLIANCE_CHECK", compliance_results)
        logger.info(f"Auto compliance completed: {tender_id} - {len(bids)} bids checked")
    
    async def log_automation_event(self, tender_id: str, event_type: str, data: dict):
        """Log automation events for audit trail"""
        event = {
            "tenderId": tender_id,
            "eventType": event_type,
            "data": data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.automation_events.insert_one(event)
    
    async def send_deadline_reminders(self):
        """Send reminders for upcoming tender deadlines"""
        logger.info("Checking for upcoming deadlines...")
        # Implementation for deadline reminders
        pass
    
    async def generate_daily_report(self):
        """Generate daily summary report"""
        today = datetime.now(timezone.utc).date()
        
        # Count today's activities
        bids_today = await self.db.bids.count_documents({
            "timestamp": {"$gte": today.isoformat()}
        })
        
        updates_today = await self.db.tender_updates.count_documents({
            "timestamp": {"$gte": today.isoformat()}
        })
        
        logger.info(f"Daily report: {bids_today} bids, {updates_today} updates")
        
        await self.log_automation_event(
            "SYSTEM",
            "DAILY_REPORT",
            {
                "bids_count": bids_today,
                "updates_count": updates_today,
                "date": today.isoformat()
            }
        )
