// Shared data schemas for EthosRadar
// This file defines the data models used throughout the application

import { z } from "zod";

// Ethos Trust Score Schema
export const trustScoreSchema = z.object({
  score: z.number(),
  level: z.string(),
  rank: z.number().optional(),
  vouches: z.number(),
  reviews: z.number(),
  xp: z.number().optional(),
});

export type TrustScore = z.infer<typeof trustScoreSchema>;

// User Profile Schema
export const userProfileSchema = z.object({
  address: z.string(),
  username: z.string().optional(),
  displayName: z.string().optional(),
  avatar: z.string().optional(),
  platform: z.enum(["ethereum", "farcaster", "twitter", "discord"]),
  trustScore: trustScoreSchema.optional(),
  isVerified: z.boolean().default(false),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// R4R Analysis Schema
export const r4rAnalysisSchema = z.object({
  address: z.string(),
  riskScore: z.number(),
  suspiciousPatterns: z.array(z.string()),
  mutualVouches: z.number(),
  circularVouching: z.boolean(),
  timePatterns: z.array(z.string()),
});

export type R4RAnalysis = z.infer<typeof r4rAnalysisSchema>;

// Vouch Data Schema
export const vouchSchema = z.object({
  id: z.string(),
  fromAddress: z.string(),
  toAddress: z.string(),
  comment: z.string().optional(),
  timestamp: z.string(),
  transactionHash: z.string().optional(),
});

export type Vouch = z.infer<typeof vouchSchema>;

// Search Query Schema
export const searchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required"),
  platform: z.enum(["ethereum", "farcaster", "twitter", "discord", "all"]).default("all"),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// API Response Schema
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};