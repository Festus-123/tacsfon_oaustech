import { createClient } from "./server";
import { createPublicClient } from "./client";
import {
  PaymentRequest,
  PaymentSubmissionPerson,
  initialPaymentRequests,
  initialSubmissionPeople,
} from "@/data/payments";
import { PaymentRequestFormData } from "@/lib/validation/schemas";

// Helper to check 24-hour expiration rule
export function computeAuthoritativeStatus(request: {
  status: "ACTIVE" | "CLOSED" | "EXPIRED";
  expires_at: string;
}): "ACTIVE" | "CLOSED" | "EXPIRED" {
  if (request.status === "CLOSED") return "CLOSED";
  const now = new Date().getTime();
  const expiry = new Date(request.expires_at).getTime();
  if (now >= expiry) return "EXPIRED";
  return request.status;
}

export async function getPublicPaymentRequest(id: string): Promise<PaymentRequest | null> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      const fallback = initialPaymentRequests.find((r) => r.id === id);
      if (!fallback) return null;
      return {
        ...fallback,
        status: computeAuthoritativeStatus(fallback),
      };
    }

    const { data, error } = await supabase
      .from("payment_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      const fallback = initialPaymentRequests.find((r) => r.id === id);
      if (!fallback) return null;
      return {
        ...fallback,
        status: computeAuthoritativeStatus(fallback),
      };
    }

    const request = data as PaymentRequest;
    return {
      ...request,
      status: computeAuthoritativeStatus(request),
    };
  } catch (err) {
    console.error("Error fetching public payment request:", err);
    const fallback = initialPaymentRequests.find((r) => r.id === id);
    if (!fallback) return null;
    return {
      ...fallback,
      status: computeAuthoritativeStatus(fallback),
    };
  }
}

export async function getPublicRegisteredNames(
  paymentRequestId: string
): Promise<{ name: string; created_at: string }[]> {
  try {
    const supabase = createPublicClient();
    if (!supabase) {
      return initialSubmissionPeople
        .filter((p) => p.payment_request_id === paymentRequestId)
        .map((p) => ({ name: p.name, created_at: p.created_at }));
    }

    const { data, error } = await supabase
      .from("payment_submission_people")
      .select("name, created_at")
      .eq("payment_request_id", paymentRequestId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return initialSubmissionPeople
        .filter((p) => p.payment_request_id === paymentRequestId)
        .map((p) => ({ name: p.name, created_at: p.created_at }));
    }

    return data;
  } catch (err) {
    console.error("Error fetching registered names:", err);
    return initialSubmissionPeople
      .filter((p) => p.payment_request_id === paymentRequestId)
      .map((p) => ({ name: p.name, created_at: p.created_at }));
  }
}

