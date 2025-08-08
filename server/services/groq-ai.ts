import { z } from "zod";

// Groq AI service for enhanced trust analysis
export class GroqAIService {
  private apiKey: string;
  private baseUrl = "https://api.groq.com/openai/v1";

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
    if (!this.apiKey) {
      console.warn("⚠️ GROQ_API_KEY not found - AI features will be disabled");
    }
  }

  private async makeRequest(endpoint: string, body: any) {
    if (!this.apiKey) {
      throw new Error("Groq API key not configured");
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Analyze review content for suspicious patterns
  async analyzeReviewContent(review1: string, review2: string): Promise<{
    suspiciousScore: number;
    reasoning: string;
    patterns: string[];
  }> {
    try {
      const prompt = `Analyze these two reviews for suspicious patterns that might indicate reciprocal reputation manipulation (R4R):

Review 1: "${review1}"
Review 2: "${review2}"

Look for:
- Generic/template language
- Identical or very similar phrasing
- Unnaturally positive language
- Lack of specific details
- Signs of automated generation
- Typical R4R phrases

Rate suspiciousness from 0-100 and explain your reasoning. Be concise but thorough.

Respond in JSON format:
{
  "suspiciousScore": number (0-100),
  "reasoning": "brief explanation",
  "patterns": ["pattern1", "pattern2"]
}`;

      const response = await this.makeRequest("/chat/completions", {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are an expert in detecting fraudulent review patterns and reputation manipulation in Web3 trust networks. Analyze content objectively and provide numerical scores."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        suspiciousScore: Math.min(100, Math.max(0, result.suspiciousScore || 0)),
        reasoning: result.reasoning || "Analysis completed",
        patterns: result.patterns || []
      };
    } catch (error) {
      console.warn("Groq AI analysis failed:", error);
      // Fallback to basic analysis if AI fails
      return this.fallbackAnalysis(review1, review2);
    }
  }

  // Enhanced network analysis for detecting coordinated behavior
  async analyzeNetworkPatterns(userConnections: Array<{
    userkey: string;
    reviewCount: number;
    averageScore: number;
    commonPhrases: string[];
    timePatterns: string[];
  }>): Promise<{
    riskScore: number;
    insights: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `Analyze this trust network for coordinated manipulation patterns:

${userConnections.map((conn, i) => 
  `User ${i + 1}: ${conn.reviewCount} reviews, avg score ${conn.averageScore}, phrases: [${conn.commonPhrases.join(', ')}], timing: [${conn.timePatterns.join(', ')}]`
).join('\n')}

Identify:
- Coordinated behavior patterns
- Unnatural review timing
- Similar language usage
- Score manipulation indicators
- Network clustering signs

Provide a risk score (0-100) and actionable insights.

Respond in JSON format:
{
  "riskScore": number (0-100),
  "insights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"]
}`;

      const response = await this.makeRequest("/chat/completions", {
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system", 
            content: "You are an expert in network analysis and fraud detection for reputation systems. Focus on identifying coordinated manipulation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        riskScore: Math.min(100, Math.max(0, result.riskScore || 0)),
        insights: result.insights || [],
        recommendations: result.recommendations || []
      };
    } catch (error) {
      console.warn("Network analysis failed:", error);
      return {
        riskScore: 0,
        insights: ["AI analysis unavailable"],
        recommendations: ["Manual review recommended"]
      };
    }
  }

  // Generate trust score explanation
  async generateScoreExplanation(userProfile: {
    score: number;
    reviewsReceived: number;
    reviewsGiven: number;
    r4rScore: number;
    accountAge: number;
  }): Promise<string> {
    try {
      const prompt = `Explain this trust score in simple terms for a Web3 user:

Trust Score: ${userProfile.score}
Reviews Received: ${userProfile.reviewsReceived}
Reviews Given: ${userProfile.reviewsGiven}
R4R Risk Score: ${userProfile.r4rScore}%
Account Age: ${userProfile.accountAge} days

Create a 2-3 sentence explanation that's easy to understand, highlighting the key factors affecting their trust level.`;

      const response = await this.makeRequest("/chat/completions", {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant explaining Web3 trust scores. Be clear, concise, and encouraging while being honest about any concerns."
          },
          {
            role: "user", 
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.warn("Score explanation failed:", error);
      return `Trust score of ${userProfile.score} based on ${userProfile.reviewsReceived} reviews received and ${userProfile.reviewsGiven} given.`;
    }
  }

  // Fallback analysis when AI is unavailable
  private fallbackAnalysis(review1: string, review2: string): {
    suspiciousScore: number;
    reasoning: string;
    patterns: string[];
  } {
    const patterns: string[] = [];
    let suspiciousScore = 0;

    // Basic similarity check
    if (review1.toLowerCase() === review2.toLowerCase()) {
      suspiciousScore += 40;
      patterns.push("Identical content");
    }

    // Generic phrase detection
    const genericPhrases = ['great', 'awesome', 'trusted', 'reliable', 'good user'];
    const review1Generic = genericPhrases.some(phrase => review1.toLowerCase().includes(phrase));
    const review2Generic = genericPhrases.some(phrase => review2.toLowerCase().includes(phrase));
    
    if (review1Generic && review2Generic) {
      suspiciousScore += 20;
      patterns.push("Generic language");
    }

    // Length analysis
    if (review1.length <= 15 && review2.length <= 15) {
      suspiciousScore += 15;
      patterns.push("Very short content");
    }

    return {
      suspiciousScore: Math.min(100, suspiciousScore),
      reasoning: "Basic pattern analysis completed",
      patterns
    };
  }

  // Check if Groq AI is available
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

// Create singleton instance
export const groqAI = new GroqAIService();