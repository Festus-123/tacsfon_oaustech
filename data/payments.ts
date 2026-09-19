import { donationConfig } from "./donation";

export type PaymentStatus = "ACTIVE" | "CLOSED" | "EXPIRED";

export interface PaymentRequest {
  id: string;
  programme_name: string;
  programme_date: string;
  description: string | null;
  amount_per_person: number;
  bank_name: string;
  account_name: string;
  account_number: string;
  payment_instructions: string | null;
  image_url: string | null;
  status: PaymentStatus;
  created_at: string;
  expires_at: string;
  closed_at: string | null;
  submissions_count?: number;
  total_people_count?: number;
}

export interface PaymentSubmission {
  id: string;
  payment_request_id: string;
  total_people: number;
  amount_per_person_snapshot: number;
  total_amount: number;
  created_at: string;
  completed_at: string;
}

export interface PaymentSubmissionPerson {
  id: string;
  submission_id: string;
  payment_request_id: string;
  name: string;
  created_at: string;
}

// In-memory fallback initial seed requests
export const initialPaymentRequests: PaymentRequest[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    programme_name: "Annual Davidic Generation Conference 2026",
    programme_date: "2026-10-24",
    description: "Official registration and delegate package for the TACSFON OAUSTECH Annual Believers Conference.",
    amount_per_person: 2500,
    bank_name: donationConfig.bankName,
    account_name: donationConfig.accountName,
    account_number: donationConfig.accountNumber,
    payment_instructions: "Transfer to the official fellowship account. In the payment narration, include your name. After completing transfer, click 'Payment Completed' below.",
    image_url: "/assets/sunday-service.jpg",
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    closed_at: null,
    submissions_count: 2,
    total_people_count: 4,
  },
  {
    id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    programme_name: "Mega Campus Prayer Retreat",
    programme_date: "2026-11-14",
    description: "Transport logistics and retreat material fee for the 3-day spiritual immersion.",
    amount_per_person: 1500,
    bank_name: donationConfig.bankName,
    account_name: donationConfig.accountName,
    account_number: donationConfig.accountNumber,
    payment_instructions: "Please make payment before retreat departure. Ensure your registered names match your student ID.",
    image_url: "/assets/prayer-meeting.jpg",
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    closed_at: null,
    submissions_count: 1,
    total_people_count: 2,
  },
];

export const initialSubmissionPeople: PaymentSubmissionPerson[] = [
  {
    id: "p-01",
    submission_id: "s-01",
    payment_request_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Festus Phillip",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "p-02",
    submission_id: "s-01",
    payment_request_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Ayomide Deborah",
    created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: "p-03",
    submission_id: "s-02",
    payment_request_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Samuel Oladipo",
    created_at: new Date(Date.now() - 1800 * 1000).toISOString(),
  },
  {
    id: "p-04",
    submission_id: "s-02",
    payment_request_id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    name: "Grace Emmanuel",
    created_at: new Date(Date.now() - 1800 * 1000).toISOString(),
  },
  {
    id: "p-05",
    submission_id: "s-03",
    payment_request_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    name: "Joshua Adebayo",
    created_at: new Date(Date.now() - 7200 * 1000).toISOString(),
  },
  {
    id: "p-06",
    submission_id: "s-03",
    payment_request_id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    name: "Faithfulness Babatunde",
    created_at: new Date(Date.now() - 7200 * 1000).toISOString(),
  },
];