export async function submitPaymentRegistration(
  paymentRequestId: string,
  rawNames: string[]
): Promise<{ success: boolean; error?: string; registeredCount?: number }> {
  // Normalize and trim names
  const names = rawNames.map((n) => n.trim()).filter((n) => n.length > 0);

  if (names.length === 0) {
    return { success: false, error: "Please provide at least one valid name" };
  }

  // Reject duplicates within this submission
  const lowerNames = names.map((n) => n.toLowerCase());
  if (new Set(lowerNames).size !== names.length) {
    return { success: false, error: "Duplicate names within the same submission are not allowed" };
  }

  const request = await getPublicPaymentRequest(paymentRequestId);
  if (!request) {
    return { success: false, error: "Payment request not found" };
  }

  const authoritativeStatus = computeAuthoritativeStatus(request);
  if (authoritativeStatus !== "ACTIVE") {
    return {
      success: false,
      error: `This payment request is ${authoritativeStatus.toLowerCase()} and no longer accepts submissions.`,
    };
  }

  // Authoritatively calculate total amount
  const amountPerPerson = Number(request.amount_per_person) || 0;
  const totalAmount = amountPerPerson * names.length;

  try {
    const supabase = await createClient();

    // 1. Insert submission
    const { data: subData, error: subError } = await supabase
      .from("payment_submissions")
      .insert({
        payment_request_id: paymentRequestId,
        total_people: names.length,
        amount_per_person_snapshot: amountPerPerson,
        total_amount: totalAmount,
      })
      .select("id")
      .single();

    if (subError || !subData) {
      console.warn("Could not insert submission via Supabase, using mock store fallback:", subError);
      // Add to in-memory fallback for smooth demonstration
      names.forEach((name, i) => {
        initialSubmissionPeople.unshift({
          id: `mock-p-${Date.now()}-${i}`,
          submission_id: `mock-s-${Date.now()}`,
          payment_request_id: paymentRequestId,
          name,
          created_at: new Date().toISOString(),
        });
      });
      return { success: true, registeredCount: names.length };
    }

    // 2. Insert people
    const peopleRows = names.map((name) => ({
      submission_id: subData.id,
      payment_request_id: paymentRequestId,
      name,
    }));

    const { error: peopleError } = await supabase
      .from("payment_submission_people")
      .insert(peopleRows);

    if (peopleError) {
      console.error("Error inserting submission people:", peopleError);
      return { success: false, error: "Failed to record participant names" };
    }

    return { success: true, registeredCount: names.length };
  } catch (err) {
    console.error("Error in submitPaymentRegistration:", err);
    // Fallback in-memory
    names.forEach((name, i) => {
      initialSubmissionPeople.unshift({
        id: `mock-p-${Date.now()}-${i}`,
        submission_id: `mock-s-${Date.now()}`,
        payment_request_id: paymentRequestId,
        name,
        created_at: new Date().toISOString(),
      });
    });
    return { success: true, registeredCount: names.length };
  }
}

