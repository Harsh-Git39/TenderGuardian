# AI Tender Guardian

## Overview
A hackathon MVP demonstrating sealed-bid anchoring, AI compliance checking, and immutable audit logs.

## Features
1. **Bid Sealing Engine** - AES-256 encryption + SHA-3-512 hashing
2. **AI Compliance Checker** - Powered by Google Gemini via Emergent LLM Key
3. **Immutable Audit Log** - Complete transparency
4. **n8n Governance Webhook** - Tender update endpoint

## Tech Stack
- **Backend:** FastAPI (Python)
- **Frontend:** React
- **Database:** MongoDB
- **AI:** Google Gemini 3 Flash (via emergentintegrations)
- **Encryption:** AES-256, SHA-3-512

## Firebase Setup Instructions

### Required Configuration
While this MVP uses FastAPI + MongoDB for rapid development, you can integrate Firebase:

1. **Create Firebase Project:**
   - Go to https://console.firebase.google.com
   - Create new project
   - Enable Firestore Database
   - Enable Firebase Storage

2. **Get Firebase Config:**
   - Project Settings → General → Your apps → Web app
   - Copy the config object

3. **Install Firebase SDK:**
   ```bash
   cd frontend
   yarn add firebase
   ```

4. **Create `/app/frontend/src/firebase-config.js`:**
   ```javascript
   import { initializeApp } from 'firebase/app';
   import { getFirestore } from 'firebase/firestore';
   import { getStorage } from 'firebase/storage';

   // PASTE YOUR FIREBASE CONFIG HERE
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };

   const app = initializeApp(firebaseConfig);
   export const db = getFirestore(app);
   export const storage = getStorage(app);
   ```

5. **For Vertex AI (optional):**
   - Enable Vertex AI API in Google Cloud Console
   - Currently using Emergent LLM Key with Gemini

## Environment Variables

### Backend (.env)
```bash
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
EMERGENT_LLM_KEY=sk-emergent-1A8F55f96Fd501e86F
ENCRYPTION_KEY=your_32_byte_encryption_key_here_123456
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=https://ai-tender-guardian.preview.emergentagent.com
```

## Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
sudo supervisorctl restart backend
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## API Endpoints

### 1. Seal Bid
```
POST /api/seal-bid
Content-Type: multipart/form-data

file: [bid document]
tender_id: "TENDER-2025-001"

Response:
{
  "success": true,
  "bidHash": "sha3-512-hash...",
  "message": "Bid sealed successfully",
  "bidderId": "uuid"
}
```

### 2. Check Compliance
```
POST /api/check-compliance
Content-Type: application/json

{
  "tenderRequirements": "Must include...",
  "bidSummary": "We offer..."
}

Response:
{
  "success": true,
  "analysis": "AI analysis text",
  "violations": ["list of violations"]
}
```

### 3. Tender Update (n8n webhook)
```
POST /api/tender-update
Content-Type: application/json

{
  "tenderId": "TENDER-2025-001",
  "updateContent": "Update description",
  "updatedBy": "admin"
}

Response:
{
  "success": true,
  "updateHash": "sha256-hash",
  "timestamp": "2025-01-..."
}
```

### 4. Audit Log
```
GET /api/audit-log

Response:
[
  {
    "tenderId": "TENDER-2025-001",
    "bidHash": "sha3-512-hash",
    "timestamp": "2025-01-...",
    "bidderId": "uuid",
    "status": "SEALED"
  }
]
```

## Pages
- `/` - Home page with overview
- `/upload` - Bid sealing interface
- `/check` - AI compliance checker
- `/audit` - Immutable audit log viewer

## Security Notes
- AES-256 encryption with environment-based keys
- SHA-3-512 hashing for bid integrity
- Encrypted files stored as base64 (for demo; use Firebase Storage in production)
- No plain-text bid content in database

## n8n Integration
Use the `/api/tender-update` endpoint in your n8n workflows to log tender updates with SHA-256 hashes.

## Next Steps
1. Deploy to production environment
2. Integrate Firebase Storage for encrypted files
3. Add Firebase Authentication
4. Implement advanced role-based access
5. Add real-time notifications

## License
MIT
