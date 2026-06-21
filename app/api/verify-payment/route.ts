import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prismaClient } from "@/app/lib/db";
import { triggerEvent } from "@/app/lib/pusher";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
    }

    const { paymentId, orderId, signature, videoId, amount } = await req.json();

    if (!paymentId || !orderId || !signature || !videoId || !amount) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      return NextResponse.json({ message: "Signature verification failed" }, { status: 400 });
    }

    // Find internal user
    const dbUser = await prismaClient.user.findUnique({
      where: { email: session.user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found in database" }, { status: 404 });
    }

    // Get the stream to find the owner/creator
    const stream = await prismaClient.stream.findUnique({
      where: { id: videoId },
      select: { userId: true },
    });

    if (!stream) {
      return NextResponse.json({ message: "Stream not found" }, { status: 404 });
    }

    // Create the payment record with COMPLETED status
    await prismaClient.payment.create({
      data: {
        amount: Number(amount),
        currency: "INR",
        status: "COMPLETED",
        razorpayId: paymentId,
        streamId: videoId,
        userId: dbUser.id,
      },
    });

    // Trigger real-time update to notify creator and audience
    await triggerEvent(`creator-${stream.userId}`, "queue-updated", {
      action: "payment-completed",
      streamId: videoId,
    });

    return NextResponse.json({ success: true, message: "Payment verified and recorded" });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
