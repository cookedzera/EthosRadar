// Test endpoint to directly check pagination for Serpin
import { ethosApi } from '../services/ethos-api';

export async function testSerpinPagination() {
  const userkey = 'service:x.com:1479691003607060490';
  console.log('🔍 Testing Serpin pagination directly...');
  
  // Test multiple batches
  const batches = [];
  for (let offset = 0; offset < 2000; offset += 500) {
    console.log(`📊 Fetching batch at offset ${offset}...`);
    
    const result = await ethosApi.getReviewsReceived(userkey, 500, offset);
    if (result.success && result.data?.values) {
      const count = result.data.values.length;
      console.log(`📈 Batch ${offset/500 + 1}: ${count} reviews`);
      batches.push({
        offset,
        count,
        hasData: count > 0
      });
      
      if (count === 0) break;
    } else {
      break;
    }
  }
  
  const totalReviews = batches.reduce((sum, batch) => sum + batch.count, 0);
  console.log(`✅ Total reviews found across all batches: ${totalReviews}`);
  
  return {
    totalReviews,
    batches,
    hasMoreThan500: totalReviews > 500
  };
}