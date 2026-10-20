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
  published: z.boolean(),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid administrator email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================================
// PROGRAMME PAYMENT SCHEMAS
// ============================================================

export const paymentRequestSchema = z.object({
  programme_name: z
    .string()
    .trim()
    .min(2, "Programme name must be at least 2 characters")
    .max(150, "Programme name cannot exceed 150 characters"),
  programme_date: z
    .string()
    .trim()
    .min(1, "Please specify the programme date"),
  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2,000 characters")
    .optional()
    .or(z.literal("")),
  amount_per_person: z
    .number({ message: "Amount per person must be a valid number" })
    .min(0, "Amount per person cannot be negative"),
  bank_name: z
    .string()
    .trim()
    .min(2, "Please provide the bank name")
    .max(100, "Bank name cannot exceed 100 characters"),
  account_name: z
    .string()
    .trim()
    .min(2, "Please provide the account name")
    .max(120, "Account name cannot exceed 120 characters"),
  account_number: z
    .string()
    .trim()
    .min(5, "Account number must be at least 5 digits")
    .max(20, "Account number cannot exceed 20 characters"),
  payment_instructions: z
    .string()
    .trim()
    .max(2000, "Instructions cannot exceed 2,000 characters")
    .optional()
    .or(z.literal("")),
  image_url: z.string().trim().optional().or(z.literal("")),
});

export type PaymentRequestFormData = z.infer<typeof paymentRequestSchema>;

export const paymentSubmissionSchema = z.object({
  payment_request_id: z.string().uuid("Invalid payment request identifier"),
  names: z
    .array(
      z
        .string()
        .trim()
        .min(2, "Each participant name must be at least 2 characters")
        .max(100, "Participant name cannot exceed 100 characters")
    )
    .min(1, "Please register at least one participant")
    .max(20, "Cannot register more than 20 participants at once")
    .refine(
      (items) => {
        const lowercased = items.map((n) => n.toLowerCase());
        return new Set(lowercased).size === items.length;
      },
      {
        message: "Duplicate participant names within the same submission are not allowed",
      }
    ),
});

export type PaymentSubmissionFormData = z.infer<typeof paymentSubmissionSchema>;

// ============================================================
// ACADEMIC HUB SCHEMAS
// ============================================================

export const academicSessionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, "Session format must be like 2024/2025")
    .max(20, "Session name too long"),
  is_active: z.boolean().default(true),
});

export type AcademicSessionFormData = z.infer<typeof academicSessionSchema>;

export const semesterSchema = z
  .object({
    academic_session_id: z.string().uuid("Please select an academic session"),
    name: z
      .string()
      .trim()
      .min(2, "Semester name is required (e.g. First Semester)")
      .max(60),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().min(1, "End date is required"),
    price: z
      .number({ message: "Price must be a valid number" })
      .min(0, "Price cannot be negative"),
    status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "EXPIRED"]).default("ACTIVE"),
    description: z.string().trim().max(1000).optional().or(z.literal("")),
  })
  .refine(
    (data) => new Date(data.end_date).getTime() > new Date(data.start_date).getTime(),
    {
      message: "End date must be after start date",
      path: ["end_date"],
    }
  );

export type SemesterFormData = z.infer<typeof semesterSchema>;

export const schoolSchema = z.object({
  name: z.string().trim().min(2, "School name is required").max(150),
  code: z.string().trim().min(2, "School code is required").max(50),
  is_active: z.boolean().default(true),
});

export type SchoolFormData = z.infer<typeof schoolSchema>;

export const departmentSchema = z.object({
  school_id: z.string().uuid("Please select a parent school"),
  name: z.string().trim().min(2, "Department name is required").max(150),
  code: z.string().trim().min(2, "Department code is required").max(50),
  is_active: z.boolean().default(true),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;

const LEVELS = [100, 200, 300, 400, 500];
const SCOPES = ["general", "school", "department"] as const;

export const courseSchema = z
  .object({
    code: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3}\s*-?\s*\d{3}$/, "Course code must look like CSC 308"),
    title: z.string().trim().min(2, "Course title is required").max(150),
    level: z.coerce
      .number()
      .refine((val) => LEVELS.includes(val), {
        message: "Level must be 100, 200, 300, 400, or 500",
      }),
    scope: z.enum(SCOPES).default("department"),
    department_id: z.string().uuid("Please select a department").nullable().optional(),
    school_id: z.string().uuid("Please select a school").nullable().optional(),
    is_active: z.boolean().default(true),
  })
  .refine((data) => data.scope !== "department" || !!data.department_id, {
    message: "Please select the department that owns this course",
    path: ["department_id"],
  })
  .refine((data) => data.scope !== "school" || !!data.school_id, {
    message: "Please select the school for this school-wide course",
    path: ["school_id"],
  });

export type CourseFormData = z.infer<typeof courseSchema>;

export const courseScopeRuleSchema = z
  .object({
    match_type: z.enum(["course", "prefix"]),
    pattern: z.string().trim().min(3, "Enter a course code or a 3-letter prefix").max(10),
    max_level: z
      .number()
      .refine((val) => LEVELS.includes(val), { message: "Max level must be 100-500" })
      .nullable()
      .optional(),
    scope: z.enum(SCOPES),
    school_id: z.string().uuid().nullable().optional(),
    department_id: z.string().uuid().nullable().optional(),
    listed_under_department_ids: z.array(z.string().uuid()).default([]),
  })
  .refine((data) => data.scope !== "school" || !!data.school_id, {
    message: "Please select the school for a school-wide rule",
    path: ["school_id"],
  })
  .refine((data) => data.scope !== "department" || data.match_type === "prefix" || !!data.department_id, {
    message: "Please select the department for this course",
    path: ["department_id"],
  });

export type CourseScopeRuleFormData = z.infer<typeof courseScopeRuleSchema>;

export const materialUploadReviewSchema = z.object({
  title: z.string().trim().min(2, "Material title required").max(200),
  material_type_id: z.string().uuid("Select material type"),
  school_id: z.string().uuid("Select school"),
  department_id: z.string().uuid("Select department"),
  course_id: z.string().uuid("Select course"),
  level: z.coerce.number().refine((val) => [100, 200, 300, 400, 500].includes(val)),
  academic_session_id: z.string().uuid("Select session"),
  semester_id: z.string().uuid("Select semester"),
  is_published: z.boolean().default(true),
});

export type MaterialUploadReviewFormData = z.infer<typeof materialUploadReviewSchema>;

export const studentAuthSchema = z.object({
  email: z.string().trim().email("Please enter a valid university/student email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type StudentAuthFormData = z.infer<typeof studentAuthSchema>;
