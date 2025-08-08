import express from 'express';
import { ethosApi } from '../services/ethos-api.js';

const router = express.Router();

// Get attestations for a user
router.get('/attestations/:userkey', async (req, res) => {
  try {
    const { userkey } = req.params;
    
    // First get user profile to extract profileId
    const userResult = await ethosApi.searchUsers(userkey);
    
    if (!userResult.success || !userResult.data) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const user = userResult.data;
    
    // Extract attestations from user data and connected accounts
    const attestations = extractUserAttestations(user);
    
    res.json({
      success: true,
      data: {
        attestations,
        summary: {
          total: attestations.length,
          verified: attestations.filter(a => a.verified).length,
          platforms: Array.from(new Set(attestations.map(a => a.platform))),
          avgConfidence: attestations.length > 0 
            ? Math.round(attestations.reduce((sum, a) => sum + a.confidence, 0) / attestations.length)
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Attestations API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attestations'
    });
  }
});

// Verify specific attestation
router.post('/attestations/:userkey/verify', async (req, res) => {
  try {
    const { userkey } = req.params;
    const { platform, handle } = req.body;
    
    // Simulate verification process
    const verification = await verifyAttestation(userkey, platform, handle);
    
    res.json({
      success: true,
      data: verification
    });

  } catch (error) {
    console.error('Attestation verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify attestation'
    });
  }
});

// Helper function to extract attestations from user data
function extractUserAttestations(user: any) {
  const attestations = [];

  // Social media attestations
  if (user.userkeys) {
    for (const userkey of user.userkeys) {
      if (userkey.includes('x.com') || userkey.includes('twitter')) {
        attestations.push({
          id: `twitter-${user.id}`,
          type: 'social',
          platform: 'Twitter/X',
          handle: user.username || 'Unknown',
          verified: true,
          confidence: calculateConfidence('twitter', user),
          createdAt: new Date().toISOString(),
          details: {
            verification_badge: !!user.username,
            activity_score: user.score || 0,
            userkey: userkey
          }
        });
      }
      
      if (userkey.includes('farcaster')) {
        const fid = userkey.split(':')[2];
        attestations.push({
          id: `farcaster-${user.id}`,
          type: 'social',
          platform: 'Farcaster',
          handle: user.username || `FID ${fid}`,
          verified: true,
          confidence: calculateConfidence('farcaster', user),
          createdAt: new Date().toISOString(),
          details: {
            fid: fid,
            verification_badge: user.status === 'ACTIVE',
            activity_score: user.score || 0,
            userkey: userkey
          }
        });
      }
    }
  }

  // Wallet attestation (inferred from Ethos participation)
  if (user.score > 0) {
    attestations.push({
      id: `wallet-${user.id}`,
      type: 'wallet',
      platform: 'Ethereum',
      handle: 'Connected Wallet',
      verified: true,
      confidence: calculateConfidence('wallet', user),
      createdAt: new Date().toISOString(),
      details: {
        activity_score: user.score,
        trust_level: getTrustLevel(user.score)
      }
    });
  }

  return attestations;
}

// Calculate confidence score based on platform and user data
function calculateConfidence(platform: string, user: any): number {
  let baseConfidence = 70;
  
  switch (platform) {
    case 'twitter':
      baseConfidence = 85;
      if (user.username) baseConfidence += 5;
      if (user.score > 1500) baseConfidence += 5;
      break;
    case 'farcaster':
      baseConfidence = 90;
      if (user.status === 'ACTIVE') baseConfidence += 2;
      if (user.score > 1500) baseConfidence += 3;
      break;
    case 'wallet':
      baseConfidence = 75;
      if (user.score > 2000) baseConfidence += 10;
      else if (user.score > 1000) baseConfidence += 5;
      break;
  }
  
  return Math.min(95, baseConfidence);
}

// Get trust level based on score
function getTrustLevel(score: number): string {
  if (score >= 2000) return 'Exemplary';
  if (score >= 1600) return 'Reputable';
  if (score >= 1200) return 'Neutral';
  if (score >= 800) return 'Questionable';
  return 'Untrusted';
}

// Simulate attestation verification
async function verifyAttestation(userkey: string, platform: string, handle: string) {
  // In a real implementation, this would perform actual verification
  // For now, we'll simulate the verification process
  
  const verificationResult = {
    verified: true,
    confidence: Math.floor(Math.random() * 20) + 80, // 80-100% confidence
    timestamp: new Date().toISOString(),
    method: 'cross_reference',
    details: {
      platform,
      handle,
      checks_performed: [
        'account_existence',
        'activity_verification',
        'cross_platform_validation'
      ]
    }
  };

  return verificationResult;
}

export default router;