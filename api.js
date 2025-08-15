const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// Replace with your Firebase service account key
const serviceAccount = {
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "your-private-key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n",
  "client_email": "your-client-email@your-project-id.iam.gserviceaccount.com",
  "client_id": "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/your-client-email%40your-project-id.iam.gserviceaccount.com"
};

// Initialize Firebase (comment out the line below if using environment variables)
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// Alternative: Initialize with environment variable (recommended for production)
// Set GOOGLE_APPLICATION_CREDENTIALS environment variable to path of service account key
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require('./serviceAccountKey.json'))
    });
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.log('Firebase initialization error:', error.message);
  }
}

const db = admin.firestore();

// Collections
const USERS_COLLECTION = 'users';
const REFERRALS_COLLECTION = 'referrals';

// Utility function to generate referral code
function generateReferralCode(memberId) {
  const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
  const timestamp = Date.now().toString().slice(-5);
  return `REF-${memberId}-${timestamp}${randomString}`;
}

// Utility function to ensure user exists
async function ensureUserExists(userId) {
  try {
    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      await userRef.set({
        userId: userId,
        points: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return 0;
    }
    
    return userDoc.data().points || 0;
  } catch (error) {
    throw new Error(`Error ensuring user exists: ${error.message}`);
  }
}

// Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Referral API is running' });
});

// GET /api/users/:id/points - Returns the current points for a specific user
app.get('/api/users/:id/points', async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const points = await ensureUserExists(userId);
    
    res.json({
      userId: userId,
      points: points
    });
  } catch (error) {
    console.error('Error getting user points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/:id/add-points - Adds points to a specific user
app.post('/api/users/:id/add-points', async (req, res) => {
  try {
    const userId = req.params.id;
    const { points } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!points || typeof points !== 'number' || points <= 0) {
      return res.status(400).json({ error: 'Valid positive points value is required' });
    }

    const userRef = db.collection(USERS_COLLECTION).doc(userId);
    
    // Use transaction to ensure atomic update
    const newTotal = await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      
      let currentPoints = 0;
      if (!userDoc.exists) {
        // Create new user
        transaction.set(userRef, {
          userId: userId,
          points: points,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return points;
      } else {
        // Update existing user
        currentPoints = userDoc.data().points || 0;
        const newPoints = currentPoints + points;
        
        transaction.update(userRef, {
          points: newPoints,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return newPoints;
      }
    });
    
    res.json({
      message: 'Points added',
      totalPoints: newTotal
    });
  } catch (error) {
    console.error('Error adding points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/referrals/create - Creates a new referral link for a given user and project
app.post('/api/referrals/create', async (req, res) => {
  try {
    const { memberId, projectId } = req.body;
    
    if (!memberId || !projectId) {
      return res.status(400).json({ error: 'memberId and projectId are required' });
    }

    // Ensure user exists
    await ensureUserExists(memberId);
    
    // Generate unique referral code
    const referralCode = generateReferralCode(memberId);
    
    // Store referral in database
    const referralData = {
      referralCode: referralCode,
      memberId: memberId,
      projectId: projectId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      clickCount: 0,
      conversions: 0,
      isActive: true
    };
    
    await db.collection(REFERRALS_COLLECTION).doc(referralCode).set(referralData);
    
    // Generate referral link (you can customize the base URL)
    const baseUrl = process.env.BASE_URL || 'https://example.com';
    const referralLink = `${baseUrl}?ref=${referralCode}`;
    
    res.json({
      referralLink: referralLink,
      referralCode: referralCode,
      memberId: memberId,
      projectId: projectId
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/webhook-test - Receives any JSON payload and logs it
app.post('/api/webhook-test', (req, res) => {
  try {
    const payload = req.body;
    const headers = req.headers;
    const timestamp = new Date().toISOString();
    
    console.log('\n=== WEBHOOK TEST RECEIVED ===');
    console.log('Timestamp:', timestamp);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('=============================\n');
    
    // Store webhook data in Firestore for later analysis (optional)
    const webhookData = {
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      headers: headers,
      payload: payload,
      source: 'webhook-test'
    };
    
    // Optionally save to database
    db.collection('webhook_logs').add(webhookData).catch(error => {
      console.error('Error saving webhook log:', error);
    });
    
    res.json({
      message: 'Webhook received and logged successfully',
      timestamp: timestamp,
      payloadReceived: true
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Additional utility endpoint to get referral statistics
app.get('/api/referrals/:code/stats', async (req, res) => {
  try {
    const referralCode = req.params.code;
    
    if (!referralCode) {
      return res.status(400).json({ error: 'Referral code is required' });
    }

    const referralDoc = await db.collection(REFERRALS_COLLECTION).doc(referralCode).get();
    
    if (!referralDoc.exists) {
      return res.status(404).json({ error: 'Referral code not found' });
    }
    
    const referralData = referralDoc.data();
    
    res.json({
      referralCode: referralCode,
      memberId: referralData.memberId,
      projectId: referralData.projectId,
      clickCount: referralData.clickCount || 0,
      conversions: referralData.conversions || 0,
      isActive: referralData.isActive,
      createdAt: referralData.createdAt
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
  console.log(`Referral System API is running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log('\nAvailable endpoints:');
  console.log(`GET    /api/users/:id/points`);
  console.log(`POST   /api/users/:id/add-points`);
  console.log(`POST   /api/referrals/create`);
  console.log(`POST   /api/webhook-test`);
  console.log(`GET    /api/referrals/:code/stats (bonus endpoint)`);
});

module.exports = app;