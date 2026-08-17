import { z } from "zod";
import { isValidGtinFormat } from "./gs1";

export const producerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  farmName: z.string().min(2, "Farm name is required"),
  country: z.string().min(2).default("Nepal"),
  province: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  municipality: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  gpsLat: z.coerce.number().optional().nullable(),
  gpsLng: z.coerce.number().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactPhone: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")).nullable(),
  certifications: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
  isPublic: z.coerce.boolean().default(true),
});

export const productSchema = z.object({
  gtin: z
    .string()
    .min(8, "GTIN is required")
    .refine((v) => isValidGtinFormat(v), {
      message: "Invalid GTIN: length or check digit is incorrect",
    }),
  isDemoGtin: z.coerce.boolean().default(false),
  sku: z.string().optional().nullable(),
  name: z.string().min(2, "Product name is required"),
  nameEn: z.string().optional().nullable(),
  category: z.string().min(2, "Category is required"),
  variety: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  producerId: z.string().optional().nullable(),
  originCountry: z.string().default("Nepal"),
  originRegion: z.string().optional().nullable(),
  sellingUnit: z.string().optional().nullable(),
  weight: z.string().optional().nullable(),
  packagingType: z.string().optional().nullable(),
  certifications: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
});

export const lotSchema = z.object({
  lotNumber: z.string().min(2, "Lot number is required"),
  productId: z.string().min(1, "Product is required"),
  producerId: z.string().optional().nullable(),
  harvestDate: z.coerce.date().optional().nullable(),
  packingDate: z.coerce.date().optional().nullable(),
  shippingDate: z.coerce.date().optional().nullable(),
  quantity: z.coerce.number().optional().nullable(),
  unit: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  storageConditions: z.string().optional().nullable(),
  status: z.enum(["in_production", "packed", "shipped", "delivered"]).default("in_production"),
});

export const settingsSchema = z.object({
  companyName: z.string().min(2),
  domain: z.string().min(3),
  country: z.string().min(2),
  contactEmail: z.string().email().optional().or(z.literal("")).nullable(),
  contactPhone: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
