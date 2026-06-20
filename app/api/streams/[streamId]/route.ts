import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prismaClient } from "@/app/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { streamId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
    }

    const { streamId } = params;
    if (!streamId) {
      return NextResponse.json({ message: "Missing streamId parameter" }, { status: 400 });
    }

    // Verify stream exists and belongs to/is managed in the user's scope
    const stream = await prismaClient.stream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      return NextResponse.json({ message: "Stream not found" }, { status: 404 });
    }

    // Delete stream
    await prismaClient.stream.delete({
      where: { id: streamId },
    });

    return NextResponse.json({ message: "Stream deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting stream:", error);
    return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
  }
}