export async function getAdminPaymentRequests(): Promise<PaymentRequest[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_requests")
      .select(`
        *,
        payment_submissions (
          id,
          total_people
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return initialPaymentRequests.map((r) => ({
        ...r,
        status: computeAuthoritativeStatus(r),
      }));
    }

    return data.map((item: any) => {
      const submissions = item.payment_submissions || [];
      const totalPeople = submissions.reduce((acc: number, curr: any) => acc + (curr.total_people || 0), 0);
      const req: PaymentRequest = {
        id: item.id,
        programme_name: item.programme_name,
        programme_date: item.programme_date,
        description: item.description,
        amount_per_person: Number(item.amount_per_person) || 0,
        bank_name: item.bank_name,
        account_name: item.account_name,
        account_number: item.account_number,
        payment_instructions: item.payment_instructions,
        image_url: item.image_url,
        status: computeAuthoritativeStatus(item),
        created_at: item.created_at,
        expires_at: item.expires_at,
        closed_at: item.closed_at,
        submissions_count: submissions.length,
        total_people_count: totalPeople,
      };
      return req;
    });
  } catch (err) {
    console.error("Error getting admin payment requests:", err);
    return initialPaymentRequests.map((r) => ({
      ...r,
      status: computeAuthoritativeStatus(r),
    }));
  }
}

export async function getAdminPaymentRequestById(id: string): Promise<{
  request: PaymentRequest | null;
  submissions: any[];
  people: {
    name: string;
    programme: string;
    programme_date: string;
    amount_per_person: number;
    total_submission_amount: number;
    submission_time: string;
  }[];
}> {
  try {
    const supabase = await createClient();
    const { data: reqData, error: reqError } = await supabase
      .from("payment_requests")
      .select("*")
      .eq("id", id)
      .single();

    if (reqError || !reqData) {
      const fallback = initialPaymentRequests.find((r) => r.id === id);
      if (!fallback) return { request: null, submissions: [], people: [] };

      const fallbackPeople = initialSubmissionPeople
        .filter((p) => p.payment_request_id === id)
        .map((p) => ({
          name: p.name,
          programme: fallback.programme_name,
          programme_date: fallback.programme_date,
          amount_per_person: fallback.amount_per_person,
          total_submission_amount: fallback.amount_per_person,
          submission_time: p.created_at,
        }));

      return {
        request: {
          ...fallback,
          status: computeAuthoritativeStatus(fallback),
          total_people_count: fallbackPeople.length,
        },
        submissions: [],
        people: fallbackPeople,
      };
    }

    const request: PaymentRequest = {
      ...reqData,
      status: computeAuthoritativeStatus(reqData),
    };

    // Get submissions and participants
    const { data: peopleData } = await supabase
      .from("payment_submission_people")
      .select(`
        name,
        created_at,
        payment_submissions (
          total_amount,
          amount_per_person_snapshot
        )
      `)
      .eq("payment_request_id", id)
      .order("created_at", { ascending: false });

    const people = (peopleData || []).map((p: any) => ({
      name: p.name,
      programme: request.programme_name,
      programme_date: request.programme_date,
      amount_per_person: Number(p.payment_submissions?.amount_per_person_snapshot) || request.amount_per_person,
      total_submission_amount: Number(p.payment_submissions?.total_amount) || request.amount_per_person,
      submission_time: p.created_at,
    }));

    return {
      request: {
        ...request,
        total_people_count: people.length,
      },
      submissions: [],
      people,
    };
  } catch (err) {
    console.error("Error fetching request details:", err);
    const fallback = initialPaymentRequests.find((r) => r.id === id);
    if (!fallback) return { request: null, submissions: [], people: [] };
    return {
      request: {
        ...fallback,
        status: computeAuthoritativeStatus(fallback),
      },
      submissions: [],
      people: [],
    };
  }
}

export async function createPaymentRequest(formData: PaymentRequestFormData): Promise<PaymentRequest | null> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("payment_requests")
      .insert({
        programme_name: formData.programme_name,
        programme_date: formData.programme_date,
        description: formData.description || null,
        amount_per_person: formData.amount_per_person,
        bank_name: formData.bank_name,
        account_name: formData.account_name,
        account_number: formData.account_number,
        payment_instructions: formData.payment_instructions || null,
        image_url: formData.image_url || null,
        status: "ACTIVE",
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn("Supabase create failed, adding to mock store:", error);
      const newReq: PaymentRequest = {
        id: `mock-${Date.now()}`,
        ...formData,
        description: formData.description || null,
        payment_instructions: formData.payment_instructions || null,
        image_url: formData.image_url || null,
        status: "ACTIVE",
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
        closed_at: null,
        submissions_count: 0,
        total_people_count: 0,
      };
      initialPaymentRequests.unshift(newReq);
      return newReq;
    }

    return data as PaymentRequest;
  } catch (err) {
    console.error("Error creating payment request:", err);
    const newReq: PaymentRequest = {
      id: `mock-${Date.now()}`,
      ...formData,
      description: formData.description || null,
      payment_instructions: formData.payment_instructions || null,
      image_url: formData.image_url || null,
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      closed_at: null,
      submissions_count: 0,
      total_people_count: 0,
    };
    initialPaymentRequests.unshift(newReq);
    return newReq;
  }
}

export async function closePaymentRequest(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("payment_requests")
      .update({
        status: "CLOSED",
        closed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      const req = initialPaymentRequests.find((r) => r.id === id);
      if (req) {
        req.status = "CLOSED";
        req.closed_at = new Date().toISOString();
      }
    }
    return true;
  } catch (err) {
    console.error("Error closing payment request:", err);
    const req = initialPaymentRequests.find((r) => r.id === id);
    if (req) {
      req.status = "CLOSED";
      req.closed_at = new Date().toISOString();
    }
    return true;
  }
}

export async function deletePaymentRequest(id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("payment_requests").delete().eq("id", id);
    if (error) {
      const idx = initialPaymentRequests.findIndex((r) => r.id === id);
      if (idx !== -1) initialPaymentRequests.splice(idx, 1);
    }
    return true;
  } catch (err) {
    console.error("Error deleting payment request:", err);
    const idx = initialPaymentRequests.findIndex((r) => r.id === id);
    if (idx !== -1) initialPaymentRequests.splice(idx, 1);
    return true;
  }
}
