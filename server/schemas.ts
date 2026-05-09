import { z } from "zod";

export const boundarySchema = z.object({
  category: z.string().max(100).optional(),
  value: z.string().min(1).max(1000),
  visibilityType: z.enum(["public", "restricted", "handoff_trigger", "never_share"]).optional()
});

export const profileUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  headline: z.string().max(200).optional().nullable(),
  generatedIntro: z.string().max(2000).optional().nullable(),
  generatedWelcomeMessage: z.string().max(2000).optional().nullable(),
  primaryConnectionGoal: z.string().max(200).optional().nullable(),
  generatedContactScopeText: z.string().max(2000).optional().nullable(),
  boundaries: z.array(boundarySchema).optional()
});

export const visitorIntakeSchema = z.object({
  visitorName: z.string().max(200).optional().nullable(),
  visitorCompany: z.string().max(200).optional().nullable(),
  visitorBackground: z.string().max(2000).optional().nullable(),
  visitorReason: z.string().max(5000).optional().nullable(),
  visitorIntentCategory: z.string().max(100).optional().nullable(),
  requestedNextStep: z.string().max(500).optional().nullable(),
  email: z.string().email().max(320).optional().or(z.literal("")).nullable(),
  linkedin: z.string().max(500).optional().nullable(),
  whatsapp: z.string().max(100).optional().nullable(),
  website: z.string().max(500).optional().nullable(),
  contactInfo: z.string().max(500).optional().nullable(),
  consentToContact: z.literal(true),
  transcript: z.array(z.unknown()).optional().nullable()
}).refine((data) => {
  return Boolean(data.contactInfo || data.email || data.linkedin || data.whatsapp || data.website);
}, {
  message: "At least one contact method is required",
  path: ["contactInfo"],
});

export const onboardingDraftSchema = z.object({
  sessionId: z.string().max(200).optional(),
  step: z.number().int().min(1).max(20).optional(),
  payload: z.record(z.string(), z.unknown()).optional()
});

export const profilePublishSchema = z.object({
  userId: z.string().min(1),
  payload: z.object({
    displayName: z.string().min(1).max(100),
    headline: z.string().max(200).optional(),
    companyOrProject: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    whatYouDo: z.string().max(2000).optional(),
    whoYouHelp: z.string().max(2000).optional(),
    currentFocus: z.string().max(2000).optional(),
    topicsYouLike: z.string().max(2000).optional(),
    websiteUrl: z.string().url().max(500).optional().nullable(),
    linkedinUrl: z.string().url().max(500).optional().nullable(),
    twitterUrl: z.string().url().max(500).optional().nullable(),
    primaryConnectionGoal: z.string().max(200).optional(),
    personaType: z.string().max(100).optional(),
    secretaryTone: z.string().max(100).optional(),
    greetingStyle: z.string().max(100).optional(),
    screeningStyle: z.string().max(100).optional(),
  }),
  generated: z.object({
    generatedIntro: z.string().optional(),
    generatedWelcomeMessage: z.string().optional(),
    generatedContactScopeText: z.string().optional(),
  }).optional()
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(5000)
});

export const inboxStatusSchema = z.object({
  status: z.enum(["new", "Waiting on you", "Ready to send", "Waiting on them", "Monitor later", "replied", "ignored", "Archived by AI"])
});

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export interface SecretaryMessage {
  id: string;
  profileId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface VisitorConversation {
  id: string;
  profileId: string;
  visitorName: string | null;
  visitorCompany: string | null;
  visitorBackground: string | null;
  visitorReason: string | null;
  visitorIntentCategory: string | null;
  requestedNextStep: string | null;
  contactInfo: string | null;
  transcript: string;
  summaryText: string | null;
  qualificationLevel: string | null;
  suggestedAction: string | null;
  handoffNeeded: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface OnboardingPayload {
  primaryConnectionGoal: string;
  personaType: string;
  displayName: string;
  headline: string;
  companyOrProject: string;
  city: string;
  whatYouDo: string;
  whoYouHelp: string;
  currentFocus: string;
  topicsYouLike: string;
  secretaryTone: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  greetingStyle?: string;
  screeningStyle?: string;
}

export interface GeneratedContent {
  generatedIntro?: string;
  generatedWelcomeMessage?: string;
  generatedContactScopeText?: string;
}
