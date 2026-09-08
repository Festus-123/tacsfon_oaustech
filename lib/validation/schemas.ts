import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please provide your full name (minimum 2 characters)")
    .max(100, "Name cannot exceed 100 characters"),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(120, "Email cannot exceed 120 characters"),
  phone: z
    .string()
    .trim()
    .max(25, "Phone number cannot exceed 25 characters")
    .optional()
    .or(z.literal("")),
  subject: z
    .string()
    .trim()
    .min(3, "Please specify a subject / purpose (minimum 3 characters)")
    .max(150, "Subject cannot exceed 150 characters"),
  message: z
    .string()
    .trim()
    .min(10, "Please provide your message (minimum 10 characters)")
    .max(3000, "Message cannot exceed 3,000 characters"),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title cannot exceed 150 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(4000, "Description cannot exceed 4,000 characters"),
  event_date: z.string().min(1, "Please choose a valid event date"),
  event_time: z.string().trim().max(100).optional().or(z.literal("")),
  location: z.string().trim().max(200).optional().or(z.literal("")),
  image_url: z.string().trim().optional().or(z.literal("")),
  external_url: z
    .string()
    .trim()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  published: z.boolean().default(true),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid administrator email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
