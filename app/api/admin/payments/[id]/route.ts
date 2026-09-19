import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAdminPaymentRequestById,
  closePaymentRequest,
  deletePaymentRequest,
} from "@/lib/supabase/payments";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const data = await getAdminPaymentRequestById(id);

    if (!data.request) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Admin payment [id] GET error:", err);
    return NextResponse.json({ error: "Failed to fetch payment details" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    if (body.action === "close") {
      await closePaymentRequest(id);
      return NextResponse.json({ success: true, message: "Payment request closed successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Admin payment [id] PATCH error:", err);
    return NextResponse.json({ error: "Failed to update payment request" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    await deletePaymentRequest(id);

    return NextResponse.json({ success: true, message: "Payment request deleted successfully" });
  } catch (err) {
    console.error("Admin payment [id] DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete payment request" }, { status: 500 });
  }
}
