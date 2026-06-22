import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password too long"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const collegeFilterSchema = z.object({
  search: z.string().optional(),
  state: z.string().optional(),
  type: z.enum(["GOVERNMENT", "PRIVATE", "DEEMED", "AUTONOMOUS"]).optional(),
  exam: z.enum([
    "JEE_MAIN", "JEE_ADVANCED", "NEET", "CAT",
    "GATE", "XAT", "CLAT", "STATE_CET"
  ]).optional(),
  minFees: z.coerce.number().min(0).optional(),
  maxFees: z.coerce.number().max(10000000).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
  sortBy: z.enum(["rating", "fees", "name", "established", "nirfRank"]).default("rating"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  instituteType: z.enum(["IIT", "NIT", "ALL"]).optional(),
})

export const compareSchema = z.object({
  ids: z.string()
    .transform((val) => val.split(",").filter(Boolean))
    .refine((arr) => arr.length >= 2, "Need at least 2 colleges to compare")
    .refine((arr) => arr.length <= 3, "Can compare maximum 3 colleges"),
})

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5, "Title too short").max(100, "Title too long"),
  content: z.string().min(50, "Review too short").max(2000, "Review too long"),
  pros: z.string().max(500).optional(),
  cons: z.string().max(500).optional(),
  batch: z.number()
    .min(2000, "Invalid batch year")
    .max(new Date().getFullYear())
    .optional(),
})

export const predictorSchema = z.object({
  exam: z.enum([
    "JEE_MAIN", "JEE_ADVANCED", "NEET", "CAT",
    "GATE", "XAT", "CLAT", "STATE_CET"
  ], { message: "Please select an exam" }),
  rank: z.coerce.number()
    .min(1, "Rank must be at least 1")
    .max(1000000, "Rank seems too high"),
  category: z.enum(["GENERAL", "OBC", "SC", "ST", "EWS"])
    .default("GENERAL"),
  year: z.coerce.number()
    .min(2020)
    .max(new Date().getFullYear())
    .default(2024),
  quota: z.enum(["AI", "OS", "HS"]).optional(),
  gender: z.enum(["Gender-Neutral", "Female-Only"]).optional(),
})

export const saveCollegeSchema = z.object({
  collegeId: z.string().cuid("Invalid college ID"),
})

export const saveComparisonSchema = z.object({
  collegeAId: z.string().cuid("Invalid college ID"),
  collegeBId: z.string().cuid("Invalid college ID"),
  collegeCId: z.string().cuid("Invalid college ID").optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type CollegeFilterInput = z.infer<typeof collegeFilterSchema>
export type CompareInput = z.infer<typeof compareSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type PredictorInput = z.infer<typeof predictorSchema>
export type SaveCollegeInput = z.infer<typeof saveCollegeSchema>
export type SaveComparisonInput = z.infer<typeof saveComparisonSchema>
