import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { triggerEvent } from "@/app/lib/pusher";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ message: "Unauthenticated" }, { status: 403 });
    }

    const isPriority = req.nextUrl.searchParams.get("isPriority") === "true";

    try {
        // Find the user first
        const dbUser = await prismaClient.user.findUnique({
            where: { email: session.user.email },
        });

        if (!dbUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Get the next stream based on priority flag
        const userWithNextStream = await prismaClient.user.findUnique({
            where: {
                id: dbUser.id,
            },
            select: {
                id: true,
                streams: {
                    where: isPriority 
                      ? {
                          payment: {
                              status: "COMPLETED",
                          },
                        }
                      : {
                          OR: [
                              { payment: null },
                              { payment: { status: { not: "COMPLETED" } } },
                          ],
                        },
                    orderBy: isPriority 
                      ? [
                          {
                            payment: {
                              amount: "desc",
                            },
                          },
                          {
                            createAt: "asc",
                          }
                        ]
                      : [
                          {
                            upvotes: {
                              _count: "desc",
                            },
                          },
                          {
                            createAt: "asc",
                          }
                        ],
                    take: 1,
                },
            },
        });

        if (!userWithNextStream || userWithNextStream.streams.length === 0) {
            return NextResponse.json({ message: "No streams available to play." }, { status: 404 });
        }

        const nextStream = userWithNextStream.streams[0];

        // Use transaction to ensure both operations (upsert and delete) happen atomically
        await prismaClient.$transaction([
            prismaClient.currentStream.upsert({
                where: { id: userWithNextStream.id },
                update: { streamId: nextStream.id },
                create: { 
                    id: userWithNextStream.id, // Explicitly set id to user ID for future upserts
                    userId: userWithNextStream.id, 
                    streamId: nextStream.id 
                },
            }),
            prismaClient.stream.delete({
                where: { id: nextStream.id },
            }),
        ]);

        // Trigger real-time update to notify creator and audience
        await triggerEvent(`creator-${userWithNextStream.id}`, "queue-updated", {
            action: "play-next",
            streamId: nextStream.id,
        });

        return NextResponse.json({ stream: nextStream }, { status: 200 });
    } catch (error) {
        console.error("Error executing database operations:", error);
        return NextResponse.json(
            { error: "An error occurred while processing your request." },
            { status: 500 }
        );
    }
}
